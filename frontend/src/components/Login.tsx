"use client";

import { useState, FormEvent } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import type { User, Role } from "../app/types";

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const { toast } = useToast();

  // ---- handle login ----
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // ✅ Normalize role and type
      const role: Role = data.user.role === "admin" ? "admin" : "employee";
      const rawType = data.user.type;
      const validType =
        rawType === "software" || rawType === "hardware" ? rawType : null;

      const user: User = { ...data.user, role, type: validType };

      if (user.role === "employee" && !validType) {
        // new employee → must pick type
        setAuthenticatedUser(user);
        setShowTypeSelection(true);
        toast({
          title: "Authentication Successful",
          description: "Please select your project type to continue",
        });
      } else {
        // existing employee/admin with valid type
        onLogin(user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.username}!`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- handle project type selection ----
  // ---- handle project type selection ----
const handleTypeSelection = async () => {
  if (!selectedType || !authenticatedUser) {
    toast({ title: "Selection Required", description: "Please select your project type", variant: "destructive" });
    return;
  }

  try {
    // Save the type in backend
    await fetch(`http://localhost:5000.onrender.com/api/set-type/${authenticatedUser.username}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selectedType }),
    });

    const userWithType: User = { ...authenticatedUser, type: selectedType as "software" | "hardware" };
    onLogin(userWithType);
    toast({ title: "Type Saved", description: `You are now logged in as ${selectedType}` });
  } catch (err: any) {
    toast({ title: "Error", description: err.message || "Failed to save type", variant: "destructive" });
  }
};


  // ---- render type selection ----
  if (showTypeSelection && authenticatedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Select Project Type
            </CardTitle>
            <CardDescription>
              Choose your work specialization, {authenticatedUser.username}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="projectType">Project Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select your project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleTypeSelection}
              className="w-full"
              disabled={loading}
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- render login form ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Work Management System
          </CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
