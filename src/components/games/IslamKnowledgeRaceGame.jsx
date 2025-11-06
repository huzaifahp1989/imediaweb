
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";

const raceQuestions = [
  {
    question: "What is the first pillar of Islam?",
    options: ["Salah", "Shahada", "Zakat", "Hajj"],
    correct: 1,
    category: "Pillars",
    points: 2
  },
  {
    question: "Who was the first Prophet?",
    options: ["Prophet Ibrahim", "Prophet Adam", "Prophet Nuh", "Prophet Muhammad"],
    correct: 1,
    category: "Prophets",
    points: 2
  },
  {
    question: "In which month do Muslims fast?",
    options: ["Rajab", "Shaban", "Ramadan", "Shawwal"],
    correct: 2,
    category: "Worship",
    points: 2
  },
  {
    question: "How many Surahs are in the Quran?",
    options: ["100", "114", "120", "99"],
    correct: 1,
    category: "Quran",
    points: 2
  },
  {
    question: "What does 'Salaam' mean?",
    options: ["Hello", "Peace", "Thank you", "Goodbye"],
    correct: 1,
    category: "Manners",
    points: 2
  },
  {
    question: "Which angel brought revelations to the Prophet ﷺ?",
    options: ["Mikail", "Israfil", "Jibreel", "Azrael"],
    correct: 2,
    category: "Angels",
    points: 2
  },
  {
    question: "What is the Qibla?",
    options: ["A prayer", "Direction of prayer", "A mosque", "Holy book"],
    correct: 1,
    category: "Worship",
    points: 2
  },
  {
    question: "Who was known as Al-Amin (The Trustworthy)?",
    options: ["Prophet Ibrahim", "Prophet Musa", "Prophet Muhammad", "Prophet Isa"],
    correct: 2,
    category: "Seerah",
    points: 2
  },
  {
    question: "What should you say before eating?",
    options: ["Alhamdulillah", "Bismillah", "SubhanAllah", "Allahu Akbar"],
    correct: 1,
    category: "Manners",
    points: 2
  },
  {
    question: "How many daily prayers are there?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    category: "Worship",
    points: 2
  }
];

const shuffleOptions = (options, correctIndex) => {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.indexOf(correctAnswer);
  return { shuffled, newCorrectIndex };
};

export default function IslamKnowledgeRaceGame({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(0);

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

  useEffect(() => {
    // Shuffle options when question changes
    const question = raceQuestions[currentQuestion];
    const { shuffled, newCorrectIndex } = shuffleOptions(question.options, question.correct);
    setShuffledOptions(shuffled);
    setCorrectIndex(newCorrectIndex);
  }, [currentQuestion]);

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === correctIndex;
    
    if (isCorrect) {
      const basePoints = 2; // Award 2 base points per correct answer
      const streakBonus = streak > 0 ? 1 : 0; // 1 point bonus for any active streak
      const totalPoints = basePoints + streakBonus;
      
      setScore(score + totalPoints);
      setStreak(streak + 1);
      setProgress(progress + (100 / raceQuestions.length));
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestion < raceQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        completeGame();
      }
    }, 1500);
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user) {
      try {
        await awardPointsForGame(user, "knowledge_race", { fallbackScore: score });
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
        <Card className="max-w-md mx-auto border-2 border-amber-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Race Finished! 🏁
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You earned <span className="font-bold text-amber-600">{score} points!</span>
            </p>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Great job racing through Islamic knowledge! Keep learning and growing!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const question = raceQuestions[currentQuestion];

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">🐪</span>
            Islam Knowledge Race
          </CardTitle>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-amber-300" />
            <span className="font-bold">{score} pts</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestion + 1} of {raceQuestions.length}</span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-300" />
              Streak: {streak}
            </span>
          </div>
          <Progress value={progress} className="bg-white/30 h-3" />
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-4">
                <p className="text-sm text-amber-700 font-semibold mb-2">
                  {question.category}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {question.question}
                </h3>
              </div>
            </div>

            <div className="grid gap-3">
              {shuffledOptions.map((option, index) => {
                const isCorrect = index === correctIndex;
                const isSelected = index === selectedAnswer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                    className={`h-auto py-4 text-lg justify-start transition-all duration-300 ${
                      showCorrect
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : showWrong
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white hover:bg-amber-50 text-gray-900 border-2"
                    }`}
                    variant={showResult ? "default" : "outline"}
                  >
                    <span className="flex-1 text-left">{option}</span>
                    {showCorrect && <Zap className="w-6 h-6 ml-2 text-yellow-300" />}
                  </Button>
                );
              })}
            </div>

            {streak > 2 && !showResult && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 text-center"
              >
                <p className="text-amber-600 font-bold flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Amazing streak! Keep going! 🔥
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
