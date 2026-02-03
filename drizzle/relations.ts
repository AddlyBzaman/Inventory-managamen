import { relations } from "drizzle-orm/relations";
import { products, historyItems } from "./schema";

export const historyItemsRelations = relations(historyItems, ({one}) => ({
	product: one(products, {
		fields: [historyItems.itemId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	historyItems: many(historyItems),
}));