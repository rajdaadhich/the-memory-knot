"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};
// Simple admin login (hardcoded simple password check for demonstration)
router.post("/login", (req, res) => {
    const { password } = req.body;
    if (password === JWT_SECRET) {
        const token = jsonwebtoken_1.default.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
        res.json({ token });
    }
    else {
        res.status(401).json({ error: "Invalid password" });
    }
});
// Admin product endpoints
router.post("/products", verifyAdmin, async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.create({ data: req.body });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create product" });
    }
});
router.put("/products/:id", verifyAdmin, async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
});
router.delete("/products/:id", verifyAdmin, async (req, res) => {
    try {
        await prisma_1.prisma.product.delete({ where: { id: req.params.id } });
        res.json({ message: "Product deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});
// Get all orders
router.get("/orders", verifyAdmin, async (req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
// Get all missing contacts
router.get("/contacts", verifyAdmin, async (req, res) => {
    try {
        const contacts = await prisma_1.prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(contacts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch contact messages" });
    }
});
exports.default = router;
