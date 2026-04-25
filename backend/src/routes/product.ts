import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Get products with pagination + filtering
router.get("/", async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit    = Math.min(50, parseInt(req.query.limit as string) || 12);
    const skip     = (page - 1) * limit;
    const category = req.query.category as string | undefined;
    const search   = req.query.search   as string | undefined;
    const sort     = req.query.sort     as string | undefined;

    // Build where clause
    const where: any = {};
    if (category && category !== 'All') {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc')  orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'newest')     orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: limit }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      total,
      page,
      limit,
      hasMore: skip + products.length < total,
    });
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
