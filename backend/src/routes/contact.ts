import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const contact = await prisma.contact.create({
      data: { name, email, message },
    });
    res.status(201).json(contact);
  } catch (error: any) {
    console.error("Contact Submission Error:", error);
    res.status(500).json({ error: "Failed to submit message", details: error.message });
  }
});

export default router;
