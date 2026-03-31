import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "the_memory_knot_super_secret";

// Email Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Admin Login
router.post("/login", (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid password" });
});

// Middleware to verify token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get Admin Data
router.get("/orders", verifyToken, async (req, res) => {
  const orders = await prisma.order.findMany({ 
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json(orders);
});

router.get("/contacts", verifyToken, async (req, res) => {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  res.json(contacts);
});

// Update Order Status (With Email)
router.patch("/orders/:id", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } }
    });

    // Send confirmation email if status is APPROVED
    if (status === "APPROVED" && updatedOrder.customerEmail) {
      console.log(`Sending approval email to ${updatedOrder.customerEmail}`);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedOrder.customerEmail,
        subject: "🎉 Order Confirmed! - The Memory Knot Creations",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #FF69B4;">Your Order Has Been Approved!</h2>
            <p>Hi <strong>${updatedOrder.customerName}</strong>,</p>
            <p>Great news! We have approved your order and are now working on crafting your personalized treasures.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary:</h3>
              <p><strong>Order ID:</strong> ${updatedOrder.id.slice(0, 8)}</p>
              <p><strong>Items:</strong></p>
              <ul>
                ${updatedOrder.items.map((item: any) => `
                  <li>${item.product.name} (x${item.quantity}) - ₹${item.price}</li>
                `).join("")}
              </ul>
              <hr style="border: none; border-top: 1px solid #ddd;" />
              <p><strong>Total Amount:</strong> ₹${updatedOrder.totalAmount}</p>
            </div>
            <p>We will notify you once your order is ready for delivery.</p>
            <p>Thank you for choosing <strong>The Memory Knot Creations</strong> to preserve your memories!</p>
            <p style="font-style: italic;">With love,<br/>The Memory Knot Team</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
      } catch (emailError) {
        console.error("Email error details:", emailError);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Product Management
router.post("/products", verifyToken, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    const product = await prisma.product.create({ data });
    res.json(product);
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/products/:id", verifyToken, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(product);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", verifyToken, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
