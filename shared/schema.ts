import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  balance: integer("balance").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"), // Lucide icon name or image URL
  image: text("image"), // Added image field
});

// "Games" or "Main Services" that belong to a category
export const serviceGroups = pgTable("service_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  image: text("image"),
  note: text("note"),
  active: boolean("active").default(true),
  inputType: text("input_type").default("id"), // 'id' or 'auth'
});

// "Prices/Packages" that belong to a service group
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. "60 UC", "100 Gems"
  price: integer("price").notNull(),
  serviceGroupId: integer("service_group_id").references(() => serviceGroups.id).notNull(),
  active: boolean("active").default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, rejected
  userInputId: text("user_input_id").notNull(), // The ID the user enters for the service
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const banks = pgTable("banks", {
  id: serial("id").primaryKey(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  note: text("note"),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  icon: text("icon").notNull(),
  active: boolean("active").default(true),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  adType: text("ad_type").default("text"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").default("ويب ستور"),
  logoUrl: text("logo_url"),
  adminWhatsapp: text("admin_whatsapp"),
});

// === API INTEGRATION TABLES ===

export const apiProviders = pgTable("api_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  providerType: text("provider_type").notNull().default("megacenter"),
  baseUrl: text("base_url").notNull(),
  username: text("username"),
  password: text("password"),
  apiToken: text("api_token"),
  isActive: boolean("is_active").default(true),
  webhookUrl: text("webhook_url"),
  ipWhitelist: text("ip_whitelist"),
  balance: numeric("balance", { precision: 15, scale: 2 }).default("0"),
  currency: text("currency").default("USD"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiServiceMappings = pgTable("api_service_mappings", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => apiProviders.id).notNull(),
  localServiceId: integer("local_service_id").references(() => services.id).notNull(),
  externalServiceId: text("external_service_id").notNull(),
  externalServiceName: text("external_service_name"),
  externalPrice: numeric("external_price", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  autoForward: boolean("auto_forward").default(false),
  requiredFields: text("required_fields"),
});

export const apiOrderLogs = pgTable("api_order_logs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  providerId: integer("provider_id").references(() => apiProviders.id).notNull(),
  direction: text("direction").notNull().default("outgoing"),
  requestData: text("request_data"),
  responseData: text("response_data"),
  externalOrderId: text("external_order_id"),
  externalReference: text("external_reference"),
  status: text("status").default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  ipWhitelist: text("ip_whitelist"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === NOTIFICATIONS TABLE ===

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull().default("info"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  relatedOrderId: integer("related_order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ACCOUNTING TABLES ===

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  type: text("type").notNull(), // asset, liability, equity, revenue, expense
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const funds = pgTable("funds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fundType: text("fund_type").notNull(), // cash, bank
  accountId: integer("account_id").references(() => accounts.id),
  bankId: integer("bank_id").references(() => banks.id),
  balance: numeric("balance", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accountingPeriods = pgTable("accounting_periods", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  month: integer("month"),
  periodType: text("period_type").notNull().default("monthly"), // monthly, yearly
  status: text("status").notNull().default("open"), // open, closed
  closedAt: timestamp("closed_at"),
  closedBy: integer("closed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: text("entry_number").notNull(),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  description: text("description").notNull(),
  sourceType: text("source_type").notNull().default("manual"), // manual, order, transfer, adjustment, closing
  sourceId: integer("source_id"),
  periodId: integer("period_id").references(() => accountingPeriods.id),
  totalDebit: numeric("total_debit", { precision: 15, scale: 2 }).default("0"),
  totalCredit: numeric("total_credit", { precision: 15, scale: 2 }).default("0"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const journalLines = pgTable("journal_lines", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  debit: numeric("debit", { precision: 15, scale: 2 }).default("0"),
  credit: numeric("credit", { precision: 15, scale: 2 }).default("0"),
  description: text("description"),
  fundId: integer("fund_id").references(() => funds.id),
});

export const fundTransactions = pgTable("fund_transactions", {
  id: serial("id").primaryKey(),
  fundId: integer("fund_id").references(() => funds.id).notNull(),
  transactionType: text("transaction_type").notNull(), // deposit, withdraw, transfer_in, transfer_out
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  relatedEntryId: integer("related_entry_id").references(() => journalEntries.id),
  relatedOrderId: integer("related_order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const categoriesRelations = relations(categories, ({ many }) => ({
  groups: many(serviceGroups),
}));

export const serviceGroupsRelations = relations(serviceGroups, ({ one, many }) => ({
  category: one(categories, {
    fields: [serviceGroups.categoryId],
    references: [categories.id],
  }),
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  group: one(serviceGroups, {
    fields: [services.serviceGroupId],
    references: [serviceGroups.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [orders.serviceId],
    references: [services.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  order: one(orders, { fields: [notifications.relatedOrderId], references: [orders.id] }),
}));

export const apiProvidersRelations = relations(apiProviders, ({ many }) => ({
  serviceMappings: many(apiServiceMappings),
  orderLogs: many(apiOrderLogs),
}));

export const apiServiceMappingsRelations = relations(apiServiceMappings, ({ one }) => ({
  provider: one(apiProviders, { fields: [apiServiceMappings.providerId], references: [apiProviders.id] }),
  localService: one(services, { fields: [apiServiceMappings.localServiceId], references: [services.id] }),
}));

export const apiOrderLogsRelations = relations(apiOrderLogs, ({ one }) => ({
  order: one(orders, { fields: [apiOrderLogs.orderId], references: [orders.id] }),
  provider: one(apiProviders, { fields: [apiOrderLogs.providerId], references: [apiProviders.id] }),
}));

export const apiTokensRelations = relations(apiTokens, ({ one }) => ({
  user: one(users, { fields: [apiTokens.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  parent: one(accounts, { fields: [accounts.parentId], references: [accounts.id] }),
  journalLines: many(journalLines),
  funds: many(funds),
}));

export const fundsRelations = relations(funds, ({ one, many }) => ({
  account: one(accounts, { fields: [funds.accountId], references: [accounts.id] }),
  bank: one(banks, { fields: [funds.bankId], references: [banks.id] }),
  transactions: many(fundTransactions),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  period: one(accountingPeriods, { fields: [journalEntries.periodId], references: [accountingPeriods.id] }),
  createdByUser: one(users, { fields: [journalEntries.createdBy], references: [users.id] }),
  lines: many(journalLines),
}));

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
  entry: one(journalEntries, { fields: [journalLines.entryId], references: [journalEntries.id] }),
  account: one(accounts, { fields: [journalLines.accountId], references: [accounts.id] }),
  fund: one(funds, { fields: [journalLines.fundId], references: [funds.id] }),
}));

export const fundTransactionsRelations = relations(fundTransactions, ({ one }) => ({
  fund: one(funds, { fields: [fundTransactions.fundId], references: [funds.id] }),
  entry: one(journalEntries, { fields: [fundTransactions.relatedEntryId], references: [journalEntries.id] }),
  order: one(orders, { fields: [fundTransactions.relatedOrderId], references: [orders.id] }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertServiceGroupSchema = createInsertSchema(serviceGroups).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true, rejectionReason: true });
export const insertBankSchema = createInsertSchema(banks).omit({ id: true });
export const insertAdSchema = createInsertSchema(ads).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type ServiceGroup = typeof serviceGroups.$inferSelect;
export type InsertServiceGroup = z.infer<typeof insertServiceGroupSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Bank = typeof banks.$inferSelect;
export type InsertBank = z.infer<typeof insertBankSchema>;

export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

// Accounting schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export const insertFundSchema = createInsertSchema(funds).omit({ id: true, createdAt: true });
export const insertAccountingPeriodSchema = createInsertSchema(accountingPeriods).omit({ id: true, closedAt: true, closedBy: true, createdAt: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, createdAt: true });
export const insertJournalLineSchema = createInsertSchema(journalLines).omit({ id: true });
export const insertFundTransactionSchema = createInsertSchema(fundTransactions).omit({ id: true, createdAt: true });

// Accounting types
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Fund = typeof funds.$inferSelect;
export type InsertFund = z.infer<typeof insertFundSchema>;
export type AccountingPeriod = typeof accountingPeriods.$inferSelect;
export type InsertAccountingPeriod = z.infer<typeof insertAccountingPeriodSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalLine = typeof journalLines.$inferSelect;
export type InsertJournalLine = z.infer<typeof insertJournalLineSchema>;
export type FundTransaction = typeof fundTransactions.$inferSelect;
export type InsertFundTransaction = z.infer<typeof insertFundTransactionSchema>;

// Notification schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// API Integration schemas
export const insertApiProviderSchema = createInsertSchema(apiProviders).omit({ id: true, createdAt: true });
export const insertApiServiceMappingSchema = createInsertSchema(apiServiceMappings).omit({ id: true });
export const insertApiOrderLogSchema = createInsertSchema(apiOrderLogs).omit({ id: true, createdAt: true });
export const insertApiTokenSchema = createInsertSchema(apiTokens).omit({ id: true, createdAt: true, lastUsedAt: true });

// API Integration types
export type ApiProvider = typeof apiProviders.$inferSelect;
export type InsertApiProvider = z.infer<typeof insertApiProviderSchema>;
export type ApiServiceMapping = typeof apiServiceMappings.$inferSelect;
export type InsertApiServiceMapping = z.infer<typeof insertApiServiceMappingSchema>;
export type ApiOrderLog = typeof apiOrderLogs.$inferSelect;
export type InsertApiOrderLog = z.infer<typeof insertApiOrderLogSchema>;
export type ApiToken = typeof apiTokens.$inferSelect;
export type InsertApiToken = z.infer<typeof insertApiTokenSchema>;

// Request types
export type LoginRequest = { phoneNumber: string; password: string };
export type CreateOrderRequest = { serviceId: number; userInputId: string };
export type UpdateOrderRequest = { status: string; rejectionReason?: string };
