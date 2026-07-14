import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import AddCustomerModal from "../components/AddCustomerModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({ youWillGet: 0, youWillGive: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/customers");
      setCustomers(data.customers);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (payload) => {
    try {
      await api.post("/customers", payload);
      setShowAddModal(false);
      fetchCustomers();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to add customer" };
    }
  };

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const formatMoney = (n) =>
    Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex divide-x divide-gray-200">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500">You'll Give</p>
            <p className="text-xl font-bold text-debit">₹{formatMoney(summary.youWillGive)}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-500">You'll Get</p>
            <p className="text-xl font-bold text-credit">₹{formatMoney(summary.youWillGet)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Customer list */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          {loading && <p className="p-4 text-gray-500 text-sm">Loading...</p>}
          {!loading && filtered.length === 0 && (
            <p className="p-6 text-center text-gray-400 text-sm">No customers yet. Add your first one!</p>
          )}
          {filtered.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/customers/${c._id}`)}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-semibold flex items-center justify-center">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{c.name}</p>
                  {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${c.balance >= 0 ? "text-credit" : "text-debit"}`}>
                  ₹{formatMoney(c.balance)}
                </p>
                <p className="text-xs text-gray-400">{c.balance >= 0 ? "You'll get" : "You'll give"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-brand hover:bg-brand-dark text-white rounded-full w-14 h-14 shadow-lg text-2xl flex items-center justify-center"
        title="Add customer"
      >
        +
      </button>

      {showAddModal && (
        <AddCustomerModal onClose={() => setShowAddModal(false)} onSubmit={handleAddCustomer} />
      )}
    </div>
  );
}
