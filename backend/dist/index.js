"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Initialize the app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`Global Request: ${req.method} ${req.url}`);
    next();
});
// Basic health check
app.get("/", (req, res) => {
    res.send({ status: "API is running", message: "Memory Knot Backend" });
});
// Import Routes
const product_1 = __importDefault(require("./routes/product"));
const order_1 = __importDefault(require("./routes/order"));
const contact_1 = __importDefault(require("./routes/contact"));
const admin_1 = __importDefault(require("./routes/admin"));
// Use Routes
app.use("/api/products", product_1.default);
app.use("/api/orders", order_1.default);
app.use("/api/contact", contact_1.default);
app.use("/api/admin", admin_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Express Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
