import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

// Get products with pagination + filtering
router.get("/", async (req, res) => {
  try {
    const page        = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit       = Math.min(50, parseInt(req.query.limit as string) || 12);
    const skip        = (page - 1) * limit;
    const category    = req.query.category as string | undefined;
    const subCategory = req.query.subCategory as string | undefined;
    const occasion    = req.query.occasion as string | undefined;
    const giftFor     = req.query.giftFor as string | undefined;
    const search      = req.query.search   as string | undefined;
    const sort        = req.query.sort     as string | undefined;
    const minPrice    = parseInt(req.query.minPrice as string);
    const maxPrice    = parseInt(req.query.maxPrice as string);

    // Build where clause with support for multi-select (comma-separated values)
    const where: any = {};
    const andClauses: any[] = [];

    if (category && category !== 'All') {
      andClauses.push({ category: { contains: category, mode: 'insensitive' } });
    }

    if (subCategory && subCategory !== 'All') {
      const subCategories = subCategory.split(',').map(s => s.trim()).filter(Boolean);
      if (subCategories.length > 0) {
        andClauses.push({
          OR: subCategories.map(s => ({
            subCategory: { contains: s, mode: 'insensitive' }
          }))
        });
      }
    }

    if (occasion && occasion !== 'All') {
      const occasions = occasion.split(',').map(s => s.trim()).filter(Boolean);
      if (occasions.length > 0) {
        andClauses.push({
          OR: occasions.map(o => ({
            occasion: { contains: o, mode: 'insensitive' }
          }))
        });
      }
    }

    if (giftFor && giftFor !== 'All') {
      const giftFors = giftFor.split(',').map(s => s.trim()).filter(Boolean);
      if (giftFors.length > 0) {
        andClauses.push({
          OR: giftFors.map(g => ({
            giftFor: { contains: g, mode: 'insensitive' }
          }))
        });
      }
    }

    if (search) {
      andClauses.push({
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      });
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      const priceFilter: any = {};
      if (!isNaN(minPrice)) priceFilter.gte = minPrice;
      if (!isNaN(maxPrice)) priceFilter.lte = maxPrice;
      andClauses.push({ price: priceFilter });
    }

    if (andClauses.length > 0) {
      where.AND = andClauses;
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

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    console.error("Fetch Product Details Error:", error);
    res.status(500).json({ error: "Failed to fetch product details", details: error.message });
  }
});

export default router;
