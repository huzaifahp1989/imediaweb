
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

const fiqhQuestions = [
  {
    id: "fiqh_1",
    question: "How many times a day do Muslims pray?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "Muslims pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha."
  },
  {
    id: "fiqh_2",
    question: "What must you do before praying?",
    options: ["Sleep", "Eat", "Wudu (ablution)", "Exercise"],
    correct: 2,
    explanation: "Wudu (ablution) is required before prayer to purify ourselves."
  },
  {
    id: "fiqh_3",
    question: "How many Rakats are in Fajr prayer?",
    options: ["2", "3", "4", "5"],
    correct: 0,
    explanation: "Fajr prayer consists of 2 Rakats."
  },
  {
    id: "fiqh_4",
    question: "What percentage of your wealth must you give as Zakat (if applicable)?",
    options: ["1.5%", "2.5%", "5%", "10%"],
    correct: 1,
    explanation: "Zakat is 2.5% of your qualifying wealth given annually to those in need."
  },
  {
    id: "fiqh_5",
    question: "In which month do Muslims fast?",
    options: ["Shawwal", "Ramadan", "Dhul Hijjah", "Muharram"],
    correct: 1,
    explanation: "Muslims fast during the blessed month of Ramadan."
  },
  {
    id: "fiqh_6",
    question: "What direction do Muslims face when praying?",
    options: ["North", "South", "Towards Kaaba (Qibla)", "East"],
    correct: 2,
    explanation: "Muslims face towards the Kaaba in Makkah, called the Qibla."
  },
  {
    id: "fiqh_7",
    question: "How many pillars of Islam are there?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "There are 5 pillars: Shahada, Salah, Zakat, Sawm (Fasting), and Hajj."
  },
  {
    id: "fiqh_8",
    question: "What breaks your fast during Ramadan?",
    options: ["Sleeping", "Walking", "Eating or drinking", "Reading"],
    correct: 2,
    explanation: "Eating or drinking intentionally breaks the fast during Ramadan."
  },
  {
    id: "fiqh_9",
    question: "What is the pilgrimage to Makkah called?",
    options: ["Umrah", "Hajj", "Ziyarah", "Safa"],
    correct: 1,
    explanation: "Hajj is the annual pilgrimage to Makkah, one of the five pillars of Islam."
  },
  {
    id: "fiqh_10",
    question: "Which prayer has no Sunnah before the Fard?",
    options: ["Fajr", "Dhuhr", "Asr", "Isha"],
    correct: 2,
    explanation: "Asr prayer has no Sunnah prayer before the obligatory (Fard) prayer."
  }
];

export default function FiqhGame({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadUser();
    shuffleQuestions();
  }, []);

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

  const shuffleQuestions = () => {
    const shuffled = [...fiqhQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 10);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameOver(true);
      
      if (user) {
        try {
          // Always award 10 points regardless of score
          const finalScore = 10; 
          
          await base44.entities.GameScore.create({
            user_id: user.id,
            game_type: "fiqh_quiz",
            score: finalScore,
            completed: true
          });
          
          // Cap total points at 1500
          const newTotalPoints = Math.min((user.points || 0) + finalScore, 1500);
          
          await base44.auth.updateMe({
            points: newTotalPoints
          });
        } catch (error) {
          console.error("Error saving score:", error);
        }
      }
    }
  };

  const resetGame = () => {
    shuffleQuestions();
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameOver(false);
  };

  if (questions.length === 0) {
    return <div className="text-center py-12">Loading questions...</div>;
  }

  if (gameOver) {
    const correctAnswers = score / 10;
    const percentage = (correctAnswers / questions.length) * 100;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-blue-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-blue-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {percentage >= 80 ? "Masha'Allah! Excellent! 🎉" : percentage >= 60 ? "Well Done! 👍" : "Keep Learning! 📚"}
            </h2>
            <p className="text-xl text-gray-600 mb-4">You Earned</p>
            <p className="text-5xl font-bold text-blue-600 mb-6">10 points</p>
            <p className="text-gray-600 mb-2">You got {correctAnswers} out of {questions.length} correct!</p>
            <p className="text-2xl font-bold text-blue-600 mb-6">{Math.round(percentage)}%</p>
            
            <div className="bg-blue-100 rounded-lg p-3 mb-6 border-2 border-blue-400">
              <p className="text-sm font-bold text-blue-900">
                ✨ Fair Points: Every game awards 10 points!
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                Play Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(10)} variant="outline">
                  Back to Games
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Fiqh Quiz
          </CardTitle>
          <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
            Score: {score}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 bg-white/30" />
        <p className="text-sm text-purple-100 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </CardHeader>

      <CardContent className="p-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  selectedAnswer === null
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    : index === question.correct
                    ? "bg-green-500 text-white"
                    : selectedAnswer === index
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer !== null && (
                    index === question.correct ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : selectedAnswer === index ? (
                      <XCircle className="w-6 h-6" />
                    ) : null
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
              >
                <p className="text-sm font-semibold text-purple-900 mb-2">🕌 Did you know?</p>
                <p className="text-sm text-purple-800">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedAnswer !== null && (
            <Button
              onClick={handleNext}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
