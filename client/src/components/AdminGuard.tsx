// Admin Authentication Guard
// Simple password protection for admin routes

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, AlertCircle } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if already authenticated (stored in sessionStorage)
    const authToken = sessionStorage.getItem("admin_auth");
    if (authToken === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Verify password with backend
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error("Invalid password");
      }

      // Store authentication in sessionStorage (cleared on browser close)
      sessionStorage.setItem("admin_auth", "authenticated");
      setIsAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError("Invalid password. Please try again.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setLocation("/");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Admin Access
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Enter your admin password to continue
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Sign In
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/")}
              >
                Back to Home
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                This is a protected admin area. Session expires when browser is closed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render admin panel with logout button
  return (
    <div>
      <div className="bg-primary text-primary-foreground p-2 text-center text-sm flex items-center justify-center gap-4">
        <Lock className="h-4 w-4" />
        <span>Admin Mode</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          className="ml-auto mr-4"
        >
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
}
