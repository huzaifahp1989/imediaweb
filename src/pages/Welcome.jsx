import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Star, Sparkles, ArrowRight } from "lucide-react";

const avatars = ["🌟", "🌙", "⭐", "🎨", "🎮", "📚", "🚀", "🦁", "🐱", "🐼", "🦊", "🐰"];

export default function Welcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    city: "",
    madrasah_maktab: "",
    avatar: "🌟"
  });

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const checkOnboarding = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      
      if (!authenticated) {
        // Not authenticated - that's fine, they can skip
        setChecking(false);
        return;
      }
      
      const userData = await base44.auth.me();
      
      // If already completed onboarding, go to Games
      if (userData.onboarding_completed) {
        navigate(createPageUrl("Games"));
        return;
      }
      
      // Pre-fill name if available
      if (userData.full_name) {
        setFormData(prev => ({ ...prev, full_name: userData.full_name }));
      }
      
      setChecking(false);
    } catch (error) {
      console.error("Error checking onboarding:", error);
      setChecking(false);
    }
  };

  const handleSkip = () => {
    navigate(createPageUrl("Games"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      // If not authenticated, just navigate to Games
      navigate(createPageUrl("Games"));
      return;
    }

    setLoading(true);

    try {
      // Get current user data
      const userData = await base44.auth.me();
      
      // No bonus points - users start with 0 points
      const totalPoints = 0;

      // Update current user profile with onboarding data
      await base44.auth.updateMe({
        full_name: formData.full_name,
        age: parseInt(formData.age),
        city: formData.city,
        madrasah_maktab: formData.madrasah_maktab,
        avatar: formData.avatar,
        onboarding_completed: true,
        points: totalPoints,
        badges: []
      });

      // Send email notification about new signup
      try {
        await base44.integrations.Core.SendEmail({
          from_name: "Islam Kids Zone",
          to: "huzaify786@gmail.com",
          subject: "🌙 New User Registered - Islam Kids Zone",
          body: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
              <h2 style="color: #3B82F6;">✨ New User Registered!</h2>
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p><strong>👤 Name:</strong> ${formData.full_name}</p>
                <p><strong>🎂 Age:</strong> ${formData.age} years old</p>
                <p><strong>🏙️ City:</strong> ${formData.city || 'Not provided'}</p>
                <p><strong>🕌 Madrasah/Maktab:</strong> ${formData.madrasah_maktab || 'Not provided'}</p>
                <p><strong>🎨 Avatar:</strong> ${formData.avatar}</p>
                <p><strong>📧 Email:</strong> ${userData.email || 'Not provided'}</p>
                <p><strong>📅 Registration Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
      }

      // Redirect to Games page
      navigate(createPageUrl("Games"));
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌙</div>
          <p className="text-white text-lg font-medium">Loading...</p>
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
            <p className="text-gray-600 mt-2">Complete your profile to track progress (optional)</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <Label htmlFor="full_name" className="text-gray-700 font-semibold">
                  Your Name
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>

              {/* Age */}
              <div>
                <Label htmlFor="age" className="text-gray-700 font-semibold">
                  Your Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="3"
                  max="18"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="How old are you?"
                  className="mt-1"
                />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city" className="text-gray-700 font-semibold">
                  Your City
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Which city do you live in?"
                  className="mt-1"
                />
              </div>

              {/* Madrasah/Maktab */}
              <div>
                <Label htmlFor="madrasah_maktab" className="text-gray-700 font-semibold">
                  Your Madrasah/Maktab 🕌
                </Label>
                <Input
                  id="madrasah_maktab"
                  type="text"
                  value={formData.madrasah_maktab}
                  onChange={(e) => setFormData({ ...formData, madrasah_maktab: e.target.value })}
                  placeholder="Which madrasah or maktab do you attend?"
                  className="mt-1"
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <Label className="text-gray-700 font-semibold mb-3 block">
                  Choose Your Avatar
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar })}
                      className={`text-4xl p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                        formData.avatar === avatar
                          ? "bg-blue-500 ring-4 ring-blue-300 scale-110"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-6"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Save & Continue
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleSkip}
                  variant="outline"
                  className="w-full text-lg py-6"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Skip & Explore
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Sign up later to track your progress & earn badges!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}