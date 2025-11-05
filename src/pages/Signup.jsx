import React, { useState } from "react";

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
  const [madrasah, setMadrasah] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sheetsStatus, setSheetsStatus] = useState("idle"); // idle | success | error | skipped
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | opened | error

  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || "";

  function validate() {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!age.trim()) errs.age = "Age is required";
    else if (!/^\d+$/.test(age.trim())) errs.age = "Age must be a number";
    if (!city.trim()) errs.city = "City is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email format";
    if (!madrasah.trim()) errs.madrasah = "Madrasah name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      fullName: fullName.trim(),
      age: age.trim(),
      city: city.trim(),
      email: email.trim(),
      madrasah: madrasah.trim(),
      submittedAt: new Date().toISOString(),
    };

    // 1) Try to send to Google Sheets via Apps Script Web App (if configured)
    if (GOOGLE_SCRIPT_URL) {
      try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSheetsStatus("success");
        } else {
          setSheetsStatus("error");
        }
      } catch (err) {
        console.error("Google Sheets submission failed:", err);
        setSheetsStatus("error");
      }
    } else {
      setSheetsStatus("skipped");
    }

    // 2) Prefill an email to imedia786@gmail.com
    const subject = encodeURIComponent(`New Sign Up: ${payload.fullName}`);
    const body = encodeURIComponent(
      `Full Name: ${payload.fullName}\nAge: ${payload.age}\nCity: ${payload.city}\nMadrasah: ${payload.madrasah}\nEmail: ${payload.email}\nSubmitted At: ${new Date().toLocaleString()}`
    );
    const mailtoHref = `mailto:imedia786@gmail.com?subject=${subject}&body=${body}`;

    try {
      // Attempt to open the user's default mail client
      // Some browsers may block automatic mailto. We'll also render a fallback clickable link below.
      window.location.href = mailtoHref;
      setEmailStatus("opened");
    } catch (err) {
      console.error("Failed to open mail client:", err);
      setEmailStatus("error");
    }

    setSubmitting(false);
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Sign Up</h1>
      <p className="text-sm text-gray-600 mb-6">
        Please fill in your details. On submit, we will prefill an email to <span className="font-semibold">imedia786@gmail.com</span> and, if configured, also record your submission to Google Sheets.
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

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        <div className="text-sm">
          <span className="font-semibold">Google Sheets status:</span>{" "}
          {sheetsStatus === "idle" && <span>Idle</span>}
          {sheetsStatus === "success" && <span className="text-green-700">Submitted</span>}
          {sheetsStatus === "error" && (
            <span className="text-red-700">Failed. Please ensure your Apps Script Web App is deployed with CORS enabled and set VITE_GOOGLE_APPS_SCRIPT_URL in your .env</span>
          )}
          {sheetsStatus === "skipped" && (
            <span className="text-gray-700">Skipped (no Google Apps Script URL configured)</span>
          )}
        </div>
        <div className="text-sm">
          <span className="font-semibold">Email status:</span>{" "}
          {emailStatus === "idle" && <span>Idle</span>}
          {emailStatus === "opened" && <span className="text-green-700">Mail client opened</span>}
          {emailStatus === "error" && (
            <span className="text-red-700">Could not auto-open mail client. Use the link below to send manually.</span>
          )}
        </div>
        {/* Fallback manual email link */}
        <div className="text-sm">
          <span className="font-semibold">Manual email:</span>{" "}
          <a
            className="text-blue-700 underline"
            href={`mailto:imedia786@gmail.com?subject=${encodeURIComponent(`New Sign Up: ${fullName || "(Name)"}`)}&body=${encodeURIComponent(`Full Name: ${fullName}\nAge: ${age}\nCity: ${city}\nMadrasah: ${madrasah}\nEmail: ${email}`)}`}
          >
            Click here to email us your signup
          </a>
        </div>
      </div>

      {!GOOGLE_SCRIPT_URL && (
        <div className="mt-8 text-xs text-gray-600">
          <p className="font-semibold mb-1">Configure Google Sheets (optional):</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a new Google Sheet and Apps Script project (Extensions → Apps Script).</li>
            <li>Add a doPost(e) handler to write JSON payload to the sheet and return a 200 response with appropriate CORS headers.</li>
            <li>Deploy the Apps Script as a Web App and copy the URL.</li>
            <li>Set VITE_GOOGLE_APPS_SCRIPT_URL in your .env to that URL, then restart the dev server.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
