import React, { useState } from "react";
import api from "../api/axios";

export default function CollectPaymentModal({ customer, onClose, onSuccess }) {
  const [tab, setTab] = useState("upi"); // "upi" | "razorpay"
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [upiId, setUpiId] = useState(() => localStorage.getItem("khatabook_upi_id") || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const payeeName = JSON.parse(localStorage.getItem("khatabook_user") || "{}")?.businessName ||
    JSON.parse(localStorage.getItem("khatabook_user") || "{}")?.name || "Merchant";

  const buildUpiLink = () => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      am: amount,
      cu: "INR",
      tn: description || `Payment from ${customer.name}`,
    });
    return `upi://pay?${params.toString()}`;
  };

  const handleShowQr = (e) => {
    e.preventDefault();
    if (!upiId.trim()) {
      setError("Enter your UPI ID (e.g. yourname@okhdfcbank) to generate a QR code");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setError("");
    localStorage.setItem("khatabook_upi_id", upiId);
    setShowQr(true);
  };

  const handleMarkReceived = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/transactions", {
        customerId: customer._id,
        type: "you_got",
        amount: Number(amount),
        description: description || "UPI payment received",
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayPay = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!window.Razorpay) {
      setError("Payment SDK failed to load. Check your internet connection and try again.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data: order } = await api.post("/payments/create-order", {
        customerId: customer._id,
        amount: Number(amount),
        description,
      });

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: payeeName,
        description: description || `Payment from ${customer.name}`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customerId: customer._id,
              amount: Number(amount),
              description,
            });
            onSuccess();
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
        theme: { color: "#4640DE" },
      });

      rzp.on("payment.failed", function (response) {
        setError(response.error?.description || "Payment failed");
        setSubmitting(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Could not start payment. Check Razorpay keys in backend .env");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20">
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Collect Payment</h2>
        <p className="text-sm text-gray-500 mb-4">from {customer.name}</p>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4 text-sm">
          <button
            onClick={() => { setTab("upi"); setShowQr(false); setError(""); }}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${
              tab === "upi" ? "bg-white shadow text-brand" : "text-gray-500"
            }`}
          >
            UPI QR
          </button>
          <button
            onClick={() => { setTab("razorpay"); setError(""); }}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${
              tab === "razorpay" ? "bg-white shadow text-brand" : "text-gray-500"
            }`}
          >
            Card / Netbanking
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}

        {/* Common amount + description fields */}
        <div className="space-y-3 mb-2">
          <div>
            <label className="text-sm text-gray-600">Amount*</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setShowQr(false); }}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Note (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="e.g. Invoice #12"
            />
          </div>
        </div>

        {tab === "upi" && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Your UPI ID</label>
              <input
                value={upiId}
                onChange={(e) => { setUpiId(e.target.value); setShowQr(false); }}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="yourname@okhdfcbank"
              />
              <p className="text-xs text-gray-400 mt-1">Saved on this device so you don't have to retype it.</p>
            </div>

            {!showQr && (
              <button
                onClick={handleShowQr}
                className="w-full bg-brand hover:bg-brand-dark text-white rounded-lg py-2.5 font-medium"
              >
                Generate QR Code
              </button>
            )}

            {showQr && (
              <div className="text-center pt-1">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(buildUpiLink())}`}
                  alt="UPI QR code"
                  className="mx-auto rounded-lg border border-gray-200"
                  width={220}
                  height={220}
                />
                <p className="text-xs text-gray-500 mt-2">Ask the customer to scan this with any UPI app</p>
                <a
                  href={buildUpiLink()}
                  className="text-xs text-brand underline block mt-1"
                >
                  Or open directly in a UPI app (on phone)
                </a>

                <button
                  onClick={handleMarkReceived}
                  disabled={submitting}
                  className="w-full bg-credit hover:bg-green-700 text-white rounded-lg py-2.5 font-medium mt-4 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "✓ Mark as Received"}
                </button>
                <p className="text-[11px] text-gray-400 mt-1">
                  UPI QR payments aren't auto-detected — tap this once the customer confirms they've paid.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "razorpay" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Opens Razorpay's secure checkout — customer can pay by card, netbanking, wallet, or UPI. Entry is added automatically once payment succeeds.
            </p>
            <button
              onClick={handleRazorpayPay}
              disabled={submitting}
              className="w-full bg-brand hover:bg-brand-dark text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
            >
              {submitting ? "Opening..." : "Pay Now"}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium mt-3"
        >
          Close
        </button>
      </div>
    </div>
  );
}
