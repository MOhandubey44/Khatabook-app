const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    // "you_gave"  -> you gave money/goods to customer (increases what customer owes you)
    // "you_got"   -> you received money from customer (decreases what customer owes you)
    type: { type: String, enum: ["you_gave", "you_got"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
