import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, saveUserProfile, resetPassword, getFirebase, sendVerification } from "@/api/firebase";

// Simple, dependency-free signup form that:
// 1) Prefills an email to imedia786@gmail.com with all submitted details
// 2) Optionally posts the submission to a Google Sheet via an Apps Script Web App endpoint
//    - Configure: VITE_GOOGLE_APPS_SCRIPT_URL in your .env (e.g., https://script.google.com/macros/s/AKfycb.../exec)
//    - Payload: { fullName, age, city, madrasah, email, submittedAt }

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [madrasah, setMadrasah] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [profileSaved, setProfileSaved] = useState(null); // null | true | false
  const [infoMsg, setInfoMsg] = useState("");
  const [offerReset, setOfferReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  function validate() {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!age.trim()) errs.age = "Age is required";
    else if (!/^\d+$/.test(age.trim())) errs.age = "Age must be a number";
    if (!city.trim()) errs.city = "City is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email format";
    if (!madrasah.trim()) errs.madrasah = "Madrasah name is required";
    if (!password.trim() || password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await signUp(normalizedEmail, password.trim());
      // Try sending a verification email to the new user (optional)
      try { await sendVerification(); setVerificationSent(true); } catch {}

      // Account creation succeeded — show success and navigate regardless of profile save
      setSuccess(true);
      setTimeout(() => navigate("/Login"), 1500);

      // Try to persist profile, but do not block success if it fails
      try {
        await saveUserProfile(user.uid, {
          fullName: fullName.trim(),
          age: age.trim(),
          city: city.trim(),
          madrasah: madrasah.trim(),
          email: normalizedEmail,
        });
        setProfileSaved(true);
        // Also call backend to ensure record exists and notify admin by email
        try {
          const { auth } = getFirebase();
          const token = await auth?.currentUser?.getIdToken?.();
          if (token) {
            const endpoint = import.meta.env?.DEV ? "/.netlify/functions/signupNotify" : "/api/signupNotify";
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ email: normalizedEmail, fullName: fullName.trim() }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.notified) setInfoMsg("Admin has been notified of your signup.");
            }
          }
        } catch (_) {}
      } catch (persistErr) {
        // Non-blocking: surface a friendly note if Firestore permissions are missing
        const pCode = persistErr?.code || "";
        let pMsg = persistErr?.message || "Profile save failed.";
        if (pCode === "permission-denied") pMsg = "Profile save requires Firebase access. You can still log in.";
        setProfileSaved(false);
        setInfoMsg(pMsg);
        // Fallback: attempt backend creation and admin notification even if client save failed
        try {
          const { auth } = getFirebase();
          const token = await auth?.currentUser?.getIdToken?.();
          if (token) {
            const endpoint = import.meta.env?.DEV ? "/.netlify/functions/signupNotify" : "/api/signupNotify";
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ email: normalizedEmail, fullName: fullName.trim() }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.ok) setInfoMsg((prev) => prev || "Your account is registered on the backend.");
            }
          }
        } catch (_) {}
      }
    } catch (err) {
      const code = err?.code || "";
      let msg = err?.message || "Signup failed";
      if (code === "auth/email-already-in-use") {
        msg = "Email already in use. Try logging in or reset your password.";
        setOfferReset(true);
        setResetEmail(email.trim().toLowerCase());
      }
      if (code === "auth/invalid-email") msg = "Invalid email address.";
      if (code === "auth/weak-password") msg = "Password is too weak. Use at least 6 characters.";
      if (code === "auth/operation-not-allowed") msg = "Email/password sign-up is disabled. Enable it in Firebase.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
      <p className="text-sm text-gray-600 mb-2">
        Create your account and we’ll register you in our backend. You can log in immediately after signing up.
      </p>
      {import.meta.env?.DEV && import.meta.env?.VITE_FIREBASE_PROJECT_ID && (
        <p className="text-xs text-gray-500 mb-6">Using Firebase project: {String(import.meta.env.VITE_FIREBASE_PROJECT_ID)}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white/50 rounded-lg p-6 shadow">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Aisha Khan"
          />
          {errors.fullName && <div className="text-red-600 text-xs mt-1">{errors.fullName}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="age">Age</label>
          <input
            id="age"
            type="text"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g., 10"
          />
          {errors.age && <div className="text-red-600 text-xs mt-1">{errors.age}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="madrasah">Madrasah Name</label>
          <input
            id="madrasah"
            type="text"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            value={madrasah}
            onChange={(e) => setMadrasah(e.target.value)}
            placeholder="e.g., Darul Uloom Karachi"
          />
          {errors.madrasah && <div className="text-red-600 text-xs mt-1">{errors.madrasah}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Karachi"
          />
          {errors.city && <div className="text-red-600 text-xs mt-1">{errors.city}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., aisha@example.com"
          />
          {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          {errors.password && <div className="text-red-600 text-xs mt-1">{errors.password}</div>}
        </div>

        {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}
        {offerReset && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <button
              type="button"
              className="text-blue-700 underline"
              onClick={async () => {
                setInfoMsg("");
                try {
                  await resetPassword(resetEmail);
                  setInfoMsg("Password reset email sent. Check your inbox.");
                  setOfferReset(false);
                } catch (e) {
                  const code = e?.code || "";
                  let msg = e?.message || "Failed to send reset email.";
                  if (code === "auth/invalid-email") msg = "Please enter a valid email address.";
                  if (code === "auth/user-not-found") msg = "No account found for this email.";
                  setInfoMsg(msg);
                }
              }}
            >
              Send reset email
            </button>
          </div>
        )}
        {success && <div className="text-green-600 text-sm">Account created! Redirecting to login…</div>}
        {verificationSent && (
          <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-sm">
            Verification email sent. Please check your inbox.
          </div>
        )}
        {profileSaved === false && (
          <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">
            {infoMsg || "We couldn’t save your profile right now, but your account is created. You can complete your profile after login."}
          </div>
        )}
        {infoMsg && profileSaved !== false && (
          <div className="text-blue-700 bg-blue-50 border border-blue-200 rounded p-2 text-sm">
            {infoMsg}
          </div>
        )}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Creating…" : "Create Account"}
        </button>
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <a href="/Login" className="text-blue-700 font-semibold">Login</a>
        </div>
      </form>

    </div>
  );
}
