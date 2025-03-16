'use client';

import { useState, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Supabase configuration
const supabaseUrl = 'https://jkcayrmgwoesijfqttyw.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprY2F5cm1nd29lc2lqZnF0dHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDc2NTEsImV4cCI6MjA1NjA4MzY1MX0.RHDL6FnGny07CzXPcsQ73l0Pzp8m3PMIgmOVIC04bsI";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [user, setUser] = useState<null | User>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testId, setTestId] = useState('');
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setEmail(data.user.email || "");

        // Check if chrome.storage exists (prevents crashes outside Chrome)
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.get(["test_id", "risk_scores"], (result) => {
            if (result.test_id) setTestId(result.test_id);
            if (result.risk_scores !== undefined) setRiskScore(result.risk_scores);
          });
        }
      }
    }
    getUser();

    // Ensure chrome.storage exists before adding a listener
    if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
      const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        if (changes.risk_scores) {
          setRiskScore(changes.risk_scores.newValue);
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      // Cleanup: Remove listener when component unmounts
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    if (!testId.trim()) {
      setError('Test ID is required.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);

      // Store user_id and test_id in Chrome Storage
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        chrome.storage.local.set({
          user_id: data.user.id,
          test_id: testId
        });
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTestId('');
    setRiskScore(null);

    // Clear stored data
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.remove(["user_id", "test_id", "risk_scores"]);
    }
  };

  // Function to get color based on risk score
  const getRiskColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 80) return "text-red-500"; // High risk (Red)
    if (score >= 50) return "text-yellow-500"; // Medium risk (Yellow)
    return "text-green-500"; // Low risk (Green)
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-[350px]">
        <CardHeader className="flex flex-col items-center">
          {/* Logo & "NEST" in a row */}
          <div className="flex items-center space-x-3">
            <img src="logo.png" alt="NEST Logo" className="w-12 h-12" />
            <h1 className="text-2xl font-bold text-blue-600">NEST</h1>
          </div>
          <CardTitle className="mt-2">{user ? "Dashboard" : "Login"}</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="text-center">
              <p className="mb-2">Logged in as: {user.email}</p>
              <p className="mb-2">Test ID: {testId || "Not set"}</p>

              {/* Risk Score Display */}
              {riskScore !== null ? (
                <p className={`font-bold text-xl ${getRiskColor(riskScore)}`}>
                  Risk Score: {riskScore}
                </p>
              ) : (
                <p className="text-gray-500">Fetching Risk Score...</p>
              )}

              <Button variant="destructive" onClick={handleLogout} className="mt-4">
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Enter Test ID"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleLogin} disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
