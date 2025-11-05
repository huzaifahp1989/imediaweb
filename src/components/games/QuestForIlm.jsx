import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Map, ArrowRight, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PropTypes from 'prop-types';

const avatars = ["🧕", "👳‍♂️", "👨‍🎓", "👩‍🎓", "🧔", "👶"];

const questMap = [
  { id: 1, category: "Seerah", emoji: "📖", name: "Prophet's Life" },
  { id: 2, category: "Fiqh", emoji: "🕌", name: "Islamic Law" },
  { id: 3, category: "Hadith", emoji: "📜", name: "Prophetic Traditions" },
  { id: 4, category: "Quran", emoji: "📚", name: "Holy Quran" },
  { id: 5, category: "Sahabah", emoji: "⚔️", name: "Companions" },
  { id: 6, category: "Prophets", emoji: "🌟", name: "Messengers of Allah" },
];

const questions = {
  Seerah: [
    {
      question: "What was the name of Prophet Muhammad's ﷺ foster mother?",
      options: ["Halimah al-Sa'diyyah", "Aminah", "Barakah", "Fatimah"],
      correct: 0,
      explanation: "Halimah al-Sa'diyyah was the Prophet's ﷺ foster mother who nursed him in the desert."
    },
    {
      question: "In the Battle of Uhud, who was the archer that the Prophet ﷺ specifically commanded to not leave their post?",
      options: ["Khalid ibn Walid", "Abdullah ibn Jubayr", "Hamza", "Abu Bakr"],
      correct: 1,
      explanation: "Abdullah ibn Jubayr was commanded to hold his position with the archers, but they left their posts."
    },
    {
      question: "Which year is known as the 'Year of Sorrow' in the Seerah?",
      options: ["Year of the Elephant", "Year Khadijah and Abu Talib died", "Year of Hijrah", "Year of Conquest"],
      correct: 1,
      explanation: "The Year of Sorrow was when both Khadijah (ra) and Abu Talib passed away."
    }
  ],
  Fiqh: [
    {
      question: "If you cannot find water for Wudu, what is the alternative act of purification called?",
      options: ["Ghusl", "Tayammum", "Istinja", "Miswak"],
      correct: 1,
      explanation: "Tayammum is the dry ablution using clean earth when water is not available."
    },
    {
      question: "What is the minimum amount of wealth (nisab) for Zakat on gold?",
      options: ["50 grams", "75 grams", "87.48 grams", "100 grams"],
      correct: 2,
      explanation: "The nisab for gold is 87.48 grams or approximately 3 ounces."
    },
    {
      question: "What are the two primary categories of water used for purification in Islamic law?",
      options: ["Hot and Cold", "Purifying (Tahur) and Pure (Tahir)", "Fresh and Salt", "Clean and Dirty"],
      correct: 1,
      explanation: "Water is categorized as Tahur (purifying) which can purify, and Tahir (pure) which is clean but cannot purify."
    }
  ],
  Hadith: [
    {
      question: "Complete the famous Hadith: 'Actions are but by...'",
      options: ["...deeds", "...intentions", "...prayers", "...faith"],
      correct: 1,
      explanation: "This famous hadith teaches us that our intentions determine the value of our actions."
    },
    {
      question: "According to a Hadith in Sahih Muslim, what does backbiting metaphorically resemble?",
      options: ["Lying", "Stealing", "Eating the flesh of one's dead brother", "Breaking a promise"],
      correct: 2,
      explanation: "Backbiting is compared to eating your brother's flesh to show how horrible it is."
    },
    {
      question: "Which angel is responsible for delivering revelation to the prophets?",
      options: ["Mikail", "Israfil", "Jibril", "Azrael"],
      correct: 2,
      explanation: "Angel Jibril (Gabriel) brought Allah's revelations to the prophets."
    }
  ],
  Quran: [
    {
      question: "Which is the only Surah in the Quran that does not begin with 'Bismillah'?",
      options: ["Surah Al-Fatiha", "Surah At-Tawbah", "Surah Al-Ikhlas", "Surah An-Nas"],
      correct: 1,
      explanation: "Surah At-Tawbah (Chapter 9) is the only Surah that doesn't start with Bismillah."
    },
    {
      question: "Which Surah is known as the 'Heart of the Quran'?",
      options: ["Surah Al-Fatiha", "Surah Ya-Sin", "Surah Al-Mulk", "Surah Ar-Rahman"],
      correct: 1,
      explanation: "Surah Ya-Sin is called the heart of the Quran."
    },
    {
      question: "Name the prophet mentioned by name in the Quran the most number of times.",
      options: ["Prophet Muhammad ﷺ", "Prophet Ibrahim", "Prophet Musa", "Prophet Isa"],
      correct: 2,
      explanation: "Prophet Musa (Moses) is mentioned by name 136 times in the Quran."
    }
  ],
  Sahabah: [
    {
      question: "Which companion was known as the 'Sword of Allah'?",
      options: ["Ali ibn Abi Talib", "Khalid ibn al-Walid", "Umar ibn al-Khattab", "Hamza ibn Abdul-Muttalib"],
      correct: 1,
      explanation: "Khalid ibn al-Walid was given the title 'Sword of Allah' by the Prophet ﷺ."
    },
    {
      question: "Who was the first male to accept Islam?",
      options: ["Umar ibn al-Khattab", "Ali ibn Abi Talib", "Abu Bakr as-Siddiq", "Uthman ibn Affan"],
      correct: 2,
      explanation: "Abu Bakr was the first adult male to accept Islam."
    },
    {
      question: "Which companion was the chief scribe of the revelation?",
      options: ["Abdullah ibn Masud", "Zayd ibn Thabit", "Ubay ibn Ka'b", "Ali ibn Abi Talib"],
      correct: 1,
      explanation: "Zayd ibn Thabit was the main scribe who wrote down the Quranic revelations."
    }
  ],
  Prophets: [
    {
      question: "Which prophet is known for his incredible patience and is mentioned in the Quran?",
      options: ["Prophet Ayyub", "Prophet Yunus", "Prophet Yusuf", "Prophet Dawud"],
      correct: 0,
      explanation: "Prophet Ayyub (Job) is famous for his immense patience during trials."
    },
    {
      question: "Which prophet built the first ship by divine command?",
      options: ["Prophet Ibrahim", "Prophet Musa", "Prophet Nuh", "Prophet Sulayman"],
      correct: 2,
      explanation: "Prophet Nuh (Noah) built the Ark as commanded by Allah before the great flood."
    },
    {
      question: "Which prophet was known as Khalilullah (the Friend of Allah)?",
      options: ["Prophet Muhammad ﷺ", "Prophet Ibrahim", "Prophet Musa", "Prophet Isa"],
      correct: 1,
      explanation: "Prophet Ibrahim (Abraham) is called Khalilullah, the Friend of Allah."
    }
  ]
};

export default function QuestForIlm({ onComplete }) {
  const [gameState, setGameState] = useState("avatar"); // avatar, playing, complete
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [currentTile, setCurrentTile] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
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

  const startGame = (avatar) => {
    setSelectedAvatar(avatar);
    setGameState("playing");
    loadQuestion(0);
  };

  const loadQuestion = (tileIndex) => {
    const tile = questMap[tileIndex];
    const categoryQuestions = questions[tile.category];
    const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    setCurrentQuestion({ ...randomQuestion, category: tile.category, tile });
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === currentQuestion.correct) {
      const points = 15;
      setScore(score + points);
      setAnsweredCorrectly([...answeredCorrectly, currentTile]);
    }
  };

  const handleNext = async () => {
    const wasCorrect = selectedAnswer === currentQuestion.correct;
    
    if (wasCorrect) {
      if (currentTile < questMap.length - 1) {
        const nextTile = currentTile + 1;
        setCurrentTile(nextTile);
        loadQuestion(nextTile);
      } else {
        // Game complete
        setGameState("complete");
        
        if (user) {
          try {
            await base44.entities.GameScore.create({
              user_id: user.id,
              game_type: "quest_for_ilm",
              score: score + 15,
              completed: true
            });
            
            const finalScore = score + 15;
            const newTotalPoints = Math.min((user.points || 0) + finalScore, 1500);
            
            await base44.auth.updateMe({
              points: newTotalPoints
            });
          } catch (error) {
            console.error("Error saving score:", error);
          }
        }
      }
    } else {
      // Incorrect answer - reload same question
      loadQuestion(currentTile);
    }
  };

  const resetGame = () => {
    setGameState("avatar");
    setSelectedAvatar(null);
    setCurrentTile(0);
    setScore(0);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnsweredCorrectly([]);
  };

  // Avatar Selection Screen
  if (gameState === "avatar") {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="text-2xl text-center">
            <Map className="w-8 h-8 inline mr-2" />
            The Quest for Ilm (Knowledge)
          </CardTitle>
          <p className="text-center text-indigo-100 mt-2">Choose your avatar to begin your journey!</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-6">
            {avatars.map((avatar, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(avatar)}
                className="text-6xl p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all shadow-lg border-2 border-indigo-200 hover:border-indigo-400"
              >
                {avatar}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Game Complete Screen
  if (gameState === "complete") {
    const finalScore = score;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <div className="text-6xl mb-4">{selectedAvatar}</div>
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quest Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-4">You've mastered all lands!</p>
            <p className="text-5xl font-bold text-green-600 mb-6">{finalScore}</p>
            <p className="text-gray-600 mb-6">Total Points Earned</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-green-500 to-teal-500">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(finalScore)} variant="outline">
                  Back to Games
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Playing Screen
  const progress = ((currentTile + 1) / questMap.length) * 100;
  
  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{selectedAvatar}</div>
            <CardTitle className="text-2xl">Quest for Ilm</CardTitle>
          </div>
          <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
            Score: {score}
          </Badge>
        </div>
        
        {/* Map Progress */}
        <div className="flex items-center justify-between mb-2">
          {questMap.map((tile, index) => (
            <div key={tile.id} className="flex flex-col items-center">
              <div className={`text-2xl p-2 rounded-full ${
                index === currentTile ? 'bg-yellow-400' : 
                answeredCorrectly.includes(index) ? 'bg-green-400' : 
                'bg-white/30'
              }`}>
                {tile.emoji}
              </div>
              <div className="text-[10px] mt-1">{tile.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
        
        <Progress value={progress} className="h-2 bg-white/30" />
        <p className="text-sm text-indigo-100 mt-2">
          Land {currentTile + 1} of {questMap.length}: {currentQuestion?.tile.name}
        </p>
      </CardHeader>

      <CardContent className="p-8">
        {currentQuestion && (
          <motion.div
            key={currentTile}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">{currentQuestion.tile.emoji}</span>
              <Badge className="bg-indigo-100 text-indigo-800">{currentQuestion.category}</Badge>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                    selectedAnswer === null
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      : index === currentQuestion.correct
                      ? "bg-green-500 text-white"
                      : selectedAnswer === index
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedAnswer !== null && (
                      index === currentQuestion.correct ? (
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
                  className="mt-6 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200"
                >
                  <p className="text-sm font-semibold text-indigo-900 mb-2">
                    {selectedAnswer === currentQuestion.correct ? "✅ Correct!" : "❌ Incorrect"}
                  </p>
                  <p className="text-sm text-indigo-800">{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedAnswer !== null && (
              <Button
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                size="lg"
              >
                {selectedAnswer === currentQuestion.correct ? (
                  currentTile < questMap.length - 1 ? (
                    <>
                      Next Land <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    "Complete Quest!"
                  )
                ) : (
                  "Try Again"
                )}
              </Button>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

QuestForIlm.propTypes = {
  onComplete: PropTypes.func
};