const crypto = require("crypto");
const getRazorpay = require("../config/razorpay");
const Customer = require("../models/Customer");
const Transaction = require("../models/Transaction");

// @route POST /api/payments/create-order
// body: { customerId, amount, description }
const createOrder = async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({ message: "customerId and a valid amount are required" });
    }

    const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const razorpay = getRazorpay();

    // Razorpay expects amount in paise (smallest currency unit)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `khb_${customer._id}_${Date.now()}`,
      notes: {
        customerId: customer._id.toString(),
        userId: req.user._id.toString(),
        description: description || "",
      },
    });

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customerName: customer.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create payment order" });
  }
};

// @route POST /api/payments/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerId, amount, description }
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerId,
      amount,
      description,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !customerId || !amount) {
      return res.status(400).json({ message: "Missing required payment verification fields" });
    }

    const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Verify the signature Razorpay sent back, using our secret key.
    // This proves the payment response genuinely came from Razorpay and wasn't faked by the client.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    // Signature is valid — record this as a "you_got" (credit) transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      customer: customer._id,
      type: "you_got",
      amount,
      description: description || `Online payment (Razorpay: ${razorpay_payment_id})`,
      date: Date.now(),
    });

    res.status(201).json({ message: "Payment verified", transaction });
  } catch (err) {
    res.status(500).json({ message: err.message || "Payment verification error" });
  }
};

module.exports = { createOrder, verifyPayment };
