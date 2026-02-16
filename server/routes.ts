import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertAccountSchema, insertFundSchema, insertAccountingPeriodSchema, insertApiProviderSchema, insertApiServiceMappingSchema } from "@shared/schema";
import { registerExternalApi, forwardOrderToProvider, generateApiToken } from "./external-api";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage_multer });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Maintenance mode middleware
  app.use("/api", async (req, res, next) => {
    if (req.path === "/user" || req.path === "/login" || req.path === "/register" || req.path === "/logout" || req.path.startsWith("/admin") || req.path === "/settings") {
      return next();
    }
    if (req.user?.role === "admin") return next();
    const settingsData = await storage.getSettings();
    if (settingsData?.maintenanceEnabled) {
      return res.status(503).json({ message: settingsData.maintenanceMessage || "النظام تحت الصيانة حالياً" });
    }
    next();
  });

  // Serve uploads folder
  app.use("/uploads", express.static("uploads"));

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("No file uploaded");
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // === Categories ===
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post(api.categories.create.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  });

  app.patch("/api/categories/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { name, icon, image } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (image !== undefined) updateData.image = image;
    const category = await storage.updateCategory(Number(req.params.id), updateData);
    res.json(category);
  });

  app.delete(api.categories.delete.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteCategory(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Service Groups ===
  app.get("/api/service-groups", async (req, res) => {
    const groups = await storage.getServiceGroups();
    res.json(groups);
  });

  app.post("/api/service-groups", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const group = await storage.createServiceGroup(req.body);
    res.status(201).json(group);
  });

  app.delete("/api/service-groups/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteServiceGroup(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Services ===
  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.post(api.services.create.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const service = await storage.createService(req.body);
    res.status(201).json(service);
  });

  app.delete(api.services.delete.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteService(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Orders ===
  app.post(api.orders.create.path, async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const orderData = api.orders.create.input.parse(req.body);
    const payWithBalance = req.body.payWithBalance === true;

    if (payWithBalance) {
      const service = await storage.getService(orderData.serviceId);
      if (!service) return res.status(404).json({ message: "الخدمة غير موجودة" });
      const user = await storage.getUser(req.user.id);
      if (!user || (user.balance || 0) < service.price) {
        return res.status(400).json({ message: "رصيدك غير كافي. رصيدك الحالي: " + ((user?.balance || 0).toLocaleString()) + " ر.ي" });
      }
      await storage.updateUserBalance(req.user.id, (user.balance || 0) - service.price);
    }

    const order = await storage.createOrder({
      ...orderData,
      userId: req.user.id,
      status: "pending"
    });

    try {
      const service = await storage.getService(orderData.serviceId);
      const allUsers = await storage.getAllUsers();
      const admins = allUsers.filter(u => u.role === "admin");
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "order",
          title: "طلب جديد",
          message: `طلب جديد #${order.id} من ${req.user.fullName} - ${service?.name || 'خدمة'}`,
          relatedOrderId: order.id,
        });
      }
    } catch (e) {
      console.error("Failed to notify admins:", e);
    }

    res.status(201).json(order);
  });

  app.get(api.orders.listMyOrders.path, async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const orders = await storage.getUserOrders(req.user.id);
    res.json(orders);
  });

  app.get(api.orders.listAll.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const status = req.query.status as string | undefined;
    const orders = await storage.getAllOrders(status);
    res.json(orders);
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { status, rejectionReason } = req.body;
    const existingOrder = await storage.getOrder(Number(req.params.id));
    if (!existingOrder) return res.status(404).json({ message: "الطلب غير موجود" });
    const previousStatus = existingOrder.status;
    const order = await storage.updateOrderStatus(Number(req.params.id), status, rejectionReason);

    try {
      const service = await storage.getService(order.serviceId);
      const serviceName = service?.name || `#${order.serviceId}`;
      const statusMessages: Record<string, { title: string; message: string; type: string }> = {
        pending: { title: "تم إعادة طلبك", message: `طلبك رقم #${order.id} (${serviceName}) تمت إعادته للمعالجة`, type: "info" },
        processing: { title: "جاري تنفيذ طلبك", message: `طلبك رقم #${order.id} (${serviceName}) قيد التنفيذ الآن`, type: "info" },
        completed: { title: "تم تنفيذ طلبك بنجاح", message: `طلبك رقم #${order.id} (${serviceName}) تم تنفيذه بنجاح`, type: "success" },
        rejected: { title: "تم رفض طلبك", message: `طلبك رقم #${order.id} (${serviceName}) تم رفضه${rejectionReason ? ': ' + rejectionReason : ''}`, type: "error" },
      };
      const msg = statusMessages[status];
      if (msg) {
        await storage.createNotification({
          userId: order.userId,
          type: msg.type,
          title: msg.title,
          message: msg.message,
          relatedOrderId: order.id,
        });
      }
    } catch (e) {
      console.error("Failed to create notification:", e);
    }

    if (status === "pending" && previousStatus === "rejected") {
      try {
        const service = await storage.getService(order.serviceId);
        if (service) {
          const user = await storage.getUser(order.userId);
          if (user) {
            const newBalance = (user.balance || 0) - service.price;
            await storage.updateUserBalance(order.userId, newBalance);
            await storage.createNotification({
              userId: order.userId,
              type: "info",
              title: "تم خصم الرصيد",
              message: `تم خصم ${service.price.toLocaleString()} ر.ي من رصيدك لإعادة معالجة الطلب #${order.id}. رصيدك الحالي: ${newBalance.toLocaleString()} ر.ي`,
            });
          }
        }
      } catch (e) {
        console.error("Failed to re-deduct balance on reset:", e);
      }
    }

    if (status === "rejected") {
      try {
        const service = await storage.getService(order.serviceId);
        if (service) {
          const user = await storage.getUser(order.userId);
          if (user) {
            const newBalance = (user.balance || 0) + service.price;
            await storage.updateUserBalance(order.userId, newBalance);
            await storage.createNotification({
              userId: order.userId,
              type: "success",
              title: "تم استرداد رصيدك",
              message: `تم إرجاع ${service.price.toLocaleString()} ر.ي إلى رصيدك بسبب رفض الطلب #${order.id}. رصيدك الحالي: ${newBalance.toLocaleString()} ر.ي`,
            });
          }
        }
      } catch (e) {
        console.error("Failed to refund balance on rejection:", e);
      }
    }

    if (status === "processing") {
      try {
        const mappings = await storage.getApiServiceMappingByLocalService(order.serviceId);
        if (mappings && mappings.length > 0) {
          const result = await forwardOrderToProvider(order.id, order.serviceId, order.userInputId);
          if (result.success) {
            console.log(`Order ${order.id} forwarded to provider successfully`);
          } else {
            console.warn(`Order ${order.id} forwarding failed: ${result.message}`);
          }
        }
      } catch (e) {
        console.error("Failed to forward order to provider:", e);
      }
    }

    if (status === "completed") {
      try {
        const service = await storage.getService(order.serviceId);
        if (service) {
          const allAccounts = await storage.getAccounts();
          const revenueAccount = allAccounts.find(a => a.code === "4100");
          const cashAccount = allAccounts.find(a => a.code === "1101");

          if (revenueAccount && cashAccount) {
            const now = new Date();
            let period = await storage.getOpenPeriod(now.getFullYear(), now.getMonth() + 1);
            if (!period) {
              period = await storage.createAccountingPeriod({
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                periodType: "monthly",
                status: "open",
              });
            }

            if (period.status === "open") {
              const entryNumber = await storage.getNextEntryNumber();
              const amount = String(service.price);
              await storage.createJournalEntry(
                {
                  entryNumber,
                  entryDate: new Date(),
                  description: `إيراد طلب #${order.id} - ${service.name}`,
                  sourceType: "order",
                  sourceId: order.id,
                  periodId: period.id,
                  totalDebit: amount,
                  totalCredit: amount,
                  createdBy: req.user!.id,
                },
                [
                  { entryId: 0, accountId: cashAccount.id, debit: amount, credit: "0" },
                  { entryId: 0, accountId: revenueAccount.id, debit: "0", credit: amount },
                ]
              );
            } else {
              console.warn(`Period ${period.id} is closed, skipping auto journal entry for order ${order.id}`);
            }
          } else {
            console.warn("Missing revenue or cash account for auto journal entry");
          }
        }
      } catch (e) {
        console.error("Failed to create auto journal entry:", e);
      }
    }

    res.json(order);
  });

  // === Banks ===
  app.get(api.banks.list.path, async (req, res) => {
    const banks = await storage.getBanks();
    res.json(banks);
  });

  app.post(api.banks.create.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const bank = await storage.createBank(req.body);
    res.status(201).json(bank);
  });

  app.patch("/api/banks/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { bankName, accountName, accountNumber, note } = req.body;
    const updateData: any = {};
    if (bankName !== undefined) updateData.bankName = bankName;
    if (accountName !== undefined) updateData.accountName = accountName;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (note !== undefined) updateData.note = note;
    const bank = await storage.updateBank(Number(req.params.id), updateData);
    res.json(bank);
  });

  app.delete(api.banks.delete.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteBank(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Ads ===
  app.get(api.ads.list.path, async (req, res) => {
    const ads = await storage.getAds();
    res.json(ads);
  });

  app.post(api.ads.create.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const ad = await storage.createAd(req.body);
    res.status(201).json(ad);
  });

  app.patch("/api/ads/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { text, icon, active, imageUrl, linkUrl, adType } = req.body;
    const updateData: any = {};
    if (text !== undefined) updateData.text = text;
    if (icon !== undefined) updateData.icon = icon;
    if (active !== undefined) updateData.active = active;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (adType !== undefined) updateData.adType = adType;
    const ad = await storage.updateAd(Number(req.params.id), updateData);
    res.json(ad);
  });

  app.delete(api.ads.delete.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteAd(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Users Management ===
  app.get("/api/admin/users", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ ...u, password: undefined })));
  });

  app.post("/api/admin/users/:id/add-balance", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const userId = Number(req.params.id);
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: "المبلغ غير صحيح" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    const newBalance = (user.balance || 0) + Number(amount);
    const updated = await storage.updateUserBalance(userId, newBalance);
    try {
      await storage.createNotification({
        userId: userId,
        type: "success",
        title: "تم شحن رصيدك",
        message: `تم إضافة ${Number(amount).toLocaleString()} ر.ي إلى رصيدك. رصيدك الحالي: ${newBalance.toLocaleString()} ر.ي`,
      });
      await storage.createAdminActivityLog({
        userId: req.user.id,
        action: "شحن رصيد",
        details: `شحن ${amount} ر.ي للمستخدم ${user.fullName}`,
        targetType: "user",
        targetId: userId,
      });
    } catch (e) { console.error(e); }
    res.json(updated);
  });

  app.post("/api/admin/users/:id/reset-password", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const userId = Number(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUserPassword(userId, hashedPassword);
    try {
      await storage.createNotification({
        userId,
        type: "info",
        title: "تم تغيير كلمة المرور",
        message: "قام المدير بإعادة تعيين كلمة المرور الخاصة بك. تواصل مع الإدارة للحصول على كلمة المرور الجديدة.",
      });
      await storage.createAdminActivityLog({
        userId: req.user.id,
        action: "إعادة تعيين كلمة مرور",
        details: `إعادة تعيين كلمة مرور المستخدم ${user.fullName}`,
        targetType: "user",
        targetId: userId,
      });
    } catch (e) { console.error(e); }
    res.json({ success: true, message: "تم إعادة تعيين كلمة المرور بنجاح" });
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { role, balance, active, fullName, email } = req.body;
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (balance !== undefined) updateData.balance = balance;
    if (active !== undefined) updateData.active = active;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    try {
      const existingUser = await storage.getUser(Number(req.params.id));
      const user = await storage.updateUser(Number(req.params.id), updateData);

      if (active === true && existingUser && !existingUser.active) {
        await storage.createNotification({
          userId: user.id,
          type: "success",
          title: "تم تفعيل حسابك",
          message: "تمت الموافقة على حسابك من قبل الإدارة. يمكنك الآن تسجيل الدخول واستخدام المتجر.",
        });
      }

      res.json({ ...user, password: undefined });
    } catch (e: any) {
      if (e.code === "23505" && e.constraint?.includes("email")) {
        return res.status(400).json({ message: "هذا البريد الإلكتروني مستخدم بالفعل" });
      }
      throw e;
    }
  });

  // === Deposit Requests ===
  app.post("/api/deposit-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { amount, receiptUrl } = req.body;
    if (!amount || !receiptUrl) return res.status(400).json({ message: "المبلغ وصورة الإشعار مطلوبان" });
    const deposit = await storage.createDepositRequest({
      userId: req.user!.id,
      amount: Number(amount),
      receiptUrl,
      status: "pending",
    });
    try {
      const allUsers = await storage.getAllUsers();
      const admins = allUsers.filter(u => u.role === "admin");
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          type: "order",
          title: "طلب تغذية رصيد جديد",
          message: `المستخدم ${req.user!.fullName} طلب تغذية رصيد بمبلغ ${Number(amount).toLocaleString()} ر.ي`,
        });
      }
    } catch (e) { console.error(e); }
    res.status(201).json(deposit);
  });

  app.get("/api/deposit-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const deposits = await storage.getUserDepositRequests(req.user!.id);
    res.json(deposits);
  });

  app.get("/api/admin/deposit-requests", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const status = req.query.status as string | undefined;
    const deposits = await storage.getDepositRequests(status);
    res.json(deposits);
  });

  app.patch("/api/admin/deposit-requests/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const id = Number(req.params.id);
    const { status, approvedAmount, fundId, rejectionReason, notes } = req.body;

    if (status === "approved") {
      if (!approvedAmount || !fundId) {
        return res.status(400).json({ message: "المبلغ والصندوق مطلوبان للموافقة" });
      }
      const deposit = await storage.updateDepositRequest(id, {
        status: "approved",
        approvedAmount: Number(approvedAmount),
        fundId: Number(fundId),
        approvedBy: req.user!.id,
        updatedAt: new Date(),
        notes,
      });

      const user = await storage.getUser(deposit.userId);
      if (user) {
        const newBalance = (user.balance || 0) + Number(approvedAmount);
        await storage.updateUserBalance(deposit.userId, newBalance);

        await storage.createNotification({
          userId: deposit.userId,
          type: "success",
          title: "تمت الموافقة على طلب التغذية",
          message: `تم إضافة ${Number(approvedAmount).toLocaleString()} ر.ي إلى رصيدك. رصيدك الحالي: ${newBalance.toLocaleString()} ر.ي`,
        });

        try {
          const allAccounts = await storage.getAccounts();
          const cashAccount = allAccounts.find(a => a.code === "1101");
          const customerDepositAccount = allAccounts.find(a => a.code === "2100") || allAccounts.find(a => a.type === "liability");
          if (cashAccount && customerDepositAccount) {
            const now = new Date();
            let period = await storage.getOpenPeriod(now.getFullYear(), now.getMonth() + 1);
            if (!period) {
              period = await storage.createAccountingPeriod({ year: now.getFullYear(), month: now.getMonth() + 1, periodType: "monthly", status: "open" });
            }
            if (period.status === "open") {
              const entryNumber = await storage.getNextEntryNumber();
              const amount = String(approvedAmount);
              await storage.createJournalEntry(
                { entryNumber, entryDate: new Date(), description: `تغذية رصيد ${user.fullName} - طلب #${id}`, sourceType: "deposit", sourceId: id, periodId: period.id, totalDebit: amount, totalCredit: amount, createdBy: req.user!.id },
                [
                  { entryId: 0, accountId: cashAccount.id, debit: amount, credit: "0", fundId: Number(fundId) },
                  { entryId: 0, accountId: customerDepositAccount.id, debit: "0", credit: amount },
                ]
              );
              await storage.createFundTransaction({ fundId: Number(fundId), transactionType: "deposit", amount, description: `تغذية رصيد ${user.fullName}`, relatedEntryId: null });
            }
          }
        } catch (e) { console.error("Failed to create deposit journal entry:", e); }

        await storage.createAdminActivityLog({
          userId: req.user!.id,
          action: "موافقة على تغذية رصيد",
          details: `موافقة على تغذية ${approvedAmount} ر.ي للمستخدم ${user.fullName}`,
          targetType: "deposit",
          targetId: id,
        });
      }
      res.json(deposit);
    } else if (status === "rejected") {
      const deposit = await storage.updateDepositRequest(id, {
        status: "rejected",
        rejectionReason,
        updatedAt: new Date(),
      });
      const user = await storage.getUser(deposit.userId);
      if (user) {
        await storage.createNotification({
          userId: deposit.userId,
          type: "error",
          title: "تم رفض طلب التغذية",
          message: rejectionReason ? `سبب الرفض: ${rejectionReason}` : "تم رفض طلب تغذية الرصيد",
        });
      }
      res.json(deposit);
    } else {
      res.status(400).json({ message: "حالة غير صحيحة" });
    }
  });

  // === VIP Groups ===
  app.get("/api/vip-groups", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const groups = await storage.getVipGroups();
    res.json(groups);
  });

  app.post("/api/vip-groups", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const group = await storage.createVipGroup(req.body);
    res.status(201).json(group);
  });

  app.patch("/api/vip-groups/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const group = await storage.updateVipGroup(Number(req.params.id), req.body);
    res.json(group);
  });

  app.delete("/api/vip-groups/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteVipServiceDiscountsByGroup(Number(req.params.id));
    await storage.deleteVipGroup(Number(req.params.id));
    res.sendStatus(204);
  });

  app.get("/api/vip-groups/:id/discounts", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const discounts = await storage.getVipServiceDiscounts(Number(req.params.id));
    res.json(discounts);
  });

  app.post("/api/vip-groups/:id/discounts", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { serviceId, discountPercent } = req.body;
    const discount = await storage.createVipServiceDiscount({
      vipGroupId: Number(req.params.id),
      serviceId: Number(serviceId),
      discountPercent: String(discountPercent),
    });
    res.status(201).json(discount);
  });

  app.delete("/api/vip-discounts/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteVipServiceDiscount(Number(req.params.id));
    res.sendStatus(204);
  });

  app.patch("/api/admin/users/:id/vip-group", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { vipGroupId } = req.body;
    const user = await storage.updateUser(Number(req.params.id), { vipGroupId: vipGroupId || null });
    res.json({ ...user, password: undefined });
  });

  app.get("/api/user/prices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.vipGroupId) {
      return res.json({ discounts: {} });
    }
    const groupDiscounts = await storage.getVipServiceDiscounts(user.vipGroupId);
    const vipGroup = await storage.getVipGroup(user.vipGroupId);
    res.json({
      globalDiscount: vipGroup?.globalDiscount || "0",
      discounts: Object.fromEntries(groupDiscounts.map(d => [d.serviceId, d.discountPercent])),
    });
  });

  // === Maintenance Toggle ===
  app.post("/api/admin/maintenance/toggle", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { enabled, message } = req.body;
    const updated = await storage.updateSettings({
      maintenanceEnabled: enabled,
      maintenanceMessage: message || "النظام تحت الصيانة حالياً، يرجى المحاولة لاحقاً",
    });
    if (enabled) {
      try {
        const allUsers = await storage.getAllUsers();
        for (const u of allUsers.filter(u => u.role !== "admin")) {
          await storage.createNotification({
            userId: u.id,
            type: "info",
            title: "إشعار صيانة",
            message: message || "النظام تحت الصيانة حالياً، يرجى المحاولة لاحقاً",
          });
        }
      } catch (e) { console.error(e); }
    }
    res.json(updated);
  });

  // === Admin User Currency ===
  app.patch("/api/admin/users/:id/currency", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { currency } = req.body;
    if (!["YER", "USD"].includes(currency)) return res.status(400).json({ message: "عملة غير صحيحة" });
    const user = await storage.updateUser(Number(req.params.id), { currency });
    res.json({ ...user, password: undefined });
  });

  // === Service Group & Service Toggle ===
  app.patch("/api/service-groups/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { active, name, note, image, inputType } = req.body;
    const updateData: any = {};
    if (active !== undefined) updateData.active = active;
    if (name !== undefined) updateData.name = name;
    if (note !== undefined) updateData.note = note;
    if (image !== undefined) updateData.image = image;
    if (inputType !== undefined) updateData.inputType = inputType;
    const group = await storage.updateServiceGroup(Number(req.params.id), updateData);
    res.json(group);
  });

  app.patch("/api/services/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const { active, name, price } = req.body;
    const updateData: any = {};
    if (active !== undefined) updateData.active = active;
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    const service = await storage.updateService(Number(req.params.id), updateData);
    res.json(service);
  });

  // === Settings ===
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings || {});
  });

  app.post(api.settings.update.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  });

  // === Register External API (public API for partners) ===
  registerExternalApi(app);

  // === API Providers Management ===
  app.get("/api/admin/api-providers", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const providers = await storage.getApiProviders();
    res.json(providers);
  });

  app.post("/api/admin/api-providers", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const parsed = insertApiProviderSchema.parse(req.body);
      const provider = await storage.createApiProvider(parsed);
      res.status(201).json(provider);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/api-providers/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const provider = await storage.updateApiProvider(Number(req.params.id), req.body);
    res.json(provider);
  });

  app.delete("/api/admin/api-providers/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteApiProvider(Number(req.params.id));
    res.sendStatus(204);
  });

  app.post("/api/admin/api-providers/:id/test", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const provider = await storage.getApiProvider(Number(req.params.id));
      if (!provider) return res.status(404).json({ message: "Provider not found" });

      const formData = new URLSearchParams();
      formData.append("request", "balance");

      const headers: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
      if (provider.username && provider.password) {
        headers["Authorization"] = "Basic " + Buffer.from(`${provider.username}:${provider.password}`).toString("base64");
      } else if (provider.apiToken) {
        headers["Authorization"] = `Bearer ${provider.apiToken}`;
      }

      const response = await fetch(provider.baseUrl, { method: "POST", headers, body: formData });
      const data = await response.json();

      if (data.status && data.balance !== undefined) {
        await storage.updateApiProvider(provider.id, { balance: String(data.balance) });
      }

      res.json({ success: data.status === true, data });
    } catch (e: any) {
      res.json({ success: false, error: e.message });
    }
  });

  app.post("/api/admin/api-providers/:id/sync-services", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const provider = await storage.getApiProvider(Number(req.params.id));
      if (!provider) return res.status(404).json({ message: "Provider not found" });

      const formData = new URLSearchParams();
      formData.append("request", "servicelist");

      const headers: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
      if (provider.username && provider.password) {
        headers["Authorization"] = "Basic " + Buffer.from(`${provider.username}:${provider.password}`).toString("base64");
      } else if (provider.apiToken) {
        headers["Authorization"] = `Bearer ${provider.apiToken}`;
      }

      const response = await fetch(provider.baseUrl, { method: "POST", headers, body: formData });
      const data = await response.json();

      if (data.status && data.ServiceList) {
        res.json({ success: true, services: data.ServiceList });
      } else {
        res.json({ success: false, message: data.message || "Failed to fetch services" });
      }
    } catch (e: any) {
      res.json({ success: false, error: e.message });
    }
  });

  // === API Service Mappings ===
  app.get("/api/admin/api-mappings", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const providerId = req.query.providerId ? Number(req.query.providerId) : undefined;
    const mappings = await storage.getApiServiceMappings(providerId);
    res.json(mappings);
  });

  app.post("/api/admin/api-mappings", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const parsed = insertApiServiceMappingSchema.parse(req.body);
      const mapping = await storage.createApiServiceMapping(parsed);
      res.status(201).json(mapping);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/api-mappings/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const mapping = await storage.updateApiServiceMapping(Number(req.params.id), req.body);
    res.json(mapping);
  });

  app.delete("/api/admin/api-mappings/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteApiServiceMapping(Number(req.params.id));
    res.sendStatus(204);
  });

  // === API Order Logs ===
  app.get("/api/admin/api-logs", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const providerId = req.query.providerId ? Number(req.query.providerId) : undefined;
    const orderId = req.query.orderId ? Number(req.query.orderId) : undefined;
    const logs = await storage.getApiOrderLogs(providerId, orderId);
    res.json(logs);
  });

  // === API Tokens ===
  app.get("/api/admin/api-tokens", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const tokens = await storage.getApiTokens();
    res.json(tokens);
  });

  app.post("/api/admin/api-tokens", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const token = generateApiToken();
      const created = await storage.createApiToken({
        userId: req.body.userId || req.user.id,
        token,
        name: req.body.name || "API Token",
        isActive: true,
        ipWhitelist: req.body.ipWhitelist || null,
      });
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/admin/api-tokens/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const token = await storage.updateApiToken(Number(req.params.id), req.body);
    res.json(token);
  });

  app.delete("/api/admin/api-tokens/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteApiToken(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Bulk API Service Mappings ===
  app.post("/api/admin/api-mappings/bulk", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const { providerId, serviceGroupId, mappings: mappingList, externalPrefix } = req.body;
      
      if (mappingList && Array.isArray(mappingList)) {
        const created = await storage.createBulkApiServiceMappings(mappingList.map((m: any) => ({
          providerId: Number(m.providerId),
          localServiceId: Number(m.localServiceId),
          externalServiceId: m.externalServiceId,
          externalServiceName: m.externalServiceName || null,
          externalPrice: m.externalPrice || null,
          isActive: m.isActive !== false,
          autoForward: m.autoForward || false,
        })));
        return res.status(201).json({ created: created.length, mappings: created });
      }

      if (providerId && serviceGroupId) {
        const groupServices = await storage.getServicesByGroup(Number(serviceGroupId));
        const bulkMappings = groupServices
          .filter(s => s.active !== false)
          .map(s => ({
            providerId: Number(providerId),
            localServiceId: s.id,
            externalServiceId: externalPrefix ? `${externalPrefix}${s.id}` : String(s.id),
            externalServiceName: s.name,
            externalPrice: null as string | null,
            isActive: true,
            autoForward: false,
          }));
        const created = await storage.createBulkApiServiceMappings(bulkMappings);
        return res.status(201).json({ created: created.length, mappings: created });
      }

      return res.status(400).json({ message: "Provide mappings array or providerId+serviceGroupId" });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // === Notifications ===
  app.get("/api/notifications", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const notifs = await storage.getNotifications(req.user.id);
    res.json(notifs);
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const count = await storage.getUnreadNotificationCount(req.user.id);
    res.json({ count });
  });

  app.get("/api/admin/notifications", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const notifs = await storage.getNotifications();
    res.json(notifs);
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const notif = await storage.markNotificationRead(Number(req.params.id));
    res.json(notif);
  });

  app.post("/api/notifications/read-all", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    await storage.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    await storage.deleteNotification(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Order Reports ===
  app.get("/api/admin/reports/orders", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const filters = {
      status: req.query.status as string | undefined,
      fromDate: req.query.fromDate as string | undefined,
      toDate: req.query.toDate as string | undefined,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      serviceGroupId: req.query.serviceGroupId ? Number(req.query.serviceGroupId) : undefined,
    };
    const report = await storage.getOrderReports(filters);
    res.json(report);
  });

  // === Dashboard Stats ===
  app.get("/api/admin/dashboard-stats", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // === Admin Activity Logs ===
  app.get("/api/admin/activity-logs", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const logs = await storage.getAdminActivityLogs(limit);
    res.json(logs);
  });

  // === Accounting: Accounts (Chart of Accounts) ===
  app.get("/api/accounting/accounts", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const accounts = await storage.getAccounts();
    res.json(accounts);
  });

  app.post("/api/accounting/accounts", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const parsed = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(parsed);
      res.status(201).json(account);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/accounting/accounts/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const account = await storage.updateAccount(Number(req.params.id), req.body);
    res.json(account);
  });

  app.delete("/api/accounting/accounts/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteAccount(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Accounting: Funds ===
  app.get("/api/accounting/funds", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const funds = await storage.getFunds();
    res.json(funds);
  });

  app.post("/api/accounting/funds", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const parsed = insertFundSchema.parse(req.body);
      const fund = await storage.createFund(parsed);
      res.status(201).json(fund);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.patch("/api/accounting/funds/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const fund = await storage.updateFund(Number(req.params.id), req.body);
    res.json(fund);
  });

  app.delete("/api/accounting/funds/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteFund(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Accounting: Fund Transactions ===
  app.get("/api/accounting/fund-transactions", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const fundId = req.query.fundId ? Number(req.query.fundId) : undefined;
    const transactions = await storage.getFundTransactions(fundId);
    res.json(transactions);
  });

  // === Accounting: Periods ===
  app.get("/api/accounting/periods", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const periods = await storage.getAccountingPeriods();
    res.json(periods);
  });

  app.post("/api/accounting/periods", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const parsed = insertAccountingPeriodSchema.parse(req.body);
      const period = await storage.createAccountingPeriod(parsed);
      res.status(201).json(period);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/accounting/periods/:id/close", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const period = await storage.closeAccountingPeriod(Number(req.params.id), req.user.id);
      res.json(period);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // === Accounting: Journal Entries ===
  app.get("/api/accounting/journal-entries", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const periodId = req.query.periodId ? Number(req.query.periodId) : undefined;
    const entries = await storage.getJournalEntries(periodId);
    res.json(entries);
  });

  app.get("/api/accounting/journal-entries/:id", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const entry = await storage.getJournalEntry(Number(req.params.id));
    if (!entry) return res.sendStatus(404);
    res.json(entry);
  });

  app.post("/api/accounting/journal-entries", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    try {
      const { lines, ...entryData } = req.body;
      if (!lines || !Array.isArray(lines) || lines.length < 2) {
        return res.status(400).json({ message: "يجب أن يحتوي القيد على سطرين على الأقل" });
      }

      if (entryData.periodId) {
        const period = await storage.getAccountingPeriod(entryData.periodId);
        if (period && period.status === "closed") {
          return res.status(400).json({ message: "لا يمكن إضافة قيود لفترة مقفلة" });
        }
      }

      for (const line of lines) {
        if (!line.accountId) {
          return res.status(400).json({ message: "يجب تحديد حساب لكل سطر" });
        }
        const account = await storage.getAccount(Number(line.accountId));
        if (!account) {
          return res.status(400).json({ message: `الحساب رقم ${line.accountId} غير موجود` });
        }
      }

      const totalDebit = lines.reduce((sum: number, l: any) => sum + Number(l.debit || 0), 0);
      const totalCredit = lines.reduce((sum: number, l: any) => sum + Number(l.credit || 0), 0);
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({ message: "مجموع المدين يجب أن يساوي مجموع الدائن" });
      }
      const entryNumber = await storage.getNextEntryNumber();
      const entry = await storage.createJournalEntry(
        { ...entryData, entryNumber, totalDebit: String(totalDebit), totalCredit: String(totalCredit), createdBy: req.user.id },
        lines
      );

      // Update fund balances if lines have fund references
      for (const line of lines) {
        if (line.fundId) {
          const debitAmt = Number(line.debit || 0);
          const creditAmt = Number(line.credit || 0);
          const netAmount = debitAmt - creditAmt;
          if (netAmount !== 0) {
            await storage.updateFundBalance(line.fundId, String(netAmount));
            await storage.createFundTransaction({
              fundId: line.fundId,
              transactionType: netAmount > 0 ? "deposit" : "withdraw",
              amount: String(Math.abs(netAmount)),
              description: entryData.description,
              relatedEntryId: entry.id,
            });
          }
        }
      }

      res.status(201).json(entry);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // === Accounting: Reports ===
  app.get("/api/accounting/reports/balances", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const periodId = req.query.periodId ? Number(req.query.periodId) : undefined;
    const balances = await storage.getAccountBalances(periodId);
    res.json(balances);
  });

  app.get("/api/accounting/reports/trial-balance", async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    const periodId = req.query.periodId ? Number(req.query.periodId) : undefined;
    const trialBalance = await storage.getTrialBalance(periodId);
    res.json(trialBalance);
  });

  // === Seed default accounts ===
  await seedAccountingDefaults();

  await seedDatabase();

  return httpServer;
}

async function seedAccountingDefaults() {
  const existingAccounts = await storage.getAccounts();
  if (existingAccounts.length === 0) {
    console.log("Seeding default chart of accounts...");
    const defaultAccounts = [
      { code: "1000", nameAr: "الأصول", type: "asset" },
      { code: "1100", nameAr: "النقدية والبنوك", type: "asset" },
      { code: "1101", nameAr: "الصندوق الرئيسي", type: "asset" },
      { code: "1102", nameAr: "البنك", type: "asset" },
      { code: "1200", nameAr: "المدينون", type: "asset" },
      { code: "1201", nameAr: "ذمم العملاء", type: "asset" },
      { code: "2000", nameAr: "الالتزامات", type: "liability" },
      { code: "2100", nameAr: "الدائنون", type: "liability" },
      { code: "2101", nameAr: "ذمم الموردين", type: "liability" },
      { code: "3000", nameAr: "حقوق الملكية", type: "equity" },
      { code: "3100", nameAr: "رأس المال", type: "equity" },
      { code: "3200", nameAr: "الأرباح المحتجزة", type: "equity" },
      { code: "4000", nameAr: "الإيرادات", type: "revenue" },
      { code: "4100", nameAr: "إيرادات المبيعات", type: "revenue" },
      { code: "4101", nameAr: "إيرادات شحن الألعاب", type: "revenue" },
      { code: "4102", nameAr: "إيرادات الاشتراكات", type: "revenue" },
      { code: "4103", nameAr: "إيرادات البطاقات", type: "revenue" },
      { code: "5000", nameAr: "المصروفات", type: "expense" },
      { code: "5100", nameAr: "تكلفة المبيعات", type: "expense" },
      { code: "5101", nameAr: "تكلفة شحن الألعاب", type: "expense" },
      { code: "5102", nameAr: "تكلفة الاشتراكات", type: "expense" },
      { code: "5103", nameAr: "تكلفة البطاقات", type: "expense" },
      { code: "5200", nameAr: "المصاريف التشغيلية", type: "expense" },
      { code: "5201", nameAr: "رواتب وأجور", type: "expense" },
      { code: "5202", nameAr: "إيجارات", type: "expense" },
      { code: "5203", nameAr: "مصاريف متنوعة", type: "expense" },
    ];
    for (const acc of defaultAccounts) {
      await storage.createAccount(acc);
    }

    const now = new Date();
    await storage.createAccountingPeriod({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      periodType: "monthly",
      status: "open",
    });

    console.log("Accounting defaults seeded.");
  }
}

async function seedDatabase() {
  const existingCategories = await storage.getCategories();
  if (existingCategories.length === 0) {
    console.log("Seeding database...");
    // 1. Categories
    const catApps = await storage.createCategory({ name: "قسم التطبيقات", icon: "Smartphone" });
    const catGames = await storage.createCategory({ name: "قسم الألعاب", icon: "Gamepad2" });
    const catSubs = await storage.createCategory({ name: "قسم الاشتراكات", icon: "Package" });
    const catCards = await storage.createCategory({ name: "قسم البطائق", icon: "CreditCard" });

    // 2. Lama Ludo
    const lamaGroup = await storage.createServiceGroup({
      name: "لاما لودو Lama Ludo",
      categoryId: catApps.id,
      note: "شحن ماسات تطبيق لما لودو من خلال المعرف فقط",
      active: true,
    });
    const lamaPrices = [
      { n: "150,000 جوهرة", p: 392 },
      { n: "300,000 جوهرة", p: 784 },
      { n: "450,000 جوهرة", p: 1176 },
      { n: "600,000 جوهرة", p: 1568 },
      { n: "750,000 جوهرة", p: 1960 },
      { n: "900,000 جوهرة", p: 2358 },
      { n: "1,000,000 جوهرة", p: 2615 },
      { n: "2,000,000 جوهرة", p: 5236 },
      { n: "5,000,000 جوهرة", p: 13082 },
      { n: "10,000,000 جوهرة", p: 26169 },
      { n: "15,000,000 جوهرة", p: 39250 },
    ];
    for (const item of lamaPrices) {
      await storage.createService({ name: item.n, price: item.p, serviceGroupId: lamaGroup.id, active: true });
    }

    // 3. PUBG
    const pubgGroup = await storage.createServiceGroup({
      name: "بوبجي موبايل العالمية",
      categoryId: catGames.id,
      note: "الشحن عن طريق الايدي",
      active: true,
    });
    const pubgPrices = [
      { n: "60 شدة", p: 491 },
      { n: "325 شدة", p: 2456 },
      { n: "385 شدة", p: 2947 },
      { n: "660 شدة", p: 4911 },
      { n: "720 شدة", p: 5402 },
      { n: "1800 شدة", p: 12279 },
      { n: "3850 شدة", p: 24557 },
      { n: "8100 شدة", p: 49113 },
      { n: "8400 شدة", p: 51569 },
      { n: "11950 شدة", p: 73669 },
      { n: "16200 شدة", p: 98226 },
      { n: "24300 شدة", p: 147339 },
      { n: "32400 شدة", p: 196452 },
    ];
    for (const item of pubgPrices) {
      await storage.createService({ name: item.n, price: item.p, serviceGroupId: pubgGroup.id, active: true });
    }

    // 4. Shahid
    const shahidGroup = await storage.createServiceGroup({
      name: "شاهد في اي بي Shahid VIP",
      categoryId: catSubs.id,
      note: "يتم تجديد الاشتراك عبر إرسال الحساب (الإيميل)، ويتم التفعيل خلال وقت قصير من تأكيد الدفع",
      active: true,
    });
    await storage.createService({ name: "شاهد VIP – 3 أشهر", price: 15500, serviceGroupId: shahidGroup.id, active: true });
    await storage.createService({ name: "شاهد VIP – سنة كاملة", price: 50000, serviceGroupId: shahidGroup.id, active: true });

    // 5. iTunes
    const itunesGroup = await storage.createServiceGroup({
      name: "بطاقات آيتونز امريكي",
      categoryId: catCards.id,
      note: "من خلال الكود ارسال كود البطاقه للعميل فقط",
      active: true,
    });
    const itunesPrices = [
      { n: "آيتونز – 2 دولار", p: 1103 },
      { n: "آيتونز – 3 دولار", p: 1652 },
      { n: "آيتونز – 5 دولار", p: 2755 },
      { n: "آيتونز – 10 دولار", p: 5510 },
      { n: "آيتونز – 15 دولار", p: 8266 },
      { n: "آيتونز – 20 دولار", p: 11021 },
      { n: "آيتونز – 25 دولار", p: 13776 },
      { n: "آيتونز – 50 دولار", p: 27552 },
      { n: "آيتونز – 100 دولار", p: 55104 },
    ];
    for (const item of itunesPrices) {
      await storage.createService({ name: item.n, price: item.p, serviceGroupId: itunesGroup.id, active: true });
    }

    await storage.createBank({
      bankName: "بنك الكريمي",
      accountName: "محمد احمد",
      accountNumber: "123456",
      note: "إيداع فقط"
    });

    await storage.createAd({
      text: "خصم 50% لفترة محدودة!",
      icon: "flame",
      active: true
    });

    await storage.updateSettings({
      storeName: "ويب ستور",
      logoUrl: "/logo.png",
      adminWhatsapp: "967775477340"
    });
    console.log("Seeding completed.");
  }

  const adminUser = await storage.getUserByPhoneNumber("0000000000");
  if (!adminUser) {
    console.log("Creating admin user...");
    const hashedPassword = await hashPassword("admin");
    await storage.createUser({
      fullName: "Admin User",
      phoneNumber: "0000000000",
      password: hashedPassword,
      role: "admin"
    });
  }
}
