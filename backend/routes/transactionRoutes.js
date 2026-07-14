const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.use(protect);

router.post("/", createTransaction);
router.route("/:id").put(updateTransaction).delete(deleteTransaction);

module.exports = router;
