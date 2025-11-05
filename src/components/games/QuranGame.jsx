
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

const quranQuestions = [
  {
    id: "quran_1",
    question: "How many Surahs are in the Quran?",
    options: ["100", "114", "120", "99"],
    correct: 1,
    explanation: "The Quran has 114 chapters (Surahs)."
  },
  {
    id: "quran_2",
    question: "What is the longest Surah in the Quran?",
    options: ["Al-Fatiha", "Al-Baqarah", "Al-Imran", "An-Nisa"],
    correct: 1,
    explanation: "Surah Al-Baqarah with 286 verses is the longest Surah."
  },
  {
    id: "quran_3",
    question: "Which Surah is known as the 'Heart of the Quran'?",
    options: ["Al-Fatiha", "Yasin", "Al-Mulk", "Ar-Rahman"],
    correct: 1,
    explanation: "Surah Yasin is called the heart of the Quran."
  },
  {
    id: "quran_4",
    question: "What is the shortest Surah in the Quran?",
    options: ["Al-Ikhlas", "Al-Kawthar", "An-Nasr", "Al-Asr"],
    correct: 1,
    explanation: "Surah Al-Kawthar has only 3 verses."
  },
  {
    id: "quran_5",
    question: "In which language was the Quran revealed?",
    options: ["Urdu", "Arabic", "Persian", "Hebrew"],
    correct: 1,
    explanation: "The Quran was revealed in Arabic."
  },
  {
    id: "quran_6",
    question: "Which prophet received the Quran?",
    options: ["Prophet Musa", "Prophet Isa", "Prophet Muhammad ﷺ", "Prophet Ibrahim"],
    correct: 2,
    explanation: "The Quran was revealed to Prophet Muhammad ﷺ."
  },
  {
    id: "quran_7",
    question: "How many prophets are mentioned by name in the Quran?",
    options: ["20", "25", "30", "40"],
    correct: 1,
    explanation: "The Quran mentions 25 prophets by name."
  },
  {
    id: "quran_8",
    question: "Which Surah is recited in every Salah?",
    options: ["Al-Baqarah", "Al-Fatiha", "Al-Ikhlas", "An-Nas"],
    correct: 1,
    explanation: "Surah Al-Fatiha is recited in every unit of prayer."
  },
  {
    id: "quran_9",
    question: "What is the first word revealed in the Quran?",
    options: ["Bismillah", "Alhamdulillah", "Iqra", "Qul"],
    correct: 2,
    explanation: "'Iqra' (Read) was the first word revealed."
  },
  {
    id: "quran_10",
    question: "Which Surah does not begin with Bismillah?",
    options: ["Al-Fatiha", "At-Tawbah", "Al-Ikhlas", "An-Nas"],
    correct: 1,
    explanation: "Surah At-Tawbah (Chapter 9) does not begin with Bismillah."
  }
];

export default function QuranGame({ onComplete }) {
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
    const shuffled = [...quranQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
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
            game_type: "quran_quiz",
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
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {percentage >= 80 ? "Masha'Allah! Excellent! 🎉" : percentage >= 60 ? "Well Done! 👍" : "Keep Learning! 📚"}
            </h2>
            <p className="text-xl text-gray-600 mb-4">You Earned</p>
            <p className="text-5xl font-bold text-green-600 mb-6">10 points</p>
            <p className="text-gray-600 mb-2">You got {correctAnswers} out of {questions.length} correct!</p>
            <p className="text-2xl font-bold text-green-600 mb-6">{Math.round(percentage)}%</p>
            
            <div className="bg-green-100 rounded-lg p-3 mb-6 border-2 border-green-400">
              <p className="text-sm font-bold text-green-900">
                ✨ Fair Points: Every game awards 10 points!
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-green-500 to-teal-500">
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
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Quran Quiz
          </CardTitle>
          <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
            Score: {score}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 bg-white/30" />
        <p className="text-sm text-green-100 mt-2">
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
                className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-200"
              >
                <p className="text-sm font-semibold text-green-900 mb-2">📚 Did you know?</p>
                <p className="text-sm text-green-800">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedAnswer !== null && (
            <Button
              onClick={handleNext}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
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
