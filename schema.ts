import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users with wallet balance
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0.00").notNull(), // Stored as string in JS, handled carefully
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Virtual Numbers purchased by users
export const numbers = pgTable("numbers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  service: text("service").notNull(), // e.g., "whatsapp", "telegram"
  country: text("country").notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "active", "expired"
  expiresAt: timestamp("expires_at"),
  orderId: text("order_id"), // ID from the external provider
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions (Deposits, Purchases)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "deposit", "purchase", "refund"
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// SMS Messages received
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  numberId: integer("number_id").references(() => numbers.id).notNull(),
  sender: text("sender").notNull(),
  content: text("content").notNull(),
  receivedAt: timestamp("received_at").defaultNow(),
});

// Base Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNumberSchema = createInsertSchema(numbers).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VirtualNumber = typeof numbers.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type SmsMessage = typeof messages.$inferSelect;
