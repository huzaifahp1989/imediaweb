
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Star, Lightbulb, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const crosswordClues = [
  { word: "ALLAH", clue: "The one and only God in Islam", hint: "5 letters", points: 2 },
  { word: "SALAH", clue: "The five daily prayers", hint: "5 letters", points: 2 },
  { word: "QURAN", clue: "The holy book of Islam", hint: "5 letters", points: 2 },
  { word: "HAJJ", clue: "Pilgrimage to Makkah", hint: "4 letters", points: 2 },
  { word: "ZAKAT", clue: "Charity given to the poor", hint: "5 letters", points: 2 },
  { word: "RAMADAN", clue: "The month of fasting", hint: "7 letters", points: 2 },
  { word: "MAKKAH", clue: "The holy city where Muslims pray towards", hint: "6 letters", points: 2 },
  { word: "KAABA", clue: "The cube-shaped building in Makkah", hint: "5 letters", points: 2 },
  { word: "PROPHET", clue: "Muhammad (peace be upon him) is our ___", hint: "7 letters", points: 2 },
  { word: "MASJID", clue: "Place where Muslims pray together", hint: "6 letters", points: 2 }
];

export default function IslamicCrosswordGame({ onComplete }) {
  const [currentClue, setCurrentClue] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState([]);
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
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clue = crosswordClues[currentClue];
    const isCorrect = answer.toUpperCase() === clue.word;
    
    setShowResult(true);
    
    if (isCorrect) {
      setScore(score + clue.points);
      setSolved([...solved, clue.word]);
    }

    setTimeout(() => {
      if (currentClue < crosswordClues.length - 1) {
        setCurrentClue(currentClue + 1);
        setAnswer("");
        setShowHint(false);
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
          game_type: "crossword",
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
        <Card className="max-w-md mx-auto border-2 border-indigo-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: 360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-24 h-24 mx-auto mb-6 text-indigo-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Crossword Champion! 💫
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              You earned <span className="font-bold text-indigo-600">{score} points!</span>
            </p>
            <p className="text-gray-500 mb-6">Words Solved: {solved.length}/{crosswordClues.length}</p>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Excellent work! You've mastered Islamic terms and concepts!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const clue = crosswordClues[currentClue];
  const isCorrect = answer.toUpperCase() === clue.word;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="bg-gradient-to-r from-teal-400 to-emerald-500 text-white p-3 rounded-lg shadow-md mb-6 flex items-center justify-center space-x-2"
      >
        <Trophy className="w-5 h-5" />
        <p className="text-sm font-semibold">
          🎉 Compete for the Monthly Prize! Top scores win! 🎉
        </p>
      </motion.div>
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">💫 Islamic Crossword</CardTitle>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-amber-300" />
              <span className="font-bold">{score} pts</span>
            </div>
          </div>
          <p className="text-sm mt-2">
            Word {currentClue + 1} of {crosswordClues.length} • Solved: {solved.length}
          </p>
        </CardHeader>
        
        <CardContent className="p-4 md:p-8">
          <motion.div
            key={currentClue}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 md:mb-6">
              <Badge className="mb-3 md:mb-4 bg-indigo-100 text-indigo-800 text-xs md:text-sm">
                {clue.points} points
              </Badge>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 md:p-6 mb-3 md:mb-4">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">Clue:</h3>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">{clue.clue}</p>
              </div>
              
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-amber-50 rounded-lg p-3 md:p-4 mb-3 md:mb-4 flex items-center gap-2"
                >
                  <Lightbulb className="w-4 md:w-5 h-4 md:h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-amber-800 text-sm md:text-base">Hint: {clue.hint}</span>
                </motion.div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Answer:
                </label>
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className={`text-xl md:text-2xl font-bold uppercase text-center ${
                    showResult
                      ? isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : ""
                  }`}
                  disabled={showResult}
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                {!showResult && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowHint(!showHint)}
                      className="flex-1 text-sm md:text-base"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {showHint ? "Hide Hint" : "Show Hint"}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-sm md:text-base"
                    >
                      Submit Answer
                    </Button>
                  </>
                )}
                {showResult && (
                  <div className="flex-1 text-center py-2">
                    {isCorrect ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 text-base md:text-lg font-bold">
                        <CheckCircle2 className="w-5 md:w-6 h-5 md:h-6" />
                        Correct! +{clue.points} points
                      </div>
                    ) : (
                      <div className="text-red-600 text-base md:text-lg font-bold">
                        The answer was: {clue.word}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
