import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { Decimal } from "decimal.js";

// Mock 247OTP service for now, but structured to call the real API
// In a real implementation, you'd use axios/fetch to call https://247otp.ng/api.php
const OTP_API_URL = "https://247otp.ng/api.php";
// const OTP_API_KEY = process.env.OTP_API_KEY; // Use secret in prod

async function fetchAvailableServices() {
  // Mock data matching the fintech/premium feel
  return [
    { service: "whatsapp", country: "Nigeria", cost: 150.00, count: 50 },
    { service: "telegram", country: "Nigeria", cost: 100.00, count: 120 },
    { service: "facebook", country: "Nigeria", cost: 80.00, count: 200 },
    { service: "whatsapp", country: "USA", cost: 500.00, count: 10 },
    { service: "openai", country: "USA", cost: 250.00, count: 25 },
  ];
}

async function orderNumberFromApi(service: string, country: string) {
  // Mock response
  return {
    phoneNumber: `+${Math.floor(Math.random() * 10000000000)}`,
    orderId: `ord_${Math.random().toString(36).substring(7)}`,
    cost: service === "whatsapp" ? "150.00" : "100.00" // Simple logic
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);

  // --- Wallet ---
  app.get(api.wallet.balance.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const user = await storage.getUser(req.user.id);
    res.json({ balance: user?.balance || "0.00" });
  });

  app.get(api.wallet.transactions.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const txs = await storage.getTransactions(req.user.id);
    res.json(txs);
  });

  app.post(api.wallet.deposit.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const { amount } = req.body;
    
    // In reality, verify payment gateway (Stripe/Paystack) here
    // For now, mock deposit
    const depositAmount = new Decimal(amount);
    const user = await storage.getUser(req.user.id);
    const currentBalance = new Decimal(user?.balance || "0");
    const newBalance = currentBalance.plus(depositAmount);

    await storage.updateUserBalance(req.user.id, newBalance.toString());
    await storage.createTransaction({
      userId: req.user.id,
      amount: depositAmount.toString(),
      type: "deposit",
      description: "Wallet Deposit"
    });

    const updatedUser = await storage.getUser(req.user.id);
    res.json(updatedUser);
  });

  // --- Numbers ---
  app.get(api.numbers.list.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const numbersList = await storage.getNumbers(req.user.id);
    res.json(numbersList);
  });

  app.get(api.numbers.available.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const services = await fetchAvailableServices();
    res.json(services);
  });

  app.post(api.numbers.buy.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const { service, country } = api.numbers.buy.input.parse(req.body);

    const user = await storage.getUser(req.user.id);
    const balance = new Decimal(user?.balance || "0");
    
    // Determine cost (mock logic)
    const cost = new Decimal(service === "whatsapp" ? 150 : 100);

    if (balance.lessThan(cost)) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Order from API
    const apiOrder = await orderNumberFromApi(service, country);

    // Deduct balance
    const newBalance = balance.minus(cost);
    await storage.updateUserBalance(req.user.id, newBalance.toString());
    
    // Create Transaction
    await storage.createTransaction({
      userId: req.user.id,
      amount: cost.negated().toString(), // Negative for debit
      type: "purchase",
      description: `Purchased ${service} number (${country})`
    });

    // Save Number
    const number = await storage.createNumber({
      userId: req.user.id,
      phoneNumber: apiOrder.phoneNumber,
      service,
      country,
      cost: cost.toString(),
      status: "active",
      orderId: apiOrder.orderId,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000) // 20 mins expiry
    });

    res.status(201).json(number);
  });

  app.post(api.numbers.cancel.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const number = await storage.getNumber(id);
    
    if (!number || number.userId !== req.user.id) {
      return res.sendStatus(404);
    }

    await storage.updateNumberStatus(id, "cancelled");
    res.sendStatus(200);
  });

  // --- Messages ---
  app.get(api.messages.list.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const number = await storage.getNumber(id);
    
    if (!number || number.userId !== req.user.id) {
      return res.sendStatus(404);
    }

    // In a real app, fetch from API here and cache in DB
    // await fetchMessagesFromApi(number.orderId);

    const msgs = await storage.getMessages(id);
    res.json(msgs);
  });

  return httpServer;
}
