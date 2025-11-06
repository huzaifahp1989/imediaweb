import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp, saveUserProfile } from "@/api/firebase";

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
      const user = await signUp(email.trim(), password.trim());
      await saveUserProfile(user.uid, {
        fullName: fullName.trim(),
        age: age.trim(),
        city: city.trim(),
        madrasah: madrasah.trim(),
        email: email.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate("/Login"), 1500);
    } catch (err) {
      const code = err?.code || "";
      let msg = err?.message || "Signup failed";
      if (code === "auth/email-already-in-use") msg = "Email already in use. Try logging in.";
      if (code === "auth/invalid-email") msg = "Invalid email address.";
      if (code === "auth/operation-not-allowed") msg = "Email/password sign-up is disabled. Enable it in Firebase.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
      <p className="text-sm text-gray-600 mb-6">
        Create your account and we’ll register you in our backend. You can log in immediately after signing up.
      </p>

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
        {success && <div className="text-green-600 text-sm">Account created! Redirecting to login…</div>}

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
