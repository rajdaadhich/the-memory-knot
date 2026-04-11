import express from "express";
import prisma from "../lib/prisma";
import nodemailer from "nodemailer";

const router = express.Router();

import dotenv from "dotenv";
dotenv.config();


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
      include: { items: { include: { product: true } } },
    });

    if (customerEmail) {
      console.log(`Sending order received email to ${customerEmail}`);
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: "🛍️ Order Received - The Memory Knot Creations",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #FF69B4;">Thank you for your order!</h2>
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>We have successfully received your order details and are currently waiting for payment verification. Once your UPI payment is confirmed, we will begin crafting your beautiful gifts!</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary:</h3>
              <p><strong>Order ID:</strong> ${order.id.slice(0, 8)}</p>
              <hr style="border: none; border-top: 1px solid #ddd;" />
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            </div>
            <p>If you haven't completed the payment yet, please ensure it is done within 24 hours so we can promptly process your order.</p>
            <p>You'll receive another update once your order is fully approved!</p>
            <p style="font-style: italic;">With love,<br/>The Memory Knot Team</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Order received email sent successfully!");
      } catch (emailError) {
        console.error("Failed to send order email:", emailError);
      }
    }

    res.status(201).json({ order });
  } catch (error: any) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});

export default router;
