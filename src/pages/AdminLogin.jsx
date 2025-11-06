import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { adminSignIn, adminSignOut, watchAuth, isAdminUser, getFirebase } from "@/api/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { createPageUrl } from "@/utils";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);
  const envFlags = {
    apiKey: Boolean(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: Boolean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    appId: Boolean(import.meta.env.VITE_FIREBASE_APP_ID),
  };

  // Debug: capture raw env values (masked in UI)
  const debugConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  };
  const mask = (s, start = 4, end = 4) => {
    if (!s) return "(empty)";
    if (s.length <= start + end) return s;
    return `${s.slice(0, start)}…${s.slice(-end)}`;
  };

  useEffect(() => {
    const { app } = getFirebase();
    setConfigured(Boolean(app));
    const unsub = watchAuth(async (user) => {
      if (user) {
        const ok = await isAdminUser();
        if (ok) navigate(createPageUrl("AdminDashboard"));
      }
    });
    return () => unsub && unsub();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!configured) throw new Error("Firebase not configured");
      const user = await adminSignIn(email, password);
      // Removed optional static 2FA code gate; sign-in proceeds with email/password only
      const ok = await isAdminUser();
      if (!ok) {
        await adminSignOut();
        throw new Error("Access restricted to admin only");
      }
      navigate(createPageUrl("AdminDashboard"));
    } catch (err) {
      // Map common Firebase auth errors to friendly messages
      const code = err?.code || "";
      let msg = err?.message || "Login failed";
      if (code === "auth/invalid-credential") msg = "Invalid email or password. Please try again or reset your password.";
      if (code === "auth/user-not-found") msg = "No account found for this email. Please sign up or ask an admin to create one.";
      if (code === "auth/wrong-password") msg = "Incorrect password. Try again or reset your password.";
      if (code === "auth/too-many-requests") msg = "Too many attempts. Please wait a minute, then try again.";
      if (code === "auth/operation-not-allowed") msg = "Email/password sign-in is disabled. Enable it in Firebase Auth → Sign-in method.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "";

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Secure Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!configured ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Firebase is not configured.</span>
                </div>
                <p className="text-sm text-gray-600">
                  Please set Firebase env vars in <code>.env</code>: <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_AUTH_DOMAIN</code>, <code>VITE_FIREBASE_PROJECT_ID</code>, <code>VITE_FIREBASE_APP_ID</code>. Optional: <code>VITE_ADMIN_EMAIL</code> (exact match), <code>VITE_ADMIN_EMAIL_DOMAIN</code> (e.g. <code>imediackids.com</code>).
                </p>
                <div className="text-xs text-gray-500 bg-gray-50 border rounded p-2">
                  <div className="font-semibold mb-1">Detected env flags (no secrets):</div>
                  <ul className="list-disc ml-4">
                    <li>VITE_FIREBASE_API_KEY: {envFlags.apiKey ? '✓' : '✗'}</li>
                    <li>VITE_FIREBASE_AUTH_DOMAIN: {envFlags.authDomain ? '✓' : '✗'}</li>
                    <li>VITE_FIREBASE_PROJECT_ID: {envFlags.projectId ? '✓' : '✗'}</li>
                    <li>VITE_FIREBASE_APP_ID: {envFlags.appId ? '✓' : '✗'}</li>
                  </ul>
                  <div className="mt-2">After editing <code>.env</code>, fully restart the dev server (<code>Ctrl+C</code> then <code>npm run dev</code>).</div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 border rounded p-2">
                  <div className="font-semibold mb-1">Debug config (masked)</div>
                  <ul className="list-disc ml-4">
                    <li>apiKey: {mask(debugConfig.apiKey)}</li>
                    <li>authDomain: {debugConfig.authDomain || '(empty)'}</li>
                    <li>projectId: {debugConfig.projectId || '(empty)'}</li>
                    <li>appId: {mask(debugConfig.appId, 3, 6)}</li>
                    <li>storageBucket: {debugConfig.storageBucket || '(empty)'}</li>
                    <li>messagingSenderId: {debugConfig.messagingSenderId || '(empty)'}</li>
                  </ul>
                  <div className="mt-2">If values show as <code>(empty)</code>, ensure your <code>.env</code> exists at the project root and variables start with <code>VITE_</code>.</div>
                </div>
                <div className="text-sm text-gray-600">
                  Admin login requires Firebase configuration. Once configured, use your email/password to sign in.
                </div>
              </div>
            ) : (
              <>
              <div className="text-xs text-gray-500 bg-gray-50 border rounded p-2 mb-4">
                <div className="font-semibold mb-1">Debug config (masked)</div>
                <ul className="list-disc ml-4">
                  <li>apiKey: {mask(debugConfig.apiKey)}</li>
                  <li>authDomain: {debugConfig.authDomain || '(empty)'}</li>
                  <li>projectId: {debugConfig.projectId || '(empty)'}</li>
                  <li>appId: {mask(debugConfig.appId, 3, 6)}</li>
                </ul>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>
                )}
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {/* 2FA removed */}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : (
                    <span className="inline-flex items-center gap-2"><Lock className="w-4 h-4" />Sign In</span>
                  )}
                </Button>
                <div className="flex items-center justify-between text-xs mt-2">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={async () => {
                      setError("");
                      try {
                        const { auth } = getFirebase();
                        if (!auth) throw new Error("Firebase not configured");
                        if (!email) throw new Error("Enter your email above, then click reset.");
                        await sendPasswordResetEmail(auth, email);
                        setError("Password reset email sent. Check your inbox.");
                      } catch (err) {
                        const code = err?.code || "";
                        let msg = err?.message || "Failed to send reset email.";
                        if (code === "auth/invalid-email") msg = "Please enter a valid email address.";
                        if (code === "auth/user-not-found") msg = "No account found for this email.";
                        setError(msg);
                      }
                    }}
                  >
                    Forgot password?
                  </button>
                  <span className="text-gray-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-600" /> Access available to any signed-in user</span>
                </div>
              </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
