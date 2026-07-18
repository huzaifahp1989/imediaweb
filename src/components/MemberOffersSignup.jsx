import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { signUp, saveUserProfile, sendVerification } from "@/api/firebase";
import { supabase } from "@/api/supabaseClient";

async function notifySignup({ email, fullName, wantsOffers }) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;
    const endpoint = import.meta.env?.DEV
      ? "/.netlify/functions/signupNotify"
      : "/api/signupNotify";
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, fullName, wantsOffers }),
    });
  } catch {
    // Non-blocking — account creation already succeeded
  }
}

export default function MemberOffersSignup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function validate() {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Invalid email format";
    if (!password.trim() || password.length < 6)
      errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    if (!validate()) return;
    setSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();
    const name = fullName.trim();

    try {
      const user = await signUp(normalizedEmail, password.trim());
      try {
        await sendVerification();
      } catch {
        // optional
      }

      const profileBase = {
        full_name: name,
        email: normalizedEmail,
        role: "user",
      };

      try {
        await saveUserProfile(user.uid, {
          ...profileBase,
          wants_offers: true,
        });
      } catch {
        // Column may not exist yet — still save the core profile
        try {
          await saveUserProfile(user.uid, profileBase);
        } catch {
          // Non-blocking
        }
      }

      await notifySignup({
        email: normalizedEmail,
        fullName: name,
        wantsOffers: true,
      });

      setSuccess(true);
      setFullName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      const code = err?.code || err?.message || "";
      let msg = err?.message || "Signup failed. Please try again.";
      if (
        code === "auth/email-already-in-use" ||
        String(msg).toLowerCase().includes("already")
      ) {
        msg = "This email is already registered. Log in to access member offers.";
      } else if (
        code === "auth/weak-password" ||
        String(msg).toLowerCase().includes("password")
      ) {
        msg = "Password is too weak. Use at least 6 characters.";
      } else if (
        code === "auth/invalid-email" ||
        String(msg).toLowerCase().includes("invalid email")
      ) {
        msg = "Please enter a valid email address.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white mb-4 shadow-lg">
            <Gift className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Member Exclusive Offers
          </h2>
          <p className="text-lg text-gray-600">
            Sign up to unlock special member-only offers, early access to new
            activities, and learning perks for your family.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-teal-100"
        >
          {success ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-emerald-700 font-semibold text-lg">
                You&apos;re in! Your member account is ready.
              </p>
              <p className="text-gray-600 text-sm">
                Log in to start learning and receive exclusive offers.
              </p>
              <Link to={createPageUrl("Login")}>
                <Button className="mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full px-8">
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-left">
                <Label htmlFor="offers-fullName">Full Name</Label>
                <Input
                  id="offers-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Aisha Khan"
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-red-600 text-xs">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="offers-email">Email</Label>
                <Input
                  id="offers-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., aisha@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="offers-password">Password</Label>
                <Input
                  id="offers-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-red-600 text-xs">{errors.password}</p>
                )}
              </div>

              {errorMsg && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">
                  {errorMsg}{" "}
                  {errorMsg.includes("already registered") && (
                    <Link
                      to={createPageUrl("Login")}
                      className="underline font-medium text-teal-700"
                    >
                      Log in
                    </Link>
                  )}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full shadow-lg"
              >
                <UserPlus className="mr-2 w-5 h-5" />
                {submitting ? "Creating account…" : "Sign Up for Exclusive Offers"}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already a member?{" "}
                <Link
                  to={createPageUrl("Login")}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </>
          )}
        </motion.form>
      </div>
    </section>
  );
}
