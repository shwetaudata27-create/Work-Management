"use client";

import { useState } from "react";
import type { User } from "../app/types";
import { Login } from "../components/Login";
import { EmployeeDashboard } from "../components/EmployeeDashboard";
import { AdminDashboard } from "../components/AdminDashboard";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    // Clear browser history state so back button doesn't return to dashboard
    window.history.pushState({}, "", "/");
  };

  if (!user) return <Login onLogin={handleLogin} />;

  if (user.role === "admin") {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <EmployeeDashboard
      user={{ ...user, type: user.type || "software" }}
      onLogout={handleLogout}
    />
  );
}
