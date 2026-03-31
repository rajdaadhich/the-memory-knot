import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = await prisma.contact.create({
      data: { name, email, message },
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit message" });
  }
});

export default router;
