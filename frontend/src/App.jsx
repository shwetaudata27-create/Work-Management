"use client";

import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { User } from "./types";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { AdminDashboard } from "./components/AdminDashboard";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  if (!user) return <Login onLogin={handleLogin} />;
  if (user.role === "admin")
    return <AdminDashboard user={user} onLogout={() => setUser(null)} />;

  return (
    <EmployeeDashboard
      user={{ ...user, type: user.type || "software" }}
      onLogout={() => setUser(null)}
    />
  );
}
