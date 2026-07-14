const Razorpay = require("razorpay");

let razorpayInstance = null;

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your backend .env file."
    );
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

module.exports = getRazorpay;
