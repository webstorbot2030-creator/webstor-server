import { db } from "./db";
import {
  users, categories, serviceGroups, services, orders, banks, ads, settings,
  accounts, funds, accountingPeriods, journalEntries, journalLines, fundTransactions,
  apiProviders, apiServiceMappings, apiOrderLogs, apiTokens, notifications,
  passwordResetCodes, adminActivityLogs,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type ServiceGroup, type InsertServiceGroup,
  type Service, type InsertService,
  type Order, type InsertOrder,
  type Bank, type InsertBank,
  type Ad, type InsertAd,
  type Setting, type InsertSetting,
  type Account, type InsertAccount,
  type Fund, type InsertFund,
  type AccountingPeriod, type InsertAccountingPeriod,
  type JournalEntry, type InsertJournalEntry,
  type JournalLine, type InsertJournalLine,
  type FundTransaction, type InsertFundTransaction,
  type ApiProvider, type InsertApiProvider,
  type ApiServiceMapping, type InsertApiServiceMapping,
  type ApiOrderLog, type InsertApiOrderLog,
  type ApiToken, type InsertApiToken,
  type Notification, type InsertNotification,
  type PasswordResetCode, type InsertPasswordResetCode,
  type AdminActivityLog, type InsertAdminActivityLog,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

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

  // Accounts (Chart of Accounts)
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, data: Partial<Account>): Promise<Account>;
  deleteAccount(id: number): Promise<void>;

  // Funds
  getFunds(): Promise<Fund[]>;
  getFund(id: number): Promise<Fund | undefined>;
  createFund(fund: InsertFund): Promise<Fund>;
  updateFund(id: number, data: Partial<Fund>): Promise<Fund>;
  updateFundBalance(id: number, amount: string): Promise<Fund>;
  deleteFund(id: number): Promise<void>;

  // Accounting Periods
  getAccountingPeriods(): Promise<AccountingPeriod[]>;
  getAccountingPeriod(id: number): Promise<AccountingPeriod | undefined>;
  getOpenPeriod(year: number, month?: number): Promise<AccountingPeriod | undefined>;
  createAccountingPeriod(period: InsertAccountingPeriod): Promise<AccountingPeriod>;
  closeAccountingPeriod(id: number, closedBy: number): Promise<AccountingPeriod>;

  // Journal Entries
  getJournalEntries(periodId?: number): Promise<(JournalEntry & { lines?: JournalLine[] })[]>;
  getJournalEntry(id: number): Promise<(JournalEntry & { lines: JournalLine[] }) | undefined>;
  createJournalEntry(entry: InsertJournalEntry, lines: InsertJournalLine[]): Promise<JournalEntry>;
  getNextEntryNumber(): Promise<string>;

  // Fund Transactions
  getFundTransactions(fundId?: number): Promise<FundTransaction[]>;
  createFundTransaction(transaction: InsertFundTransaction): Promise<FundTransaction>;

  // Reports
  getAccountBalances(periodId?: number): Promise<{ accountId: number; code: string; nameAr: string; type: string; totalDebit: string; totalCredit: string; balance: string }[]>;
  getTrialBalance(periodId?: number): Promise<{ accountId: number; code: string; nameAr: string; type: string; debit: string; credit: string }[]>;

  // API Providers
  getApiProviders(): Promise<ApiProvider[]>;
  getApiProvider(id: number): Promise<ApiProvider | undefined>;
  createApiProvider(provider: InsertApiProvider): Promise<ApiProvider>;
  updateApiProvider(id: number, data: Partial<ApiProvider>): Promise<ApiProvider>;
  deleteApiProvider(id: number): Promise<void>;

  // API Service Mappings
  getApiServiceMappings(providerId?: number): Promise<ApiServiceMapping[]>;
  getApiServiceMapping(id: number): Promise<ApiServiceMapping | undefined>;
  getApiServiceMappingByLocalService(localServiceId: number): Promise<(ApiServiceMapping & { provider?: ApiProvider })[]>;
  createApiServiceMapping(mapping: InsertApiServiceMapping): Promise<ApiServiceMapping>;
  updateApiServiceMapping(id: number, data: Partial<ApiServiceMapping>): Promise<ApiServiceMapping>;
  deleteApiServiceMapping(id: number): Promise<void>;

  // API Order Logs
  getApiOrderLogs(providerId?: number, orderId?: number): Promise<ApiOrderLog[]>;
  createApiOrderLog(log: InsertApiOrderLog): Promise<ApiOrderLog>;
  updateApiOrderLog(id: number, data: Partial<ApiOrderLog>): Promise<ApiOrderLog>;

  // API Tokens
  getApiTokens(): Promise<ApiToken[]>;
  getApiTokenByToken(token: string): Promise<(ApiToken & { user?: User }) | undefined>;
  createApiToken(token: InsertApiToken): Promise<ApiToken>;
  updateApiToken(id: number, data: Partial<ApiToken>): Promise<ApiToken>;
  deleteApiToken(id: number): Promise<void>;

  // Notifications
  getNotifications(userId?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification>;
  markAllNotificationsRead(userId: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;

  // Bulk API Service Mappings
  createBulkApiServiceMappings(mappings: InsertApiServiceMapping[]): Promise<ApiServiceMapping[]>;

  // Order Reports
  getOrderReports(filters?: { status?: string; fromDate?: string; toDate?: string; userId?: number; serviceGroupId?: number }): Promise<any>;

  // Password Reset
  getUserByEmail(email: string): Promise<User | undefined>;
  createPasswordResetCode(data: InsertPasswordResetCode): Promise<PasswordResetCode>;
  getValidResetCode(userId: number, code: string): Promise<PasswordResetCode | undefined>;
  markResetCodeUsed(id: number): Promise<void>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User>;

  // Admin Activity Logs
  getAdminActivityLogs(limit?: number): Promise<(AdminActivityLog & { user?: User })[]>;
  createAdminActivityLog(log: InsertAdminActivityLog): Promise<AdminActivityLog>;

  // Dashboard Stats
  getDashboardStats(): Promise<{ totalUsers: number; totalOrders: number; todayOrders: number; totalRevenue: number; pendingOrders: number; completedOrders: number; newUsersToday: number }>;
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
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db.update(settings).set(insertSetting).where(eq(settings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(insertSetting).returning();
      return created;
    }
  }

  // === Accounts (Chart of Accounts) ===
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(accounts.code);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }

  async updateAccount(id: number, data: Partial<Account>): Promise<Account> {
    const [updated] = await db.update(accounts).set(data).where(eq(accounts.id, id)).returning();
    return updated;
  }

  async deleteAccount(id: number): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }

  // === Funds ===
  async getFunds(): Promise<Fund[]> {
    return await db.select().from(funds);
  }

  async getFund(id: number): Promise<Fund | undefined> {
    const [fund] = await db.select().from(funds).where(eq(funds.id, id));
    return fund;
  }

  async createFund(insertFund: InsertFund): Promise<Fund> {
    const [fund] = await db.insert(funds).values(insertFund).returning();
    return fund;
  }

  async updateFund(id: number, data: Partial<Fund>): Promise<Fund> {
    const [updated] = await db.update(funds).set(data).where(eq(funds.id, id)).returning();
    return updated;
  }

  async updateFundBalance(id: number, amount: string): Promise<Fund> {
    const [updated] = await db
      .update(funds)
      .set({ balance: sql`${funds.balance} + ${amount}::numeric` })
      .where(eq(funds.id, id))
      .returning();
    return updated;
  }

  async deleteFund(id: number): Promise<void> {
    await db.delete(funds).where(eq(funds.id, id));
  }

  // === Accounting Periods ===
  async getAccountingPeriods(): Promise<AccountingPeriod[]> {
    return await db.select().from(accountingPeriods).orderBy(desc(accountingPeriods.year), desc(accountingPeriods.month));
  }

  async getAccountingPeriod(id: number): Promise<AccountingPeriod | undefined> {
    const [period] = await db.select().from(accountingPeriods).where(eq(accountingPeriods.id, id));
    return period;
  }

  async getOpenPeriod(year: number, month?: number): Promise<AccountingPeriod | undefined> {
    const conditions = [eq(accountingPeriods.year, year), eq(accountingPeriods.status, "open")];
    if (month !== undefined) {
      conditions.push(eq(accountingPeriods.month, month));
    }
    const [period] = await db.select().from(accountingPeriods).where(and(...conditions));
    return period;
  }

  async createAccountingPeriod(period: InsertAccountingPeriod): Promise<AccountingPeriod> {
    const [created] = await db.insert(accountingPeriods).values(period).returning();
    return created;
  }

  async closeAccountingPeriod(id: number, closedBy: number): Promise<AccountingPeriod> {
    const [updated] = await db
      .update(accountingPeriods)
      .set({ status: "closed", closedAt: new Date(), closedBy })
      .where(eq(accountingPeriods.id, id))
      .returning();
    return updated;
  }

  // === Journal Entries ===
  async getJournalEntries(periodId?: number): Promise<(JournalEntry & { lines?: JournalLine[] })[]> {
    if (periodId) {
      return await db.query.journalEntries.findMany({
        where: eq(journalEntries.periodId, periodId),
        with: { lines: true },
        orderBy: [desc(journalEntries.entryDate)],
      });
    }
    return await db.query.journalEntries.findMany({
      with: { lines: true },
      orderBy: [desc(journalEntries.entryDate)],
    });
  }

  async getJournalEntry(id: number): Promise<(JournalEntry & { lines: JournalLine[] }) | undefined> {
    const entry = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, id),
      with: { lines: true },
    });
    return entry as (JournalEntry & { lines: JournalLine[] }) | undefined;
  }

  async createJournalEntry(entry: InsertJournalEntry, lines: InsertJournalLine[]): Promise<JournalEntry> {
    const [created] = await db.insert(journalEntries).values(entry).returning();
    for (const line of lines) {
      await db.insert(journalLines).values({ ...line, entryId: created.id });
    }
    return created;
  }

  async getNextEntryNumber(): Promise<string> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(journalEntries);
    const count = Number(result[0].count) + 1;
    return `JE-${String(count).padStart(6, '0')}`;
  }

  // === Fund Transactions ===
  async getFundTransactions(fundId?: number): Promise<FundTransaction[]> {
    if (fundId) {
      return await db.select().from(fundTransactions).where(eq(fundTransactions.fundId, fundId)).orderBy(desc(fundTransactions.createdAt));
    }
    return await db.select().from(fundTransactions).orderBy(desc(fundTransactions.createdAt));
  }

  async createFundTransaction(transaction: InsertFundTransaction): Promise<FundTransaction> {
    const [created] = await db.insert(fundTransactions).values(transaction).returning();
    return created;
  }

  // === API Providers ===
  async getApiProviders(): Promise<ApiProvider[]> {
    return await db.select().from(apiProviders).orderBy(desc(apiProviders.createdAt));
  }

  async getApiProvider(id: number): Promise<ApiProvider | undefined> {
    const [provider] = await db.select().from(apiProviders).where(eq(apiProviders.id, id));
    return provider;
  }

  async createApiProvider(provider: InsertApiProvider): Promise<ApiProvider> {
    const [created] = await db.insert(apiProviders).values(provider).returning();
    return created;
  }

  async updateApiProvider(id: number, data: Partial<ApiProvider>): Promise<ApiProvider> {
    const [updated] = await db.update(apiProviders).set(data).where(eq(apiProviders.id, id)).returning();
    return updated;
  }

  async deleteApiProvider(id: number): Promise<void> {
    await db.delete(apiServiceMappings).where(eq(apiServiceMappings.providerId, id));
    await db.delete(apiProviders).where(eq(apiProviders.id, id));
  }

  // === API Service Mappings ===
  async getApiServiceMappings(providerId?: number): Promise<ApiServiceMapping[]> {
    if (providerId) {
      return await db.select().from(apiServiceMappings).where(eq(apiServiceMappings.providerId, providerId));
    }
    return await db.select().from(apiServiceMappings);
  }

  async getApiServiceMapping(id: number): Promise<ApiServiceMapping | undefined> {
    const [mapping] = await db.select().from(apiServiceMappings).where(eq(apiServiceMappings.id, id));
    return mapping;
  }

  async getApiServiceMappingByLocalService(localServiceId: number): Promise<(ApiServiceMapping & { provider?: ApiProvider })[]> {
    return await db.query.apiServiceMappings.findMany({
      where: and(eq(apiServiceMappings.localServiceId, localServiceId), eq(apiServiceMappings.isActive, true), eq(apiServiceMappings.autoForward, true)),
      with: { provider: true },
    }) as any;
  }

  async createApiServiceMapping(mapping: InsertApiServiceMapping): Promise<ApiServiceMapping> {
    const [created] = await db.insert(apiServiceMappings).values(mapping).returning();
    return created;
  }

  async updateApiServiceMapping(id: number, data: Partial<ApiServiceMapping>): Promise<ApiServiceMapping> {
    const [updated] = await db.update(apiServiceMappings).set(data).where(eq(apiServiceMappings.id, id)).returning();
    return updated;
  }

  async deleteApiServiceMapping(id: number): Promise<void> {
    await db.delete(apiServiceMappings).where(eq(apiServiceMappings.id, id));
  }

  // === API Order Logs ===
  async getApiOrderLogs(providerId?: number, orderId?: number): Promise<ApiOrderLog[]> {
    const conditions = [];
    if (providerId) conditions.push(eq(apiOrderLogs.providerId, providerId));
    if (orderId) conditions.push(eq(apiOrderLogs.orderId, orderId));
    if (conditions.length > 0) {
      return await db.select().from(apiOrderLogs).where(and(...conditions)).orderBy(desc(apiOrderLogs.createdAt));
    }
    return await db.select().from(apiOrderLogs).orderBy(desc(apiOrderLogs.createdAt)).limit(100);
  }

  async createApiOrderLog(log: InsertApiOrderLog): Promise<ApiOrderLog> {
    const [created] = await db.insert(apiOrderLogs).values(log).returning();
    return created;
  }

  async updateApiOrderLog(id: number, data: Partial<ApiOrderLog>): Promise<ApiOrderLog> {
    const [updated] = await db.update(apiOrderLogs).set(data).where(eq(apiOrderLogs.id, id)).returning();
    return updated;
  }

  // === API Tokens ===
  async getApiTokens(): Promise<ApiToken[]> {
    return await db.select().from(apiTokens).orderBy(desc(apiTokens.createdAt));
  }

  async getApiTokenByToken(token: string): Promise<(ApiToken & { user?: User }) | undefined> {
    const result = await db.query.apiTokens.findFirst({
      where: and(eq(apiTokens.token, token), eq(apiTokens.isActive, true)),
      with: { user: true },
    });
    return result as any;
  }

  async createApiToken(tokenData: InsertApiToken): Promise<ApiToken> {
    const [created] = await db.insert(apiTokens).values(tokenData).returning();
    return created;
  }

  async updateApiToken(id: number, data: Partial<ApiToken>): Promise<ApiToken> {
    const [updated] = await db.update(apiTokens).set(data).where(eq(apiTokens.id, id)).returning();
    return updated;
  }

  async deleteApiToken(id: number): Promise<void> {
    await db.delete(apiTokens).where(eq(apiTokens.id, id));
  }

  // === Notifications ===
  async getNotifications(userId?: number): Promise<Notification[]> {
    if (userId) {
      return await db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }
    return await db.select().from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(100);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result[0].count);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: number): Promise<Notification> {
    const [updated] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return updated;
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // === Bulk API Service Mappings ===
  async createBulkApiServiceMappings(mappings: InsertApiServiceMapping[]): Promise<ApiServiceMapping[]> {
    if (mappings.length === 0) return [];
    const created = await db.insert(apiServiceMappings).values(mappings).returning();
    return created;
  }

  // === Order Reports ===
  async getOrderReports(filters?: { status?: string; fromDate?: string; toDate?: string; userId?: number; serviceGroupId?: number }): Promise<any> {
    const conditions = [];
    if (filters?.status) conditions.push(sql`o.status = ${filters.status}`);
    if (filters?.fromDate) conditions.push(sql`o.created_at >= ${filters.fromDate}::timestamp`);
    if (filters?.toDate) conditions.push(sql`o.created_at <= ${filters.toDate}::timestamp + interval '1 day'`);
    if (filters?.userId) conditions.push(sql`o.user_id = ${filters.userId}`);
    if (filters?.serviceGroupId) conditions.push(sql`s.service_group_id = ${filters.serviceGroupId}`);

    const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

    const result = await db.execute(sql`
      SELECT 
        o.id, o.status, o.user_input_id, o.rejection_reason, o.created_at,
        s.name as service_name, s.price as service_price, s.service_group_id,
        sg.name as group_name,
        u.full_name as user_name, u.phone_number as user_phone
      FROM orders o
      JOIN services s ON o.service_id = s.id
      JOIN service_groups sg ON s.service_group_id = sg.id
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT 500
    `);

    const summary = await db.execute(sql`
      SELECT 
        COUNT(*)::text as total_orders,
        COUNT(*) FILTER (WHERE o.status = 'completed')::text as completed_orders,
        COUNT(*) FILTER (WHERE o.status = 'pending')::text as pending_orders,
        COUNT(*) FILTER (WHERE o.status = 'processing')::text as processing_orders,
        COUNT(*) FILTER (WHERE o.status = 'rejected')::text as rejected_orders,
        COALESCE(SUM(s.price) FILTER (WHERE o.status = 'completed'), 0)::text as total_revenue,
        COALESCE(SUM(s.price), 0)::text as total_value
      FROM orders o
      JOIN services s ON o.service_id = s.id
      ${whereClause}
    `);

    return {
      orders: result.rows,
      summary: summary.rows[0],
    };
  }

  // === Reports ===
  async getAccountBalances(periodId?: number): Promise<{ accountId: number; code: string; nameAr: string; type: string; totalDebit: string; totalCredit: string; balance: string }[]> {
    const periodCondition = periodId ? sql`AND je.period_id = ${periodId}` : sql``;
    const result = await db.execute(sql`
      SELECT 
        a.id as account_id,
        a.code,
        a.name_ar,
        a.type,
        COALESCE(SUM(jl.debit), 0)::text as total_debit,
        COALESCE(SUM(jl.credit), 0)::text as total_credit,
        (COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0))::text as balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journal_entries je ON jl.entry_id = je.id ${periodCondition}
      WHERE a.is_active = true
      GROUP BY a.id, a.code, a.name_ar, a.type
      ORDER BY a.code
    `);
    return result.rows as any;
  }

  async getTrialBalance(periodId?: number): Promise<{ accountId: number; code: string; nameAr: string; type: string; debit: string; credit: string }[]> {
    const periodCondition = periodId ? sql`AND je.period_id = ${periodId}` : sql``;
    const result = await db.execute(sql`
      SELECT 
        a.id as account_id,
        a.code,
        a.name_ar,
        a.type,
        CASE 
          WHEN (COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0)) > 0 
          THEN (COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0))::text
          ELSE '0'
        END as debit,
        CASE 
          WHEN (COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0)) > 0 
          THEN (COALESCE(SUM(jl.credit), 0) - COALESCE(SUM(jl.debit), 0))::text
          ELSE '0'
        END as credit
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      LEFT JOIN journal_entries je ON jl.entry_id = je.id ${periodCondition}
      WHERE a.is_active = true
      GROUP BY a.id, a.code, a.name_ar, a.type
      HAVING COALESCE(SUM(jl.debit), 0) != 0 OR COALESCE(SUM(jl.credit), 0) != 0
      ORDER BY a.code
    `);
    return result.rows as any;
  }

  // === Password Reset ===
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createPasswordResetCode(data: InsertPasswordResetCode): Promise<PasswordResetCode> {
    const [code] = await db.insert(passwordResetCodes).values(data).returning();
    return code;
  }

  async getValidResetCode(userId: number, code: string): Promise<PasswordResetCode | undefined> {
    const [result] = await db.select().from(passwordResetCodes)
      .where(and(
        eq(passwordResetCodes.userId, userId),
        eq(passwordResetCodes.code, code),
        eq(passwordResetCodes.used, false),
        sql`${passwordResetCodes.expiresAt} > NOW()`
      ));
    return result;
  }

  async markResetCodeUsed(id: number): Promise<void> {
    await db.update(passwordResetCodes).set({ used: true }).where(eq(passwordResetCodes.id, id));
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User> {
    const [user] = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return user;
  }

  // === Admin Activity Logs ===
  async getAdminActivityLogs(limit = 100): Promise<(AdminActivityLog & { user?: User })[]> {
    const logs = await db.select().from(adminActivityLogs).orderBy(desc(adminActivityLogs.createdAt)).limit(limit);
    const result = [];
    for (const log of logs) {
      const [user] = await db.select().from(users).where(eq(users.id, log.userId));
      result.push({ ...log, user });
    }
    return result;
  }

  async createAdminActivityLog(log: InsertAdminActivityLog): Promise<AdminActivityLog> {
    const [entry] = await db.insert(adminActivityLogs).values(log).returning();
    return entry;
  }

  // === Dashboard Stats ===
  async getDashboardStats(): Promise<{ totalUsers: number; totalOrders: number; todayOrders: number; totalRevenue: number; pendingOrders: number; completedOrders: number; newUsersToday: number }> {
    const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE role = 'user'`);
    const totalOrdersResult = await db.execute(sql`SELECT COUNT(*) as count FROM orders`);
    const todayOrdersResult = await db.execute(sql`SELECT COUNT(*) as count FROM orders WHERE created_at >= CURRENT_DATE`);
    const revenueResult = await db.execute(sql`SELECT COALESCE(SUM(s.price), 0) as total FROM orders o JOIN services s ON o.service_id = s.id WHERE o.status = 'completed'`);
    const pendingResult = await db.execute(sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`);
    const completedResult = await db.execute(sql`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'`);
    const newUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE AND role = 'user'`);

    return {
      totalUsers: Number(totalUsersResult.rows[0]?.count || 0),
      totalOrders: Number(totalOrdersResult.rows[0]?.count || 0),
      todayOrders: Number(todayOrdersResult.rows[0]?.count || 0),
      totalRevenue: Number(revenueResult.rows[0]?.total || 0),
      pendingOrders: Number(pendingResult.rows[0]?.count || 0),
      completedOrders: Number(completedResult.rows[0]?.count || 0),
      newUsersToday: Number(newUsersResult.rows[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
