import React, { useState } from "react";

export default function AddTransactionModal({ type, onClose, onSubmit }) {
  const isGave = type === "you_gave";
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await onSubmit({ type, amount: Number(amount), description, date });
    setSubmitting(false);
    if (!res.success) setError(res.message);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20">
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6">
        <h2 className={`text-lg font-semibold mb-4 ${isGave ? "text-debit" : "text-credit"}`}>
          {isGave ? "You Gave (₹)" : "You Got (₹)"}
        </h2>

        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Amount*</label>
            <input
              autoFocus
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Details</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="e.g. Cash payment, Invoice #12"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 text-white rounded-lg py-2.5 font-medium disabled:opacity-60 ${
                isGave ? "bg-debit hover:bg-red-700" : "bg-credit hover:bg-green-700"
              }`}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
