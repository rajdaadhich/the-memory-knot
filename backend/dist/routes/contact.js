"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
// Create a transporter using environment config
const getTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Save to database
        const contactMessage = await prisma_1.prisma.contactMessage.create({
            data: { name, email, message },
        });
        // Try sending email (Don't fail the request if email fails)
        if (process.env.EMAIL_PASS) {
            try {
                const transporter = getTransporter();
                await transporter.sendMail({
                    from: `"The Memory Knot" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    subject: `New Contact Request from ${name}`,
                    text: `You have received a new contact message.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
                });
            }
            catch (emailError) {
                console.error("Email send failed:", emailError);
            }
        }
        res.status(201).json({ message: "Contact message sent successfully", contactMessage });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit contact form" });
    }
});
exports.default = router;
