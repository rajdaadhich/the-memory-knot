import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Create a new order
router.post("/", async (req, res) => {
  try {
    const { 
      name, customerName, 
      email, customerEmail, 
      phone, customerPhone, 
      address, totalAmount, items 
    } = req.body;

    const order = await prisma.order.create({
      data: {
        customerName: customerName || name,
        customerEmail: customerEmail || email,
        customerPhone: customerPhone || phone,
        address,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity || 1,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Return in format expected by frontend
    res.json({ order });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
