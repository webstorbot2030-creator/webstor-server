import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'admin' or 'user'
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"), // Lucide icon name
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Stored in smallest unit or just number
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  note: text("note"), // Instructions for the user
  image: text("image"), // URL or icon name
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
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").default("ويب ستور"),
  logoUrl: text("logo_url"),
  adminWhatsapp: text("admin_whatsapp"),
});

// === RELATIONS ===

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
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
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
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

// Request types
export type LoginRequest = { phoneNumber: string; password: string };
export type CreateOrderRequest = { serviceId: number; userInputId: string };
export type UpdateOrderRequest = { status: string; rejectionReason?: string };

// Response types extended with relations
export type ServiceWithCategory = Service & { category: Category };
export type OrderWithDetails = Order & { service: Service; user: User };
