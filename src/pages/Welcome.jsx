import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Star, Sparkles, ArrowRight } from "lucide-react";
// Authentication via Base44 removed in favor of email-only access

const avatars = ["🌟", "🌙", "⭐", "🎨", "🎮", "📚", "🚀", "🦁", "🐱", "🐼", "🦊", "🐰"];

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    city: "",
    madrasah_maktab: "",
    avatar: "🌟"
  });

  // Email-only access: no external auth/onboarding calls
  useEffect(() => {
    // Prefill from localStorage if a local user was saved previously
    try {
      const saved = localStorage.getItem("ikz_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          full_name: parsed.full_name || prev.full_name,
          age: parsed.age || prev.age,
          city: parsed.city || prev.city,
          madrasah_maktab: parsed.madrasah_maktab || prev.madrasah_maktab,
          avatar: parsed.avatar || prev.avatar
        }));
      }
    } catch {}
    setChecking(false);
  }, []);

  const [user, setUser] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSkip = () => {
    navigate(createPageUrl("Games"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setUser(formData);
      setSuccess(true);
      setLoading(false);
      // Optionally save to localStorage
      localStorage.setItem("ikz_user", JSON.stringify(formData));
      navigate(createPageUrl("Games"));
    }, 500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌙</div>
          <p className="text-white text-lg font-medium">Signup successful! Welcome to Islam Kids Zone.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-4 border-white/50">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🌙
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Islam Kids Zone!
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign up to personalize your experience!</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="madrasah_maktab">Madrasah/Maktab</Label>
                <Input
                  id="madrasah_maktab"
                  type="text"
                  value={formData.madrasah_maktab}
                  onChange={e => setFormData({ ...formData, madrasah_maktab: e.target.value })}
                />
              </div>
              <div>
                <Label>Choose an Avatar</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {avatars.map(av => (
                    <button
                      type="button"
                      key={av}
                      className={`text-2xl px-2 py-1 rounded-lg border ${formData.avatar === av ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-white"}`}
                      onClick={() => setFormData({ ...formData, avatar: av })}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                  {loading ? "Saving..." : "Save & Continue"}
                </Button>
                <Button type="button" variant="outline" onClick={handleSkip} className="w-full">
                  Skip & Explore
                </Button>
                {/* Removed email request shortcut; encourage self-signup via Signup page */}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
