const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");

// @route GET /api/customers/:customerId/transactions
const getTransactionsForCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.customerId, user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const transactions = await Transaction.find({ customer: customer._id, user: req.user._id }).sort({
      date: 1,
      createdAt: 1,
    });

    // build running balance starting from opening balance
    let running = customer.openingBalance;
    const withRunning = transactions.map((t) => {
      running += t.type === "you_gave" ? t.amount : -t.amount;
      return { ...t.toObject(), runningBalance: running };
    });

    res.json({
      customer,
      openingBalance: customer.openingBalance,
      transactions: withRunning.reverse(), // most recent first
      currentBalance: running,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { customerId, type, amount, description, date } = req.body;

    if (!customerId || !type || !amount) {
      return res.status(400).json({ message: "customerId, type and amount are required" });
    }
    if (!["you_gave", "you_got"].includes(type)) {
      return res.status(400).json({ message: "type must be 'you_gave' or 'you_got'" });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: "amount must be greater than 0" });
    }

    const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const transaction = await Transaction.create({
      user: req.user._id,
      customer: customerId,
      type,
      amount,
      description,
      date: date || Date.now(),
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const { type, amount, description, date } = req.body;
    if (type !== undefined) {
      if (!["you_gave", "you_got"].includes(type)) {
        return res.status(400).json({ message: "type must be 'you_gave' or 'you_got'" });
      }
      transaction.type = type;
    }
    if (amount !== undefined) {
      if (amount <= 0) return res.status(400).json({ message: "amount must be greater than 0" });
      transaction.amount = amount;
    }
    if (description !== undefined) transaction.description = description;
    if (date !== undefined) transaction.date = date;

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTransactionsForCustomer,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
