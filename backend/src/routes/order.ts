import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Create a new order
router.post("/", async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      address, 
      totalAmount, 
      items 
    } = req.body;

    // Basic validation
    if (!customerName || !customerPhone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        address,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: item.quantity || 1,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json({ order });
  } catch (error: any) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});

export default router;
