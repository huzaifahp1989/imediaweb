import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Zap, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PropTypes from 'prop-types';

const questions = [
  {
    question: "Which companion did the Prophet ﷺ instruct to lead the Muslims in prayer during his final illness?",
    options: ["Abu Bakr as-Siddiq", "Umar ibn al-Khattab", "Ali ibn Abi Talib", "Uthman ibn Affan"],
    correct: 0,
    explanation: "Abu Bakr was chosen to lead the prayers, showing his high status."
  },
  {
    question: "Who was the first martyr in Islam?",
    options: ["Hamza ibn Abdul-Muttalib", "Sumayyah bint Khabbat", "Yasir ibn Amir", "Khabbaab ibn al-Aratt"],
    correct: 1,
    explanation: "Sumayyah was the first martyr, killed for refusing to renounce Islam."
  },
  {
    question: "Which companion was renowned for his beautiful voice in reciting the Quran?",
    options: ["Bilal ibn Rabah", "Abu Musa al-Ash'ari", "Abdullah ibn Masud", "Ubay ibn Ka'b"],
    correct: 1,
    explanation: "Abu Musa al-Ash'ari had one of the most beautiful voices for Quran recitation."
  },
  {
    question: "Umar ibn al-Khattab accepted Islam after hearing the recitation of which Surah?",
    options: ["Surah Al-Fatiha", "Surah Taha", "Surah Ya-Sin", "Surah Al-Kahf"],
    correct: 1,
    explanation: "Umar was moved to Islam after hearing Surah Taha being recited by his sister."
  },
  {
    question: "Which female companion was an expert in Islamic law and gave fatwas?",
    options: ["Khadijah bint Khuwaylid", "Aisha bint Abi Bakr", "Fatimah bint Muhammad", "Hafsa bint Umar"],
    correct: 1,
    explanation: "Aisha was a great scholar who taught many companions Islamic law."
  },
  {
    question: "Who was the conqueror of Egypt and the founder of Fustat?",
    options: ["Khalid ibn al-Walid", "Amr ibn al-As", "Saad ibn Abi Waqqas", "Abu Ubaidah ibn al-Jarrah"],
    correct: 1,
    explanation: "Amr ibn al-As conquered Egypt and established the city of Fustat."
  },
  {
    question: "Which companion was known as 'The Trustworthy of the Ummah'?",
    options: ["Abu Bakr", "Umar", "Abu Ubaidah ibn al-Jarrah", "Uthman"],
    correct: 2,
    explanation: "The Prophet ﷺ called Abu Ubaidah 'The Trustworthy of this Ummah'."
  },
  {
    question: "Who was the youngest person to memorize the Quran during the Prophet's ﷺ time?",
    options: ["Abdullah ibn Abbas", "Zayd ibn Thabit", "Anas ibn Malik", "Abdullah ibn Umar"],
    correct: 1,
    explanation: "Zayd ibn Thabit memorized the Quran at a very young age."
  },
  {
    question: "Which companion was given the title 'Lion of Allah'?",
    options: ["Hamza ibn Abdul-Muttalib", "Ali ibn Abi Talib", "Khalid ibn al-Walid", "Umar ibn al-Khattab"],
    correct: 0,
    explanation: "Hamza was called 'Lion of Allah' for his bravery in battle."
  },
  {
    question: "Who was the first Muslim to be born in Medina after the Hijrah?",
    options: ["Abdullah ibn Umar", "Abdullah ibn Zubayr", "Hassan ibn Thabit", "Usama ibn Zayd"],
    correct: 1,
    explanation: "Abdullah ibn Zubayr was the first child born to the Muhajirun in Medina."
  }
];

export default function SahabahArena({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [user, setUser] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

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
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
    setShuffledQuestions(shuffled);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const question = shuffledQuestions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
      setPlayerScore(playerScore + 10);
    } else {
      // AI gets point
      if (Math.random() > 0.3) { // AI has 70% chance to get it right
        setAiScore(aiScore + 10);
      }
    }
  };

  const handleNext = async () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Game over
      setGameOver(true);
      const gameWinner = playerScore > aiScore ? "player" : playerScore < aiScore ? "ai" : "draw";
      setWinner(gameWinner);
      
      if (user && gameWinner === "player") {
        try {
          await base44.entities.GameScore.create({
            user_id: user.id,
            game_type: "sahabah_arena",
            score: playerScore,
            completed: true
          });
          
          const newTotalPoints = Math.min((user.points || 0) + playerScore, 1500);
          await base44.auth.updateMe({ points: newTotalPoints });
        } catch (error) {
          console.error("Error saving score:", error);
        }
      }
    }
  };

  const resetGame = () => {
    shuffleQuestions();
    setCurrentQuestion(0);
    setPlayerScore(0);
    setAiScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameOver(false);
    setWinner(null);
  };

  if (shuffledQuestions.length === 0) {
    return <div className="text-center py-12">Loading questions...</div>;
  }

  if (gameOver) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-amber-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {winner === "player" ? "You Won! 🎉" : winner === "ai" ? "AI Won! 🤖" : "It's a Draw! 🤝"}
            </h2>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-sm text-gray-600">Your Score</p>
                <p className="text-4xl font-bold text-blue-600">{playerScore}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">AI Score</p>
                <p className="text-4xl font-bold text-red-600">{aiScore}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-amber-500 to-orange-500">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(winner === "player" ? playerScore : 0)} variant="outline">
                  Back to Games
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const question = shuffledQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Sahabah Arena
          </CardTitle>
          <div className="flex gap-4">
            <Badge className="bg-blue-500 text-white text-lg px-4 py-2">
              You: {playerScore}
            </Badge>
            <Badge className="bg-red-500 text-white text-lg px-4 py-2">
              AI: {aiScore}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-white/30" />
        <p className="text-sm text-amber-100 mt-2">
          Question {currentQuestion + 1} of {shuffledQuestions.length}
        </p>
      </CardHeader>

      <CardContent className="p-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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
                className="mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200"
              >
                <p className="text-sm font-semibold text-amber-900 mb-2">⚔️ Did you know?</p>
                <p className="text-sm text-amber-800">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedAnswer !== null && (
            <Button
              onClick={handleNext}
              className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              size="lg"
            >
              {currentQuestion < shuffledQuestions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}

SahabahArena.propTypes = {
  onComplete: PropTypes.func
};