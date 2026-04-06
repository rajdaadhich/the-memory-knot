import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}


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
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is missing from .env");
    return res.status(500).json({ error: "Server configuration error" });
  }

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
router.post("/products", verifyToken, async (req: any, res: any) => {
  try {
    const { name, price, description, image, category, featured, isSoldOut } = req.body;
    
    if (!name || isNaN(parseFloat(price))) {
      return res.status(400).json({ error: "Product name and valid price are required" });
    }

    const product = await prisma.product.create({ 
      data: { 
        name, 
        price: parseFloat(price), 
        description, 
        image, 
        category, 
        featured: Boolean(featured),
        isSoldOut: Boolean(isSoldOut)
      } 
    });
    res.status(201).json(product);
  } catch (error: any) {
    console.error("Create Product Error:", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
});

router.put("/products/:id", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    
    if (data.price) data.price = parseFloat(data.price);
    if (data.featured !== undefined) data.featured = Boolean(data.featured);
    if (data.isSoldOut !== undefined) data.isSoldOut = Boolean(data.isSoldOut);

    const product = await prisma.product.update({ 
      where: { id }, 
      data 
    });
    res.json(product);
  } catch (error: any) {
    console.error("Update Product Error:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
});

router.delete("/products/:id", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to delete product", details: error.message });
  }
});

export default router;
