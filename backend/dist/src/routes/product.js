"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// Get all products
router.get("/", async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});
// Get featured products
router.get("/featured", async (req, res) => {
    try {
        const products = await prisma_1.prisma.product.findMany({
            where: { featured: true },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch featured products" });
    }
});
exports.default = router;
