import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(email, password);
    if (res.success) {
      navigate("/");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand to-brand-dark px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📒 Khatabook</h1>
          <p className="text-gray-500 text-sm mt-1">Track your business transactions</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
