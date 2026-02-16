import { db } from "./db";
import {
  users, categories, serviceGroups, services, orders, banks, ads, settings,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type ServiceGroup, type InsertServiceGroup,
  type Service, type InsertService,
  type Order, type InsertOrder,
  type Bank, type InsertBank,
  type Ad, type InsertAd,
  type Setting, type InsertSetting,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Service Groups
  getServiceGroups(): Promise<ServiceGroup[]>;
  getServiceGroupsByCategory(categoryId: number): Promise<ServiceGroup[]>;
  createServiceGroup(group: InsertServiceGroup): Promise<ServiceGroup>;
  deleteServiceGroup(id: number): Promise<void>;

  // Services
  getServices(): Promise<Service[]>;
  getServicesByGroup(groupId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getUserOrders(userId: number): Promise<(Order & { service: Service })[]>;
  getAllOrders(status?: string): Promise<(Order & { service: Service; user: User })[]>;
  updateOrderStatus(id: number, status: string, rejectionReason?: string): Promise<Order>;

  // Banks
  getBanks(): Promise<Bank[]>;
  createBank(bank: InsertBank): Promise<Bank>;
  deleteBank(id: number): Promise<void>;

  // Ads
  getAds(): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  deleteAd(id: number): Promise<void>;

  // Users Management
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateUserBalance(id: number, balance: number): Promise<User>;
  toggleUserActive(id: number, active: boolean): Promise<User>;

  // Service Group & Service Toggle
  updateServiceGroup(id: number, data: Partial<ServiceGroup>): Promise<ServiceGroup>;
  updateService(id: number, data: Partial<Service>): Promise<Service>;

  // Settings
  getSettings(): Promise<Setting | undefined>;
  updateSettings(settings: InsertSetting): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Service Groups
  async getServiceGroups(): Promise<ServiceGroup[]> {
    return await db.select().from(serviceGroups);
  }

  async getServiceGroupsByCategory(categoryId: number): Promise<ServiceGroup[]> {
    return await db.select().from(serviceGroups).where(eq(serviceGroups.categoryId, categoryId));
  }

  async createServiceGroup(group: InsertServiceGroup): Promise<ServiceGroup> {
    const [created] = await db.insert(serviceGroups).values(group).returning();
    return created;
  }

  async deleteServiceGroup(id: number): Promise<void> {
    await db.delete(serviceGroups).where(eq(serviceGroups.id, id));
  }

  // Services
  async getServices(): Promise<(Service & { serviceGroup?: ServiceGroup })[]> {
    return await db.query.services.findMany({
      with: { group: true }
    });
  }

  async getServicesByGroup(groupId: number): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.serviceGroupId, groupId));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Orders
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getUserOrders(userId: number): Promise<(Order & { service: Service })[]> {
    return await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      with: { service: true },
      orderBy: [desc(orders.createdAt)],
    });
  }

  async getAllOrders(status?: string): Promise<(Order & { service: Service; user: User })[]> {
    if (status) {
      return await db.query.orders.findMany({
        where: eq(orders.status, status),
        with: { service: true, user: true },
        orderBy: [desc(orders.createdAt)],
      });
    }
    return await db.query.orders.findMany({
      with: { service: true, user: true },
      orderBy: [desc(orders.createdAt)],
    });
  }

  async updateOrderStatus(id: number, status: string, rejectionReason?: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, rejectionReason })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Banks
  async getBanks(): Promise<Bank[]> {
    return await db.select().from(banks);
  }

  async createBank(insertBank: InsertBank): Promise<Bank> {
    const [bank] = await db.insert(banks).values(insertBank).returning();
    return bank;
  }

  async deleteBank(id: number): Promise<void> {
    await db.delete(banks).where(eq(banks.id, id));
  }

  // Ads
  async getAds(): Promise<Ad[]> {
    return await db.select().from(ads);
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const [ad] = await db.insert(ads).values(insertAd).returning();
    return ad;
  }

  async deleteAd(id: number): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }

  // Users Management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async updateUserBalance(id: number, balance: number): Promise<User> {
    const [updated] = await db.update(users).set({ balance }).where(eq(users.id, id)).returning();
    return updated;
  }

  async toggleUserActive(id: number, active: boolean): Promise<User> {
    const [updated] = await db.update(users).set({ active }).where(eq(users.id, id)).returning();
    return updated;
  }

  // Service Group & Service Toggle
  async updateServiceGroup(id: number, data: Partial<ServiceGroup>): Promise<ServiceGroup> {
    const [updated] = await db.update(serviceGroups).set(data).where(eq(serviceGroups.id, id)).returning();
    return updated;
  }

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    const [updated] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return updated;
  }

  // Settings
  async getSettings(): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(insertSetting: InsertSetting): Promise<Setting> {
    // Check if settings exist, if not create, else update
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db.update(settings).set(insertSetting).where(eq(settings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(insertSetting).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
