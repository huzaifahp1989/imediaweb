
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Heart, CheckCircle2, XCircle } from "lucide-react";
// Removed import of base44 for local-only app

const akhlaqScenarios = [
  {
    title: "Helping Parents",
    emoji: "❤️",
    scenario: "Your mother is cooking dinner and looks tired. What should you do?",
    options: [
      { text: "Offer to help her", isGood: true },
      { text: "Go play video games", isGood: false },
      { text: "Ask if she needs anything", isGood: true },
      { text: "Ignore and watch TV", isGood: false }
    ],
    lesson: "Helping parents is one of the best deeds in Islam. The Prophet ﷺ said paradise lies under the feet of mothers.",
    points: 2
  },
  {
    title: "Telling the Truth",
    emoji: "🗣️",
    scenario: "You broke your sister's toy by accident. She's asking who broke it. What do you do?",
    options: [
      { text: "Tell the truth and apologize", isGood: true },
      { text: "Blame someone else", isGood: false },
      { text: "Hide and don't say anything", isGood: false },
      { text: "Say sorry and offer to fix it", isGood: true }
    ],
    lesson: "Prophet Muhammad ﷺ was called Al-Amin (The Trustworthy) because he always told the truth.",
    points: 2
  },
  {
    title: "Being Kind to Animals",
    emoji: "🐱",
    scenario: "You see a stray cat looking hungry. What should you do?",
    options: [
      { text: "Give it some food", isGood: true },
      { text: "Throw stones at it", isGood: false },
      { text: "Chase it away", isGood: false },
      { text: "Pet it gently and give water", isGood: true }
    ],
    lesson: "The Prophet ﷺ taught us to be kind to all animals. A woman entered Paradise for giving water to a thirsty dog!",
    points: 2
  },
  {
    title: "Respecting Elders",
    emoji: "👴",
    scenario: "An elderly person needs a seat on the bus, but you're sitting. What do you do?",
    options: [
      { text: "Offer them your seat", isGood: true },
      { text: "Pretend you didn't see them", isGood: false },
      { text: "Keep sitting", isGood: false },
      { text: "Stand up and help them sit", isGood: true }
    ],
    lesson: "Islam teaches us to respect our elders. The Prophet ﷺ said: 'He is not one of us who does not show mercy to our young ones and respect our old ones.'",
    points: 2
  },
  {
    title: "Sharing with Others",
    emoji: "🎁",
    scenario: "You have candy and your friend doesn't have any. What do you do?",
    options: [
      { text: "Share some with your friend", isGood: true },
      { text: "Eat it all yourself", isGood: false },
      { text: "Hide it so they don't see", isGood: false },
      { text: "Offer them half", isGood: true }
    ],
    lesson: "The Prophet ﷺ loved to share with others. Sharing makes both you and your friend happy!",
    points: 2
  }
];

export default function AkhlaqChallengeGame({ onComplete }) {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showLesson, setShowLesson] = useState(false);
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

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    const scenario = akhlaqScenarios[currentScenario];
    const selected = scenario.options[optionIndex];
    
    if (selected.isGood) {
      setScore(score + scenario.points);
    }

    setTimeout(() => {
      setShowLesson(true);
    }, 1000);
  };

  const handleContinue = () => {
    if (currentScenario < akhlaqScenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedOption(null);
      setShowLesson(false);
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user) {
      try {
        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "akhlaq",
          score: score,
          completed: true
        });
        
        await base44.auth.updateMe({
          points: (user.points || 0) + score
        });
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Heart className="w-24 h-24 mx-auto mb-6 text-pink-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              You're an Akhlaq Hero! 🌸
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You earned <span className="font-bold text-pink-600">{score} points!</span>
            </p>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                You've learned about good Islamic manners! Keep practicing these good deeds every day.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const scenario = akhlaqScenarios[currentScenario];

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">{scenario.emoji}</span>
            Akhlaq Challenge
          </CardTitle>
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-white">{score} pts</span>
          </div>
        </div>
        <p className="text-sm mt-2 text-white">Scenario {currentScenario + 1} of {akhlaqScenarios.length}</p>
        {/* Monthly Prize Competition Banner */}
        <div className="bg-white text-gray-900 font-bold text-center py-3 px-4 mt-4 rounded-lg shadow-lg flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span>Monthly Prize Competition! Top 3 win!</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        {!showLesson ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScenario}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 px-2">{scenario.title}</h3>
              <div className="bg-blue-50 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">{scenario.scenario}</p>
              </div>
              
              <div className="grid gap-2 md:gap-3">
                {scenario.options.map((option, index) => {
                  const isSelected = index === selectedOption;
                  const isGood = option.isGood;
                  const showResult = isSelected;
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => selectedOption === null && handleOptionSelect(index)}
                      disabled={selectedOption !== null}
                      className={`h-auto py-3 md:py-4 px-3 md:px-4 text-sm md:text-lg justify-between transition-all duration-300 ${
                        showResult && isGood
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : showResult && !isGood
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-white hover:bg-pink-50 text-gray-900 border-2"
                      }`}
                      variant={showResult ? "default" : "outline"}
                    >
                      <span className="text-left flex-1 leading-snug break-words">{option.text}</span>
                      {showResult && isGood && <CheckCircle2 className="w-4 md:w-6 h-4 md:h-6 ml-2 flex-shrink-0" />}
                      {showResult && !isGood && <XCircle className="w-4 md:w-6 h-4 md:h-6 ml-2 flex-shrink-0" />}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-2"
          >
            <div className="text-5xl md:text-6xl mb-4 md:mb-6">✨</div>
            <h3 className="text-xl md:text-2xl font-bold text-pink-600 mb-3 md:mb-4">What We Learned</h3>
            <div className="bg-pink-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">{scenario.lesson}</p>
            </div>
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-rose-500 w-full md:w-auto"
            >
              {currentScenario < akhlaqScenarios.length - 1 ? "Next Scenario" : "Complete Challenge"}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}