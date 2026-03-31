import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error: any) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
});

// Get featured products
router.get("/featured", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
    });
    res.json(products);
  } catch (error: any) {
    console.error("Fetch Featured Products Error:", error);
    res.status(500).json({ error: "Failed to fetch featured products", details: error.message });
  }
});

export default router;
