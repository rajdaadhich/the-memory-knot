"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// Create an order
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, address, totalAmount, items } = req.body;
        if (!name || !phone || !address || !items || items.length === 0) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const order = await prisma_1.prisma.order.create({
            data: {
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                address,
                totalAmount,
                items: {
                    create: items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: true,
            },
        });
        res.status(201).json({ message: "Order placed successfully", order });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create order" });
    }
});
// Update an order (Admin)
router.patch("/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const order = await prisma_1.prisma.order.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update order" });
    }
});
exports.default = router;
