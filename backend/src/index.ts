import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// Initialize the app
const app = express();

// Disable Caching (Forces 200 OK instead of 304 Not Modified)
app.set("etag", false);

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:5173"
].filter(Boolean) as string[];

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Global Request: ${req.method} ${req.url}`);
  next();
});

// Basic health check (Critical for Render Verification)
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "API is running", 
    message: "Memory Knot Backend Restored", 
    environment: process.env.NODE_ENV || "development" 
  });
});

// Import Routes
import productRoutes from "./routes/product";
import orderRoutes from "./routes/order";
import contactRoutes from "./routes/contact";
import adminRoutes from "./routes/admin";

// Use Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
