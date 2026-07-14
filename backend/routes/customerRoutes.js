const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { getTransactionsForCustomer } = require("../controllers/transactionController");

router.use(protect);

router.route("/").get(getCustomers).post(createCustomer);
router.route("/:id").get(getCustomerById).put(updateCustomer).delete(deleteCustomer);
router.get("/:customerId/transactions", getTransactionsForCustomer);

module.exports = router;
