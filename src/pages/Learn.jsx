import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, CheckCircle2, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

const dailyDuas = [
  {
    arabic: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ",
    english: "In the name of Allah, the Most Gracious, the Most Merciful",
    transliteration: "Bismillah ir-Rahman ir-Rahim"
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ",
    english: "All praise is due to Allah",
    transliteration: "Alhamdulillah"
  }
];

const arabicWords = [
  { arabic: "سَلَام", english: "Peace", transliteration: "Salaam" },
  { arabic: "شُكْراً", english: "Thank you", transliteration: "Shukran" },
  { arabic: "صَبْر", english: "Patience", transliteration: "Sabr" },
  { arabic: "رَحْمَة", english: "Mercy", transliteration: "Rahmah" }
];

const goodDeeds = [
  { id: "helped_parents", label: "Helped my parents", emoji: "❤️" },
  { id: "prayed_on_time", label: "Prayed on time", emoji: "🤲" },
  { id: "shared_toys", label: "Shared my toys", emoji: "🎁" },
  { id: "read_quran", label: "Read Quran", emoji: "📖" },
  { id: "said_bismillah", label: "Said Bismillah before eating", emoji: "🍽️" },
  { id: "helped_friend", label: "Helped a friend", emoji: "🤝" },
  { id: "cleaned_room", label: "Cleaned my room", emoji: "🧹" },
  { id: "kind_words", label: "Used kind words", emoji: "💬" }
];

export default function Learn() {
  const [selectedDeeds, setSelectedDeeds] = useState([]);
  const [user, setUser] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

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
  const handleDeedToggle = async (deedId) => {
    const isSelected = selectedDeeds.includes(deedId);
    
    if (!isSelected && user) {
      try {
        await base44.entities.GoodDeed.create({
          user_id: user.id,
          deed_type: deedId,
          date: new Date().toISOString().split('T')[0]
        });
        
        await base44.auth.updateMe({
          points: (user.points || 0) + 5
        });
        
        setSelectedDeeds([...selectedDeeds, deedId]);
      } catch (error) {
        console.error("Error saving good deed:", error);
      }
    } else {
      setSelectedDeeds(selectedDeeds.filter(id => id !== deedId));
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Learn & Grow
          </h1>
          <p className="text-lg text-gray-600">
            Daily lessons, duas, and activities to help you grow as a Muslim
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Dua of the Day */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="shadow-lg border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  Dua of the Day
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dailyDuas.map((dua, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="text-center mb-4">
                      <p className="text-3xl text-right mb-3" style={{ fontFamily: 'serif' }}>
                        {dua.arabic}
                      </p>
                      <Button variant="outline" size="sm" className="mb-2">
                        <Volume2 className="w-4 h-4 mr-2" />
                        Listen
                      </Button>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="font-medium text-gray-700 mb-1">{dua.transliteration}</p>
                      <p className="text-gray-600">{dua.english}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Arabic Flashcards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="shadow-lg border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Learn Arabic Words
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 text-center mb-4">
                  <p className="text-5xl mb-4" style={{ fontFamily: 'serif' }}>
                    {arabicWords[currentWordIndex].arabic}
                  </p>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    {arabicWords[currentWordIndex].transliteration}
                  </p>
                  <p className="text-lg text-gray-600">
                    {arabicWords[currentWordIndex].english}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentWordIndex((currentWordIndex - 1 + arabicWords.length) % arabicWords.length)}
                    variant="outline"
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentWordIndex((currentWordIndex + 1) % arabicWords.length)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Good Deeds Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg border-2 border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    Good Deeds Tracker
                  </CardTitle>
                  <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                    +5 points each
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6 text-center">
                  Check off the good deeds you did today and earn points! ⭐
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {goodDeeds.map((deed) => (
                    <motion.div
                      key={deed.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedDeeds.includes(deed.id)
                            ? "bg-green-50 border-green-400"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Checkbox
                          checked={selectedDeeds.includes(deed.id)}
                          onCheckedChange={() => handleDeedToggle(deed.id)}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-2xl mb-1">{deed.emoji}</div>
                          <p className="text-sm font-medium text-gray-900">{deed.label}</p>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}