import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("khatabook_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("khatabook_token", data.token);
      localStorage.setItem("khatabook_user", JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("khatabook_token", data.token);
      localStorage.setItem("khatabook_user", JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("khatabook_token");
    localStorage.removeItem("khatabook_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
