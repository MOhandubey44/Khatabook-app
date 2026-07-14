import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", businessName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await register(form);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand to-brand-dark px-4 py-10">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📒 Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Start tracking your khata digitally</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Full name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Business name (optional)</label>
            <input
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone (optional)</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60 mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
