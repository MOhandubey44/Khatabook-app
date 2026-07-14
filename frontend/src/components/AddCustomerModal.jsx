import React, { useState } from "react";

export default function AddCustomerModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [balanceType, setBalanceType] = useState("get"); // "get" = customer owes you, "give" = you owe customer
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSubmitting(true);
    setError("");
    const rawBalance = Number(openingBalance) || 0;
    const signedBalance = balanceType === "get" ? rawBalance : -rawBalance;

    const res = await onSubmit({ name, phone, openingBalance: signedBalance });
    setSubmitting(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20">
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Customer</h2>

        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Customer name*</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Opening balance</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                min="0"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="0"
              />
              <select
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
              >
                <option value="get">You'll get</option>
                <option value="give">You'll give</option>
              </select>
            </div>
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
              className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
