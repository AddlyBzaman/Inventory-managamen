import { sqliteTable, AnySQLiteColumn, uniqueIndex, text, real, integer, numeric, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const products = sqliteTable("products", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	sku: text().notNull(),
	price: real().notNull(),
	quantity: integer().default(0).notNull(),
	unit: text().default("pcs").notNull(),
	minQuantity: integer().default(5).notNull(),
	category: text().notNull(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: numeric().notNull(),
},
(table) => [
	uniqueIndex("products_sku_key").on(table.sku),
]);

export const historyItems = sqliteTable("history_items", {
	id: text().primaryKey().notNull(),
	itemId: text().notNull().references(() => products.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	itemName: text().notNull(),
	type: text().notNull(),
	quantityChange: integer().notNull(),
	date: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	notes: text(),
});

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	username: text().notNull(),
	email: text(),
	password: text().notNull(),
	name: text(),
	role: text().default("user").notNull(),
	isActive: numeric().default("1").notNull(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: numeric().notNull(),
},
(table) => [
	uniqueIndex("users_email_key").on(table.email),
	uniqueIndex("users_username_key").on(table.username),
]);

