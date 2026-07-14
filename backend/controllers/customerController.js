const Customer = require("../models/Customer");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// Helper: compute balance for a list of customer ids
const computeBalances = async (userId, customerIds) => {
  const results = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        customer: { $in: customerIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $group: {
        _id: "$customer",
        gave: { $sum: { $cond: [{ $eq: ["$type", "you_gave"] }, "$amount", 0] } },
        got: { $sum: { $cond: [{ $eq: ["$type", "you_got"] }, "$amount", 0] } },
      },
    },
  ]);

  const map = {};
  results.forEach((r) => {
    map[r._id.toString()] = r.gave - r.got;
  });
  return map;
};

// @route GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user._id }).sort({ createdAt: -1 });
    const balanceMap = await computeBalances(
      req.user._id,
      customers.map((c) => c._id)
    );

    const withBalances = customers.map((c) => {
      const txnNet = balanceMap[c._id.toString()] || 0;
      const balance = c.openingBalance + txnNet;
      return { ...c.toObject(), balance };
    });

    const youWillGet = withBalances.filter((c) => c.balance > 0).reduce((s, c) => s + c.balance, 0);
    const youWillGive = withBalances.filter((c) => c.balance < 0).reduce((s, c) => s + Math.abs(c.balance), 0);

    res.json({ customers: withBalances, summary: { youWillGet, youWillGive, net: youWillGet - youWillGive } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, phone, openingBalance, notes } = req.body;
    if (!name) return res.status(400).json({ message: "Customer name is required" });

    const customer = await Customer.create({
      user: req.user._id,
      name,
      phone,
      openingBalance: openingBalance || 0,
      notes,
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const balanceMap = await computeBalances(req.user._id, [customer._id]);
    const balance = customer.openingBalance + (balanceMap[customer._id.toString()] || 0);

    res.json({ ...customer.toObject(), balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const { name, phone, openingBalance, notes } = req.body;
    if (name !== undefined) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (openingBalance !== undefined) customer.openingBalance = openingBalance;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    await Transaction.deleteMany({ customer: customer._id, user: req.user._id });
    await customer.deleteOne();

    res.json({ message: "Customer and related transactions deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
