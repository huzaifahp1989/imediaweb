import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, CheckCircle2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const sunnahMissions = [
  {
    id: 1,
    title: "Say Bismillah",
    description: "Say 'Bismillah' before you start anything",
    emoji: "🤲",
    points: 10,
    category: "Daily Dhikr"
  },
  {
    id: 2,
    title: "Greet with Salaam",
    description: "Say 'Assalamu Alaikum' when you meet someone",
    emoji: "👋",
    points: 10,
    category: "Manners"
  },
  {
    id: 3,
    title: "Help Someone",
    description: "Help your parents or a family member today",
    emoji: "❤️",
    points: 15,
    category: "Good Deeds"
  },
  {
    id: 4,
    title: "Pray on Time",
    description: "Complete one prayer on time today",
    emoji: "🕌",
    points: 20,
    category: "Worship"
  },
  {
    id: 5,
    title: "Read Quran",
    description: "Read at least one page of the Quran",
    emoji: "📖",
    points: 20,
    category: "Quran"
  },
  {
    id: 6,
    title: "Say Alhamdulillah",
    description: "Thank Allah by saying 'Alhamdulillah' 10 times",
    emoji: "🌟",
    points: 10,
    category: "Daily Dhikr"
  },
  {
    id: 7,
    title: "Smile at Someone",
    description: "Give someone a kind smile today",
    emoji: "😊",
    points: 10,
    category: "Kindness"
  },
  {
    id: 8,
    title: "Make Dua",
    description: "Make dua for yourself and your family",
    emoji: "🤲",
    points: 15,
    category: "Worship"
  }
];

export default function DailySunnahGame({ onComplete }) {
  const [completedMissions, setCompletedMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    loadUser();
  }, []);

  const handleCompleteMission = async (mission) => {
    if (completedMissions.includes(mission.id)) return;

    const newCompleted = [...completedMissions, mission.id];
    setCompletedMissions(newCompleted);
    setTotalPoints(totalPoints + mission.points);

    // Show celebration for this mission
    setShowCelebration(mission.id);
    setTimeout(() => setShowCelebration(null), 2000);

    // If all missions completed
    if (newCompleted.length === sunnahMissions.length) {
      const finalScore = totalPoints + mission.points;
      
      if (user) {
        try {
          await base44.entities.GameScore.create({
            user_id: user.id,
            game_type: "daily_sunnah",
            score: finalScore,
            completed: true
          });
          
          await base44.auth.updateMe({
            points: (user.points || 0) + finalScore
          });
        } catch (error) {
          console.error("Error saving score:", error);
        }
      }

      setTimeout(() => onComplete(finalScore), 2000);
    }
  };

  const categoryColors = {
    "Daily Dhikr": "bg-blue-100 text-blue-800",
    "Manners": "bg-green-100 text-green-800",
    "Good Deeds": "bg-pink-100 text-pink-800",
    "Worship": "bg-purple-100 text-purple-800",
    "Quran": "bg-amber-100 text-amber-800",
    "Kindness": "bg-rose-100 text-rose-800"
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">🕌</span>
            Daily Sunnah Mission
          </CardTitle>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-amber-300" />
            <span className="font-bold">{totalPoints} pts</span>
          </div>
        </div>
        <p className="text-sm mt-2">
          Complete {completedMissions.length}/{sunnahMissions.length} missions today
        </p>
      </CardHeader>

      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-4">
          {sunnahMissions.map((mission, index) => {
            const isCompleted = completedMissions.includes(mission.id);
            const isCelebrating = showCelebration === mission.id;

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`transition-all duration-300 ${
                  isCompleted ? "border-2 border-green-500 bg-green-50" : "hover:shadow-lg"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl ${isCelebrating ? "animate-bounce" : ""}`}>
                        {mission.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {mission.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {mission.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={categoryColors[mission.category]}>
                            {mission.category}
                          </Badge>
                          {isCompleted ? (
                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                              <CheckCircle2 className="w-5 h-5" />
                              <span>+{mission.points}</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleCompleteMission(mission)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {completedMissions.length === sunnahMissions.length && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-8 text-center"
          >
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-8">
              <Trophy className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Masha'Allah! 🎉</h2>
              <p className="text-xl">You completed all missions today!</p>
              <p className="text-2xl font-bold mt-4">Total: {totalPoints} points earned!</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}