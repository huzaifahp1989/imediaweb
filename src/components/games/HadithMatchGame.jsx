
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, CheckCircle2, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const hadithPairs = [
  {
    hadith: "The best of you are those who are best to their families",
    meaning: "Be kind and loving to your family members",
    category: "Family",
    points: 2
  },
  {
    hadith: "A believer does not taunt, curse, abuse or talk indecently",
    meaning: "Always speak good words and be polite",
    category: "Manners",
    points: 2
  },
  {
    hadith: "The strong person is not the one who can wrestle, but the one who controls himself when angry",
    meaning: "Control your anger and stay calm",
    category: "Self-Control",
    points: 2
  },
  {
    hadith: "Whoever believes in Allah and the Last Day should speak good or remain silent",
    meaning: "Think before you speak, say good things or stay quiet",
    category: "Speech",
    points: 2
  },
  {
    hadith: "None of you truly believes until he loves for his brother what he loves for himself",
    meaning: "Wish good things for others just like you wish for yourself",
    category: "Kindness",
    points: 2
  }
];

export default function HadithMatchGame({ onComplete }) {
  const [currentPair, setCurrentPair] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffledMeanings, setShuffledMeanings] = useState([]);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [showResult, setShowResult] = useState(false);
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
    shuffleMeanings();
  }, []);

  useEffect(() => {
    shuffleMeanings();
  }, [currentPair]);

  const shuffleMeanings = () => {
    const meanings = hadithPairs.map(pair => pair.meaning);
    const shuffled = meanings.sort(() => Math.random() - 0.5);
    setShuffledMeanings(shuffled);
  };

  const handleMeaningSelect = (meaning) => {
    setSelectedMeaning(meaning);
    setShowResult(true);
    
    const pair = hadithPairs[currentPair];
    if (meaning === pair.meaning) {
      setScore(score + pair.points);
    }

    setTimeout(() => {
      if (currentPair < hadithPairs.length - 1) {
        setCurrentPair(currentPair + 1);
        setSelectedMeaning(null);
        setShowResult(false);
      } else {
        completeGame();
      }
    }, 2000);
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user) {
      try {
        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "hadith_match",
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
        <Card className="max-w-md mx-auto border-2 border-purple-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-24 h-24 mx-auto mb-6 text-purple-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hadith Hero! 🕋
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You earned <span className="font-bold text-purple-600">{score} points!</span>
            </p>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                You've learned important teachings from the Prophet Muhammad ﷺ. Keep practicing these lessons!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const pair = hadithPairs[currentPair];

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">🕋 Hadith Match-Up</CardTitle>
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-white">{score} pts</span>
          </div>
        </div>
        <p className="text-sm mt-2 text-white">Hadith {currentPair + 1} of {hadithPairs.length}</p>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPair}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="mb-4 md:mb-6">
              <Badge className="mb-3 md:mb-4 bg-purple-100 text-purple-800 text-xs md:text-sm">
                Category: {pair.category}
              </Badge>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 md:p-6 border-l-4 border-purple-500">
                <div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
                  <Volume2 className="w-4 md:w-5 h-4 md:h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <p className="text-sm md:text-lg text-gray-800 italic leading-relaxed break-words">
                    "{pair.hadith}"
                  </p>
                </div>
                <p className="text-xs md:text-sm text-gray-600 text-right">- Prophet Muhammad ﷺ</p>
              </div>
            </div>
            
            <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4 px-2">
              Match this Hadith with its meaning:
            </h4>
            
            <div className="grid gap-2 md:gap-3">
              {shuffledMeanings.map((meaning, index) => {
                const isCorrect = meaning === pair.meaning;
                const isSelected = meaning === selectedMeaning;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;
                
                return (
                  <Button
                    key={index}
                    onClick={() => !showResult && handleMeaningSelect(meaning)}
                    disabled={showResult}
                    className={`h-auto py-3 md:py-4 px-3 md:px-4 text-sm md:text-lg justify-between transition-all duration-300 ${
                      showCorrect
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : showWrong
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white hover:bg-purple-50 text-gray-900 border-2"
                    }`}
                    variant={showResult ? "default" : "outline"}
                  >
                    <span className="text-left flex-1 leading-snug break-words">{meaning}</span>
                    {showCorrect && <CheckCircle2 className="w-4 md:w-6 h-4 md:h-6 ml-2 flex-shrink-0" />}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
