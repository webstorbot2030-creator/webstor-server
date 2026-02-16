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
    const catGames = await storage.createCategory({ name: "ألعاب", icon: "gamepad-2" });
    const catCards = await storage.createCategory({ name: "بطاقات", icon: "credit-card" });

    const pubgGroup = await storage.createServiceGroup({
      name: "PUBG Mobile",
      categoryId: catGames.id,
      note: "يصلك خلال 5 دقائق",
      image: "https://cdn-icons-png.flaticon.com/512/3050/3050525.png",
      active: true,
    });

    await storage.createService({
      name: "PUBG 60 UC",
      price: 5,
      serviceGroupId: pubgGroup.id,
      active: true,
    });

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
