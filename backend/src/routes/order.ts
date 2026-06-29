import express from "express";
import prisma from "../lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Razorpay
const rzpKeyId = process.env.RAZORPAY_KEY_ID || "";
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
const razorpay = new Razorpay({
  key_id: rzpKeyId,
  key_secret: rzpKeySecret,
});

// Create a new order
router.post("/", async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      address, 
      totalAmount, 
      items,
      userId
    } = req.body;

    // Basic validation
    if (!customerName || !customerPhone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing or invalid required fields" });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        address,
        totalAmount,
        userId: userId || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: item.quantity || 1,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    let razorpayOrderId: string | null = null;

    // Create Razorpay Order if keys are valid and not dummy
    if (rzpKeyId && rzpKeySecret && rzpKeyId !== "rzp_test_dummyKeyId") {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // convert to paise
          currency: "INR",
          receipt: `receipt_order_${order.id.slice(0, 10)}`,
        });
        razorpayOrderId = rzpOrder.id;

        // Update database order with the Razorpay order ID
        await prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId },
        });
      } catch (rzpError: any) {
        console.error("Razorpay order creation failed:", rzpError);
      }
    } else {
      console.warn("Using Razorpay in mock mode or keys missing/dummy.");
      // Generate a dummy razorpayOrderId for sandbox testing if actual integration isn't active
      razorpayOrderId = `order_dummy_${order.id.slice(0, 10)}`;
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId },
      });
    }

    res.status(201).json({ 
      order,
      razorpayOrderId,
      keyId: rzpKeyId
    });
  } catch (error: any) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});

// Verify payment signature and approve order
router.post("/verify-payment", async (req: any, res: any) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required verification fields" });
    }

    let isSignatureValid = false;

    // Check for dummy bypass
    if (razorpay_payment_id === "pay_dummy_123" && razorpay_signature === "sig_dummy_123") {
      console.log("Mock verification bypass triggered successfully");
      isSignatureValid = true;
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({ error: "Razorpay secret key configuration missing on server" });
      }

      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      isSignatureValid = generatedSignature === razorpay_signature;
    }

    if (!isSignatureValid) {
      return res.status(400).json({ error: "Invalid payment signature, verification failed" });
    }

    // Update order status to APPROVED upon successful payment verification
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "APPROVED",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      include: { items: { include: { product: true } } }
    });

    // Send confirmation email
    if (updatedOrder.customerEmail) {
      console.log(`Sending order confirmed email to ${updatedOrder.customerEmail}`);
      
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: updatedOrder.customerEmail,
        subject: "🎉 Order Confirmed! - The Memory Knot Creations",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #FF69B4;">Your Order Has Been Confirmed!</h2>
            <p>Hi <strong>${updatedOrder.customerName}</strong>,</p>
            <p>Great news! We have successfully verified your payment of ₹${updatedOrder.totalAmount}. Your order has been approved and our team has started crafting your beautiful creations!</p>
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
            <p>We will send you another update with tracking details as soon as your gifts are shipped.</p>
            <p>Thank you for shopping with us!</p>
            <p style="font-style: italic;">With love,<br/>The Memory Knot Team</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions)
        .then(() => console.log("Order confirmed email sent successfully!"))
        .catch((emailError) => console.error("Failed to send order confirmation email:", emailError));
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: "Failed to verify payment", details: error.message });
  }
});


// Track order by trackingId or orderId
router.get("/track/:query", async (req, res) => {
  try {
    const { query } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: query },
          { trackingId: query }
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error: any) {
    console.error("Tracking Error:", error);
    res.status(500).json({ error: "Failed to track order" });
  }
});

// Get order details by ID for customization page
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error: any) {
    console.error("Fetch Order details error:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Submit customization details for order items
router.post("/:id/customization", async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // Array of { itemId: string, customImage: string, customNote: string }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid customizations payload" });
    }

    // Update each OrderItem record inside a transaction or concurrent promises
    await Promise.all(
      items.map((item: any) =>
        prisma.orderItem.update({
          where: { id: item.itemId },
          data: {
            customImage: item.customImage || null,
            customNote: item.customNote || null
          }
        })
      )
    );

    res.json({ success: true, message: "Customizations saved successfully" });
  } catch (error: any) {
    console.error("Customization Submit Error:", error);
    res.status(500).json({ error: "Failed to save customizations", details: error.message });
  }
});

export default router;
