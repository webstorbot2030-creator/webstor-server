import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  setupAuth(app);

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
    const order = await storage.createOrder({
      ...orderData,
      userId: req.user.id,
      status: "pending"
    });
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
    const order = await storage.updateOrderStatus(Number(req.params.id), status, rejectionReason);
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

  app.delete(api.ads.delete.path, async (req, res) => {
    if (req.user?.role !== "admin") return res.sendStatus(403);
    await storage.deleteAd(Number(req.params.id));
    res.sendStatus(204);
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

  await seedDatabase();

  return httpServer;
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
