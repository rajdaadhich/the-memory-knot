import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables");
}

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address
      }
    });

    const token = jwt.sign({ role: "user", id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to register customer", details: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ role: "user", id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address } });
  } catch (error: any) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// Middleware to verify customer token
const verifyUserToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "user") {
      return res.status(403).json({ error: "Access denied" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Get User Profile
router.get("/profile", verifyUserToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update User Profile
router.put("/profile", verifyUserToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, currentPassword, newPassword } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (address !== undefined) dataToUpdate.address = address;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password." });
      }

      const userObj = await prisma.user.findUnique({ where: { id: userId } });
      if (!userObj) return res.status(404).json({ error: "User not found" });

      const isValid = await bcrypt.compare(currentPassword, userObj.password);
      if (!isValid) return res.status(401).json({ error: "Incorrect current password." });

      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, phone: true, address: true }
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
});

// Get User Orders
router.get("/orders", verifyUserToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

// Get User Cart
router.get("/cart", verifyUserToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });
    const formatted = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch cart items", details: error.message });
  }
});

// Bulk Sync User Cart
router.post("/cart/sync", verifyUserToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid cart items format" });
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId } }),
      prisma.cartItem.createMany({
        data: items.map((item: any) => ({
          userId,
          productId: item.id,
          quantity: item.quantity
        }))
      })
    ]);

    const updatedCart = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });

    const formatted = updatedCart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity
    }));

    res.json({ message: "Cart synced successfully", cart: formatted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to sync cart", details: error.message });
  }
});

// Google OAuth Login / Register
router.post("/google-login", async (req: any, res: any) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Google credential token is required" });
  }

  try {
    // Verify ID token via Google's tokeninfo API
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const googleRes = await fetch(verifyUrl);
    if (!googleRes.ok) {
      return res.status(400).json({ error: "Invalid Google credential token" });
    }

    const payload = await googleRes.json();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ error: "Google account does not provide email" });
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user if they don't exist yet
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await prisma.user.create({
        data: {
          name: name || "Google User",
          email,
          password: hashedPassword,
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: "user", id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Google authentication failed", details: error.message });
  }
});

export default router;
