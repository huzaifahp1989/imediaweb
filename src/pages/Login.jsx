import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, getFirebase, getUserProfile } from "@/api/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signIn(email, password);
      try {
        const { db } = getFirebase();
        if (db && user?.uid) {
          const profile = await getUserProfile(user.uid);
          const missing = !profile?.fullName || !profile?.age || !profile?.city || !profile?.madrasah;
          if (missing) {
            navigate("/CompleteProfile");
          } else {
            navigate("/Games");
          }
        } else {
          navigate("/Games");
        }
      } catch (_) {
        navigate("/Games");
      }
    } catch (err) {
      const code = err?.code || "";
      let msg = err?.message || "Login failed";
      if (code === "auth/invalid-credential") msg = "Invalid email or password.";
      if (code === "auth/user-not-found") msg = "No account found for this email. Please sign up.";
      if (code === "auth/wrong-password") msg = "Incorrect password.";
      if (code === "auth/too-many-requests") msg = "Too many attempts. Please wait and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div className="mb-2">
          <label className="block mb-2 font-semibold">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
        </div>
        <div className="text-right text-sm mb-6">
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
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded hover:scale-105 transition-transform" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <a href="/Signup" className="text-blue-600 font-semibold">Sign up</a>
        </div>
      </form>
    </div>
  );
}
