
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";

const hadithQuestions = [
  {
    id: "hadith_1",
    question: "The Prophet ﷺ said: 'The best of people are those who are best to their...'",
    options: ["Friends", "Families", "Neighbors", "Animals"],
    correct: 1,
    explanation: "The Prophet ﷺ emphasized the importance of treating family well."
  },
  {
    id: "hadith_2",
    question: "What is the heaviest thing on the scale of deeds according to a hadith?",
    options: ["Prayer", "Charity", "Good character", "Fasting"],
    correct: 2,
    explanation: "Good character (Akhlaq) is the heaviest on the scale of deeds."
  },
  {
    id: "hadith_3",
    question: "The Prophet ﷺ said smiling at your brother is what?",
    options: ["Charity", "Prayer", "Fasting", "Hajj"],
    correct: 0,
    explanation: "Even a smile is considered Sadaqah (charity)!"
  },
  {
    id: "hadith_4",
    question: "According to a hadith, which deeds continue after a person dies?",
    options: ["Wealth, land, gold", "Charity, knowledge, righteous children", "Prayer, fasting, Hajj", "House, car, money"],
    correct: 1,
    explanation: "Ongoing charity, beneficial knowledge, and righteous children who pray for them continue after death."
  },
  {
    id: "hadith_5",
    question: "The Prophet ﷺ said: 'He who does not show mercy will not be shown...'",
    options: ["Love", "Kindness", "Mercy", "Respect"],
    correct: 2,
    explanation: "The Prophet ﷺ taught that mercy leads to receiving mercy from Allah."
  },
  {
    id: "hadith_6",
    question: "What did the Prophet ﷺ say about intentions?",
    options: ["Actions are by results", "Actions are by intentions", "Actions are by words", "Actions are by habits"],
    correct: 1,
    explanation: "Actions are judged by intentions - this is from the famous hadith in Sahih Bukhari."
  },
  {
    id: "hadith_7",
    question: "The Prophet ﷺ said: 'The strong person is not the one who is good at wrestling, but...'",
    options: ["The one who lifts heavy", "The one who controls anger", "The one who runs fast", "The one who fights well"],
    correct: 1,
    explanation: "True strength is controlling anger, not physical strength."
  },
  {
    id: "hadith_8",
    question: "According to hadith, what should you say when you hear bad news?",
    options: ["Alhamdulillah", "Inna lillahi wa inna ilayhi raji'un", "Subhanallah", "Masha'Allah"],
    correct: 1,
    explanation: "We say 'Inna lillahi wa inna ilayhi raji'un' (To Allah we belong and to Him we return)."
  },
  {
    id: "hadith_9",
    question: "The Prophet ﷺ said a believer does not sleep with a full stomach while their neighbor is...",
    options: ["Angry", "Sad", "Hungry", "Tired"],
    correct: 2,
    explanation: "This hadith teaches us to care for our neighbors and share with them."
  },
  {
    id: "hadith_10",
    question: "What did the Prophet ﷺ say is a sign of faith (Iman)?",
    options: ["Love for others what you love for yourself", "Praying 5 times", "Fasting in Ramadan", "Giving Zakat"],
    correct: 0,
    explanation: "Loving for others what you love for yourself is a perfect sign of faith."
  }
];

export default function HadithGame({ onComplete }) {
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
      console.log("User not authenticated", error);
    }
  };

  const shuffleQuestions = () => {
    const shuffled = [...hadithQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
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
            game_type: "hadith_quiz",
            score: finalScore,
            completed: true
          });
          
          // Cap total points at 1500
          const newTotalPoints = Math.min((user.points || 0) + finalScore, 1500);
          
          await base44.auth.updateMe({
            points: newTotalPoints
          });
          // Update local user state with new points to reflect on the game over screen immediately
          setUser(prevUser => prevUser ? { ...prevUser, points: newTotalPoints } : null);

        } catch (error) {
          console.error("Error saving score or updating user points:", error);
        }
      }
    }
  };

  // Removed handleResetMyScores as per outline changes
  // const handleResetMyScores = async () => {
  //   if (user && confirm("Are you sure you want to reset your total points to 0? This action cannot be undone.")) {
  //     try {
  //       await base44.auth.updateMe({ points: 0 });
  //       setUser(prevUser => prevUser ? { ...prevUser, points: 0 } : null); // Update local state to reflect the change
  //       alert("Your total points have been reset to 0.");
  //     } catch (error) {
  //       console.error("Error resetting user scores:", error);
  //       alert("Failed to reset scores.");
  //     }
  //   }
  // };

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
        <Card className="max-w-md mx-auto border-2 border-amber-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {percentage >= 80 ? "Masha'Allah! Excellent! 🎉" : percentage >= 60 ? "Well Done! 👍" : "Keep Learning! 📚"}
            </h2>
            <p className="text-xl text-gray-600 mb-4">You Earned</p>
            <p className="text-5xl font-bold text-amber-600 mb-6">10 points</p>
            <p className="text-gray-600 mb-2">You got {correctAnswers} out of {questions.length} correct!</p>
            <p className="text-2xl font-bold text-amber-600 mb-6">{Math.round(percentage)}%</p>
            
            <div className="bg-amber-100 rounded-lg p-3 mb-6 border-2 border-amber-400">
              <p className="text-sm font-bold text-amber-900">
                ✨ Fair Points: Every game awards 10 points!
              </p>
            </div>
            
            <div className="flex flex-col gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-amber-500 to-orange-500">
                Play Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(10)} variant="outline">
                  Back to Games
                </Button>
              )}
              {/* Removed Admin tool to reset personal high score (points) as per outline changes. */}
              {/* {user && ( 
                <Button onClick={handleResetMyScores} variant="destructive" className="mt-4">
                  Reset My Points
                </Button>
              )} */}
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
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <ScrollText className="w-6 h-6" />
            Hadith Quiz
          </CardTitle>
          <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
            Score: {score}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 bg-white/30" />
        <p className="text-sm text-amber-100 mt-2">
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
                className="mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200"
              >
                <p className="text-sm font-semibold text-amber-900 mb-2">📜 Did you know?</p>
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
              {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
