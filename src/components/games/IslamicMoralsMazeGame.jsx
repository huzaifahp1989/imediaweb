
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Heart, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";

const mazeScenarios = [
  {
    id: 1,
    situation: "You found money on the ground at school. What do you do?",
    options: [
      {
        text: "Keep it for yourself",
        isGood: false,
        feedback: "Remember, the Prophet ﷺ taught us to be honest and return what we find."
      },
      {
        text: "Give it to the teacher to find the owner",
        isGood: true,
        feedback: "Excellent! The Prophet ﷺ said: 'The one who guides to goodness has a reward like the one who does it.'",
        hadith: "Return what is entrusted to you"
      }
    ],
    emoji: "💰",
    points: 2
  },
  {
    id: 2,
    situation: "Your friend is being bullied at school. What do you do?",
    options: [
      {
        text: "Ignore it and walk away",
        isGood: false,
        feedback: "We should help those in need. The Prophet ﷺ said to help your brother whether he is the oppressor or the oppressed."
      },
      {
        text: "Stand up for your friend and tell an adult",
        isGood: true,
        feedback: "Masha'Allah! The Prophet ﷺ said: 'Help your brother whether he is the oppressor or the oppressed.'",
        hadith: "Stand up against injustice"
      }
    ],
    emoji: "🤝",
    points: 2
  },
  {
    id: 3,
    situation: "You accidentally broke your sibling's toy. What do you do?",
    options: [
      {
        text: "Hide it and don't say anything",
        isGood: false,
        feedback: "Hiding the truth is not good. The Prophet ﷺ was known as Al-Amin (The Trustworthy)."
      },
      {
        text: "Tell the truth and apologize",
        isGood: true,
        feedback: "Perfect! The Prophet ﷺ said: 'Truthfulness leads to righteousness.'",
        hadith: "Always speak the truth"
      }
    ],
    emoji: "🎯",
    points: 2
  },
  {
    id: 4,
    situation: "Your mom asks you to clean your room, but you want to play. What do you do?",
    options: [
      {
        text: "Say no and keep playing",
        isGood: false,
        feedback: "We should always obey our parents. Allah says in the Quran: 'Be kind to your parents.'"
      },
      {
        text: "Clean your room first, then play",
        isGood: true,
        feedback: "Wonderful! The Prophet ﷺ said: 'Paradise lies under the feet of mothers.'",
        hadith: "Obey and respect your parents"
      }
    ],
    emoji: "🏠",
    points: 2
  },
  {
    id: 5,
    situation: "You see someone drop their books. What do you do?",
    options: [
      {
        text: "Keep walking",
        isGood: false,
        feedback: "We should help others in need. The Prophet ﷺ was always the first to help."
      },
      {
        text: "Help them pick up the books",
        isGood: true,
        feedback: "Excellent! The Prophet ﷺ said: 'The best of people are those who are most beneficial to people.'",
        hadith: "Help those in need"
      }
    ],
    emoji: "📚",
    points: 2
  }
];

export default function IslamicMoralsMazeGame({ onComplete }) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
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

  const handleOptionSelect = (option, index) => {
    setSelectedOption(index);
    setShowFeedback(true);
    
    // Get the points for the current scenario
    const scenarioPoints = mazeScenarios[currentScenario].points;

    if (option.isGood) {
      setScore(score + scenarioPoints); // Use scenarioPoints here
    }

    setTimeout(() => {
      if (currentScenario < mazeScenarios.length - 1) {
        setCurrentScenario(currentScenario + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        completeGame();
      }
    }, 3000);
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user) {
      try {
        await awardPointsForGame(user, "morals_maze", { fallbackScore: score });
      } catch (error) {
        console.error("Error saving game score:", error);
      }
    }
    
    onComplete(score);
  };

  if (gameCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-pink-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-pink-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Path Complete! ❤️
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You earned <span className="font-bold text-pink-600">{score} points!</span>
            </p>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                You've learned important Islamic morals and values. Keep making good choices!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const scenario = mazeScenarios[currentScenario];
  const selectedOptionData = selectedOption !== null ? scenario.options[selectedOption] : null;

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">{scenario.emoji}</span>
            Path of Good Deeds
          </CardTitle>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-amber-300" />
            <span className="font-bold">{score} pts</span>
          </div>
        </div>
        <p className="text-sm mt-2">Scenario {currentScenario + 1} of {mazeScenarios.length}</p>
      </CardHeader>

      <CardContent className="p-8">
        <AnimatePresence mode="wait">
          {!showFeedback ? (
            <motion.div
              key={currentScenario}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  What would you do?
                </h3>
                <p className="text-lg text-gray-700">
                  {scenario.situation}
                </p>
              </div>

              <div className="space-y-4">
                {scenario.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleOptionSelect(option, index)}
                    className="w-full h-auto py-4 text-lg justify-start bg-white hover:bg-pink-50 text-gray-900 border-2 border-gray-200 hover:border-pink-300"
                    variant="outline"
                  >
                    <ArrowRight className="w-5 h-5 mr-3 text-pink-500" />
                    <span className="text-left flex-1">{option.text}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className={`text-6xl mb-6 ${selectedOptionData.isGood ? "animate-bounce" : ""}`}>
                {selectedOptionData.isGood ? "✅" : "💭"}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                selectedOptionData.isGood ? "text-green-600" : "text-amber-600"
              }`}>
                {selectedOptionData.isGood ? "Excellent Choice!" : "Think Again..."}
              </h3>
              <div className="bg-blue-50 rounded-xl p-6 mb-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {selectedOptionData.feedback}
                </p>
              </div>
              {selectedOptionData.hadith && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm font-semibold text-green-800">
                    📖 Islamic Teaching: {selectedOptionData.hadith}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

