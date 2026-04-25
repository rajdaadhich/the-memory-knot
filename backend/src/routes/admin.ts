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

import crypto from "crypto";
import bcrypt from "bcryptjs";

// Admin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ role: "admin", id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, username: admin.username });
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email, frontendUrl } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return res.json({ message: "If that email exists, a reset link was sent." }); // Security: generic message
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, 10);
  
  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    }
  });

  const resetLink = `${frontendUrl || 'http://localhost:5173'}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Admin Password Reset - The Memory Knot",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your admin password. This link expires in 15 minutes.</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "If that email exists, a reset link was sent." });
  } catch (error) {
    console.error("Forgot password email error:", error);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) return res.status(400).json({ error: "Missing required fields" });

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.resetToken || !admin.resetTokenExpiry) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  if (new Date() > admin.resetTokenExpiry) {
    return res.status(400).json({ error: "Reset token has expired" });
  }

  const isValidToken = await bcrypt.compare(token, admin.resetToken);
  if (!isValidToken) {
    return res.status(400).json({ error: "Invalid reset token" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  res.json({ message: "Password has been successfully reset. You can now login." });
});

// Middleware to verify token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get Admin Profile
router.get("/profile", verifyToken, async (req: any, res: any) => {
  try {
    const adminId = req.admin.id;
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { username: true, email: true, profileImage: true, createdAt: true }
    });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update Admin Profile
router.put("/profile", verifyToken, async (req: any, res: any) => {
  try {
    const adminId = req.admin.id;
    const { username, email, profileImage, currentPassword, newPassword } = req.body;

    const dataToUpdate: any = {};
    if (username) dataToUpdate.username = username;
    if (email) dataToUpdate.email = email;
    if (profileImage !== undefined) dataToUpdate.profileImage = profileImage;

    // Handle Password Change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new password." });
      }
      
      const adminObj = await prisma.admin.findUnique({ where: { id: adminId } });
      if (!adminObj) return res.status(404).json({ error: "Admin not found" });

      const isValid = await bcrypt.compare(currentPassword, adminObj.password);
      if (!isValid) return res.status(401).json({ error: "Incorrect current password." });

      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: dataToUpdate,
      select: { username: true, email: true, profileImage: true }
    });

    res.json({ message: "Profile updated successfully", profile: updatedAdmin });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    if (error.code === 'P2002') {
       return res.status(400).json({ error: "Username or email is already taken." });
    }
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
});

// Get Admin Data
router.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ 
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  } catch (error: any) {
    console.error("Admin Get Orders Error:", error);
    res.status(500).json({ 
      error: "Failed to fetch orders", 
      details: error.message,
      code: error.code // Prisma error codes are very helpful
    });
  }
});

router.get("/contacts", verifyToken, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
    res.json(contacts);
  } catch (error: any) {
    console.error("Admin Get Contacts Error:", error);
    res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
  }
});

router.delete("/contacts/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contact.delete({ where: { id } });
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Update Order Status (With Email)
router.patch("/orders/:id", verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status, trackingId } = req.body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (trackingId !== undefined) dataToUpdate.trackingId = trackingId;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
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
      } catch (emailError) {
        console.error("Email error:", emailError);
      }
    }

    // Send Shipping email if trackingId is newly added or provided
    if (trackingId && updatedOrder.customerEmail) {
      const trackingLink = `https://www.17track.net/en/track?nums=${trackingId}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedOrder.customerEmail,
        subject: "🚀 Your Memories are on the Way! - Order Shipped",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #FF69B4;">Your Order Has Been Shipped!</h2>
            <p>Hi <strong>${updatedOrder.customerName}</strong>,</p>
            <p>Your handcrafted treasures are officially on their way to you! We have shipped your order via <strong>Trackon Couriers</strong>.</p>
            
            <div style="background: #fdf2f8; padding: 25px; border-radius: 15px; margin: 25px 0; border: 1px solid #fbcfe8; text-align: center;">
              <p style="margin-top: 0; font-size: 14px; color: #701a75; font-weight: bold;">TRACKING INFORMATION</p>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0; letter-spacing: 2px; color: #be185d;">${trackingId}</p>
              <a href="${trackingLink}" style="display: inline-block; background: #be185d; color: white; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Track Your Package</a>
              <p style="font-size: 11px; color: #9d174d; margin-top: 15px;">Note: It may take up to 24 hours for the tracking information to reflect on the courier's website.</p>
            </div>

            <p>Expect your delivery within the next few days. If you have any questions, feel free to reply to this email.</p>
            <p>Thank you for letting us be a part of your story!</p>
            <p style="font-style: italic;">With love,<br/>The Memory Knot Team</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Shipping email sent!");
      } catch (emailError) {
        console.error("Shipping email error:", emailError);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
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
