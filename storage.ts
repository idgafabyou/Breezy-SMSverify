import { db } from "./db";
import { users, numbers, transactions, messages, type User, type InsertUser, type VirtualNumber, type Transaction, type SmsMessage } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: string): Promise<User>;
  
  // Numbers
  createNumber(num: Omit<VirtualNumber, "id" | "createdAt">): Promise<VirtualNumber>;
  getNumbers(userId: number): Promise<VirtualNumber[]>;
  getNumber(id: number): Promise<VirtualNumber | undefined>;
  updateNumberStatus(id: number, status: string): Promise<void>;
  
  // Transactions
  createTransaction(tx: Omit<Transaction, "id" | "createdAt">): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  
  // Messages
  createMessage(msg: Omit<SmsMessage, "id" | "receivedAt">): Promise<SmsMessage>;
  getMessages(numberId: number): Promise<SmsMessage[]>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      balance: "0.00",
      isAdmin: false
    }).returning();
    return user;
  }

  async updateUserBalance(userId: number, amount: string): Promise<User> {
    // In a real app, use transactions and atomic updates. 
    // Here we assume amount is the NEW balance or difference. 
    // Ideally, we'd add/subtract. Let's assume we are passing the new TOTAL balance or handling logic in routes.
    // Actually, safer to just set it.
    const [user] = await db.update(users)
      .set({ balance: amount })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createNumber(num: Omit<VirtualNumber, "id" | "createdAt">): Promise<VirtualNumber> {
    const [newNum] = await db.insert(numbers).values(num).returning();
    return newNum;
  }

  async getNumbers(userId: number): Promise<VirtualNumber[]> {
    return await db.select().from(numbers)
      .where(eq(numbers.userId, userId))
      .orderBy(desc(numbers.createdAt));
  }
  
  async getNumber(id: number): Promise<VirtualNumber | undefined> {
    const [num] = await db.select().from(numbers).where(eq(numbers.id, id));
    return num;
  }

  async updateNumberStatus(id: number, status: string): Promise<void> {
    await db.update(numbers).set({ status }).where(eq(numbers.id, id));
  }

  async createTransaction(tx: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const [newTx] = await db.insert(transactions).values(tx).returning();
    return newTx;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createMessage(msg: Omit<SmsMessage, "id" | "receivedAt">): Promise<SmsMessage> {
    const [newMsg] = await db.insert(messages).values(msg).returning();
    return newMsg;
  }

  async getMessages(numberId: number): Promise<SmsMessage[]> {
    return await db.select().from(messages)
      .where(eq(messages.numberId, numberId))
      .orderBy(desc(messages.receivedAt));
  }
}

export const storage = new DatabaseStorage();
