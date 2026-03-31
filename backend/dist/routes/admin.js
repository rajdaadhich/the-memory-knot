"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
router.use((req, res, next) => {
    console.log(`Admin Router receiving: ${req.method} ${req.url}`);
    next();
});
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
// Helper for sending email
const sendOrderEmail = async (order) => {
    if (!process.env.EMAIL_PASS || !order.customerEmail)
        return;
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const itemsList = order.items.map((item) => `- ${item.product.name} (x${item.quantity})`).join('\n');
    await transporter.sendMail({
        from: `"The Memory Knot" <${process.env.EMAIL_USER}>`,
        to: order.customerEmail,
        subject: `Order Approved: ${order.id.slice(0, 8)}`,
        text: `Hello ${order.customerName},\n\nGood news! Your order has been approved and we've started working on it.\n\nOrder Details:\n${itemsList}\nTotal: ₹${order.totalAmount}\n\nWe will notify you once it's shipped. Thank you for choosing The Memory Knot!\n\nBest regards,\nThe Memory Knot Team`,
    });
};
// Admin product endpoints
router.post("/products", verifyAdmin, async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.create({ data: req.body });
        res.status(201).json(product);
    }
    catch (error) {
        console.error("API Error [POST /admin/products]:", error);
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
        console.error("API Error [PUT /admin/products/:id]:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});
router.delete("/products/:id", verifyAdmin, async (req, res) => {
    try {
        await prisma_1.prisma.product.delete({ where: { id: req.params.id } });
        res.json({ message: "Product deleted" });
    }
    catch (error) {
        console.error("API Error [DELETE /admin/products/:id]:", error);
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
        console.error("API Error [GET /admin/orders]:", error);
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
        console.error("API Error [GET /admin/contacts]:", error);
        res.status(500).json({ error: "Failed to fetch contact messages" });
    }
});
// Update Order Status
router.patch("/orders/:id", verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma_1.prisma.order.update({
            where: { id: req.params.id },
            data: { status },
            include: { items: { include: { product: true } } }
        });
        if (status === 'APPROVED') {
            try {
                await sendOrderEmail(order);
            }
            catch (emailError) {
                console.error("❌ Email failed for order:", order.id);
                console.error("Reason:", emailError.message);
            }
        }
        res.json(order);
    }
    catch (error) {
        console.error("API Error [PATCH /admin/orders/:id]:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});
exports.default = router;
