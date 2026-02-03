import { sqliteTable, text, real, integer, numeric, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const products = sqliteTable("products", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  description: text(),
  category: text().notNull(),
  quantity: integer().default(0).notNull(),
  minStock: integer().default(5).notNull(),
  price: real().notNull(),
  location: text(),
  sku: text().notNull(),
  unit: text().default("pcs").notNull(),
  createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric().notNull(),
},
(table) => [
  uniqueIndex("products_sku_key").on(table.sku),
]);

export const historyItems = sqliteTable("history_items", {
  id: text().primaryKey().notNull(),
  productId: text().notNull().references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" }),
  productName: text().notNull(),
  action: text().notNull(), // 'added' | 'updated' | 'deleted'
  quantity: integer().notNull(),
  timestamp: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  userId: text().notNull(),
  userName: text().notNull(),
  details: text(),
});

export const users = sqliteTable("users", {
  id: text().primaryKey().notNull(),
  username: text().notNull(),
  email: text(),
  password: text().notNull(),
  name: text(),
  role: text().default("user").notNull(),
  isActive: integer().default(1).notNull(),
  createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  updatedAt: numeric().notNull(),
},
(table) => [
  uniqueIndex("users_email_key").on(table.email),
  uniqueIndex("users_username_key").on(table.username),
]);
