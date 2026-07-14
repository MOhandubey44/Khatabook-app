const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    openingBalance: { type: Number, default: 0 }, // positive = customer owes you, negative = you owe customer
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
