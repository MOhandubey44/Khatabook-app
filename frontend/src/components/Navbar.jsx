import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-brand text-white sticky top-0 z-10 shadow">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-lg cursor-pointer" onClick={() => navigate("/")}>
          📒 Khatabook
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline">{user?.businessName || user?.name}</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
