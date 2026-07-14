import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import AddTransactionModal from "../components/AddTransactionModal";

export default function CustomerLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // "you_gave" | "you_got" | null

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/customers/${id}/transactions`);
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id]);

  const handleAddTransaction = async (payload) => {
    try {
      await api.post("/transactions", { customerId: id, ...payload });
      setModalType(null);
      fetchLedger();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to save entry" };
    }
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api.delete(`/transactions/${transactionId}`);
      fetchLedger();
    } catch (err) {
      console.error(err);
    }
  };

  const formatMoney = (n) =>
    Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  const { customer, transactions, currentBalance } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-brand text-white sticky top-0 z-10 shadow">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-xl leading-none">
            ←
          </button>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{customer.name}</p>
            {customer.phone && <p className="text-xs text-white/70">{customer.phone}</p>}
          </div>
        </div>
      </div>

      {/* Balance summary */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm mt-4 p-4 text-center">
          <p className="text-xs text-gray-500">
            {currentBalance >= 0 ? "You will get" : "You will give"}
          </p>
          <p className={`text-2xl font-bold ${currentBalance >= 0 ? "text-credit" : "text-debit"}`}>
            ₹{formatMoney(currentBalance)}
          </p>
        </div>

        {/* Column headers */}
        <div className="flex text-xs text-gray-500 mt-4 px-1">
          <div className="flex-1">You Gave</div>
          <div className="flex-1 text-right">You Got</div>
        </div>

        {/* Transactions list */}
        <div className="mt-2 space-y-2">
          {transactions.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No entries yet. Add the first transaction.</p>
          )}
          {transactions.map((t) => (
            <div key={t._id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center justify-between">
              <div className={`flex-1 ${t.type !== "you_gave" ? "invisible" : ""}`}>
                <p className="text-debit font-semibold">₹{formatMoney(t.amount)}</p>
              </div>
              <div className="flex-1 text-center text-xs text-gray-400">
                <p>{formatDate(t.date)}</p>
                {t.description && <p className="truncate max-w-[120px] mx-auto">{t.description}</p>}
                <button
                  onClick={() => handleDelete(t._id)}
                  className="text-[11px] text-gray-300 hover:text-red-500 mt-0.5"
                >
                  delete
                </button>
              </div>
              <div className={`flex-1 text-right ${t.type !== "you_got" ? "invisible" : ""}`}>
                <p className="text-credit font-semibold">₹{formatMoney(t.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto flex">
          <button
            onClick={() => setModalType("you_gave")}
            className="flex-1 bg-debit text-white font-semibold py-4"
          >
            ↓ You Gave
          </button>
          <button
            onClick={() => setModalType("you_got")}
            className="flex-1 bg-credit text-white font-semibold py-4"
          >
            ↑ You Got
          </button>
        </div>
      </div>

      {modalType && (
        <AddTransactionModal
          type={modalType}
          onClose={() => setModalType(null)}
          onSubmit={handleAddTransaction}
        />
      )}
    </div>
  );
}
