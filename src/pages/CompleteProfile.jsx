import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebase, getUserProfile, saveUserProfile } from "@/api/firebase";
import { createPageUrl } from "@/utils";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [form, setForm] = useState({ fullName: "", age: "", city: "", madrasah: "" });

  useEffect(() => {
    const init = async () => {
      setError("");
      setInfo("");
      try {
        const { auth, db } = getFirebase();
        const user = auth?.currentUser;
        if (!user) {
          navigate(createPageUrl("Login"));
          return;
        }
        if (!db) {
          setInfo("Profile cannot be saved right now (Firebase not configured). You can still use the app.");
          setLoading(false);
          return;
        }
        const existing = await getUserProfile(user.uid);
        setForm({
          fullName: (existing?.fullName || existing?.name || ""),
          age: (existing?.age || ""),
          city: (existing?.city || ""),
          madrasah: (existing?.madrasah || ""),
        });
      } catch (e) {
        setError(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isMissing = () => !form.fullName?.trim() || !form.age?.trim() || !form.city?.trim() || !form.madrasah?.trim();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const { auth, db } = getFirebase();
      const user = auth?.currentUser;
      if (!user) {
        navigate(createPageUrl("Login"));
        return;
      }
      if (!db) {
        setInfo("Profile cannot be saved (Firebase not configured). You can continue.");
        navigate(createPageUrl("Games"));
        return;
      }
      await saveUserProfile(user.uid, {
        fullName: form.fullName.trim(),
        age: form.age.trim(),
        city: form.city.trim(),
        madrasah: form.madrasah.trim(),
        email: String(user.email || ""),
      });
      navigate(createPageUrl("Games"));
    } catch (e) {
      const code = e?.code || "";
      let msg = e?.message || "Failed to save profile";
      if (code === "permission-denied") msg = "Missing permissions to save profile. You can continue and try later.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <form onSubmit={save} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-sm text-gray-600 mb-4">Please fill the missing details to personalize your experience.</p>
        {error && <div className="mb-3 text-red-700 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</div>}
        {info && <div className="mb-3 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 text-sm">{info}</div>}

        <div className="mb-3">
          <label className="block mb-1 font-medium">Full Name</label>
          <input className="w-full p-2 border rounded" value={form.fullName} onChange={updateField("fullName")} />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Age</label>
          <input className="w-full p-2 border rounded" value={form.age} onChange={updateField("age")} />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">City</label>
          <input className="w-full p-2 border rounded" value={form.city} onChange={updateField("city")} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Madrasah</label>
          <input className="w-full p-2 border rounded" value={form.madrasah} onChange={updateField("madrasah")} />
        </div>

        <div className="flex items-center justify-between">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={saving || isMissing()}>
            {saving ? "Saving…" : "Save and Continue"}
          </button>
          <button type="button" className="px-4 py-2 rounded border" onClick={() => navigate(createPageUrl("Games"))}>
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}

