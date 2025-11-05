
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Book } from "lucide-react";
import { base44 } from "@/api/base44Client";

const allQuranQuestions = {
  easy: [
    { id: "easy_heart", question: "Which Surah is called the heart of the Quran?", options: ["Surah Al-Fatiha", "Surah Yasin", "Surah Al-Ikhlas", "Surah Al-Mulk"], correct: 1, badge: "Surah Scholar", points: 2 },
    { id: "easy_count", question: "How many Surahs are in the Quran?", options: ["100", "114", "120", "99"], correct: 1, badge: "Quran Counter", points: 2 },
    { id: "easy_first", question: "Which Surah do we recite in every prayer?", options: ["Surah Al-Ikhlas", "Surah Al-Fatiha", "Surah An-Nas", "Surah Al-Falaq"], correct: 1, badge: "Prayer Scholar", points: 2 },
    { id: "easy_word", question: "What is the first word revealed in the Quran?", options: ["Iqra (Read)", "Qul (Say)", "Ya (O)", "Alif Lam Mim"], correct: 0, badge: "First Word Expert", points: 2 },
    { id: "easy_9", question: "What is the first word of the Quran?", options: ["Bismillah", "Iqra", "Alhamdulillah", "Qul"], correct: 1, badge: "First Word Scholar", points: 2 },
    { id: "easy_10", question: "Which Surah do we recite in every prayer?", options: ["Al-Ikhlas", "Al-Fatiha", "An-Nas", "Al-Falaq"], correct: 1, badge: "Prayer Expert", points: 2 },
    { id: "easy_11", question: "How many parts (Juz) is the Quran divided into?", options: ["20", "25", "30", "40"], correct: 2, badge: "Quran Structure", points: 2 },
    { id: "easy_12", question: "What does 'Bismillah' mean?", options: ["Thank God", "In the name of Allah", "God is great", "Praise Allah"], correct: 1, badge: "Arabic Scholar", points: 2 }
  ],
  medium: [
    { id: "medium_prophet", question: "Which Prophet is mentioned most in the Quran?", options: ["Prophet Muhammad ﷺ", "Prophet Ibrahim (AS)", "Prophet Musa (AS)", "Prophet Isa (AS)"], correct: 2, badge: "Prophet Expert", points: 2 },
    { id: "medium_bismillah", question: "What does 'Bismillah ir-Rahman ir-Rahim' mean?", options: ["Praise be to Allah", "In the name of Allah, Most Gracious, Most Merciful", "There is no god but Allah", "Allah is the Greatest"], correct: 1, badge: "Bismillah Master", points: 2 },
    { id: "medium_longest", question: "What is the longest Surah in the Quran?", options: ["Al-Fatiha", "Al-Baqarah", "Al-Imran", "An-Nisa"], correct: 1, badge: "Surah Length Expert", points: 2 },
    { id: "medium_prophets_count", question: "How many Prophets are mentioned by name in the Quran?", options: ["25", "20", "30", "15"], correct: 0, badge: "Prophets Counter", points: 2 },
    { id: "medium_8", question: "Which Surah is named after a woman?", options: ["Maryam", "Aisha", "Fatimah", "Khadijah"], correct: 0, badge: "Surah Names Expert", points: 2 },
    { id: "medium_9", question: "What is the 'Opening' Surah called?", options: ["Al-Baqarah", "Al-Fatiha", "Al-Ikhlas", "An-Nas"], correct: 1, badge: "Fatiha Master", points: 2 },
    { id: "medium_10", question: "Which Surah talks about the 'Pen'?", options: ["Al-Qalam", "Al-Alaq", "Al-Kafirun", "Al-Asr"], correct: 0, badge: "Pen Scholar", points: 2 },
    { id: "medium_11", question: "How many Surahs start with 'Alif Lam Mim'?", options: ["3", "4", "5", "6"], correct: 3, badge: "Mystery Letters", points: 2 }
  ],
  hard: [
    { id: "hard_last", question: "What is the last Surah revealed in the Quran?", options: ["Al-Fatiha", "An-Nasr", "Al-Ikhlas", "Al-Falaq"], correct: 1, badge: "Revelation Scholar", points: 2 },
    { id: "hard_years", question: "How many years did the Quran take to be revealed?", options: ["10 years", "23 years", "30 years", "40 years"], correct: 1, badge: "Timeline Expert", points: 2 },
    { id: "hard_protection", question: "Which two Surahs are called Al-Mu'awwidhatayn (the two protective surahs)?", options: ["Al-Falaq & An-Nas", "Al-Ikhlas & Al-Falaq", "An-Nas & Al-Kafirun", "Al-Fatiha & Al-Ikhlas"], correct: 0, badge: "Protection Master", points: 2 },
    { id: "hard_prostration", question: "How many verses of prostration (Sajdah) are in the Quran?", options: ["10", "14", "15", "20"], correct: 1, badge: "Sajdah Scholar", points: 2 },
    { id: "hard_8", question: "Which Surah does not start with Bismillah?", options: ["Al-Fatiha", "At-Tawbah", "Al-Ikhlas", "An-Nasr"], correct: 1, badge: "Unique Surah", points: 2 },
    { id: "hard_9", question: "What is the shortest complete Surah?", options: ["Al-Asr", "Al-Kawthar", "Al-Ikhlas", "An-Nasr"], correct: 1, badge: "Shortest Surah", points: 2 },
    { id: "hard_10", question: "How many times is the word 'Allah' mentioned in the Quran?", options: ["1000", "2000", "2699", "3000"], correct: 2, badge: "Allah Counter", points: 2 },
    { id: "hard_11", question: "Which Surah mentions two Prophets with the same name in different stories?", options: ["Al-Baqarah", "Maryam", "Al-Anbiya", "Yusuf"], correct: 1, badge: "Prophet Stories", points: 2 }
  ]
};

const shuffleOptions = (options, correctIndex) => {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.indexOf(correctAnswer);
  return { shuffled, newCorrectIndex };
};

export default function QuranQuestGame({ onComplete }) {
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const difficulties = [
    { id: "easy", name: "Easy", icon: "🌱", color: "from-green-500 to-green-600", description: "4 questions", count: 4 },
    { id: "medium", name: "Medium", icon: "⚡", color: "from-yellow-500 to-orange-500", description: "4 questions", count: 4 },
    { id: "hard", name: "Hard", icon: "🔥", color: "from-red-500 to-red-600", description: "4 questions", count: 4 }
  ];

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (difficulty && user) {
      loadUserProgress();
    }
  }, [difficulty, user]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length) {
      const question = questions[currentQuestion];
      const { shuffled, newCorrectIndex } = shuffleOptions(question.options, question.correct);
      setShuffledOptions(shuffled);
      setCorrectIndex(newCorrectIndex);
    }
  }, [currentQuestion, questions]);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      console.log("User not authenticated");
      setUser(null); // Ensure user is null if not authenticated
    }
  };

  const loadUserProgress = async () => {
    if (!user) return;
    try {
      const progressList = await base44.entities.UserGameProgress.filter({
        user_id: user.id,
        game_type: "quran_quest"
      });

      let progress = progressList[0];
      if (!progress) {
        progress = await base44.entities.UserGameProgress.create({
          user_id: user.id,
          game_type: "quran_quest",
          completed_questions: [],
          highest_difficulty: "easy", // Default to easy
          total_games_played: 0,
          best_score: 0
        });
      }
      setUserProgress(progress);
      selectQuestions(progress.completed_questions || []);
    } catch (error) {
      console.error("Error loading progress:", error);
      selectQuestions([]); // Proceed without user progress if error
    }
  };

  const selectQuestions = (completedQuestions) => {
    const availableQuestions = allQuranQuestions[difficulty];
    if (!availableQuestions) {
        console.error("Invalid difficulty selected:", difficulty);
        setQuestions([]);
        return;
    }
    
    let unseenQuestions = availableQuestions.filter(q => !completedQuestions.includes(q.id));
    
    // If all questions for this difficulty have been seen, reset and use all of them
    if (unseenQuestions.length === 0) {
      unseenQuestions = [...availableQuestions];
    }
    
    // IMPORTANT: Multiple shuffles for better randomization
    for (let i = 0; i < 3; i++) {
      unseenQuestions = unseenQuestions.sort(() => Math.random() - 0.5);
    }
    
    // Limit to a reasonable number if needed, e.g., the original `count` in difficulty config
    const diffConfig = difficulties.find(d => d.id === difficulty);
    const finalQuestions = unseenQuestions.slice(0, diffConfig?.count || availableQuestions.length);

    setQuestions(finalQuestions);
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const question = questions[currentQuestion];
    if (answerIndex === correctIndex) {
      setScore(score + question.points);
      // Only add unique badges
      if (!earnedBadges.includes(question.badge)) {
        setEarnedBadges([...earnedBadges, question.badge]);
      }
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        completeGame();
      }
    }, 2000);
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user && userProgress) {
      try {
        const completedQuestionIds = questions.map(q => q.id);
        const updatedCompletedQuestions = Array.from(new Set([
          ...(userProgress.completed_questions || []),
          ...completedQuestionIds
        ]));

        await base44.entities.UserGameProgress.update(userProgress.id, {
          completed_questions: updatedCompletedQuestions,
          highest_difficulty: difficulty, // This might need more complex logic if we track highest ever achieved
          total_games_played: (userProgress.total_games_played || 0) + 1,
          best_score: Math.max(score, userProgress.best_score || 0)
        });

        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "quran_quest",
          score: score,
          completed: true
        });
        
        await base44.auth.updateMe({
          points: (user.points || 0) + score
        });
      } catch (error) {
        console.error("Error saving game score or updating user points:", error);
      }
    }
    
    onComplete(score);
  };

  if (!difficulty) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8">
          <CardTitle className="text-3xl text-center">Choose Your Level</CardTitle>
          <p className="text-center mt-2 text-green-100">Select difficulty to start Quran Quest!</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {difficulties.map((diff, index) => (
              <motion.div
                key={diff.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setDifficulty(diff.id)}
                  className={`w-full p-8 rounded-2xl bg-gradient-to-br ${diff.color} text-white shadow-xl hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="text-6xl mb-4">{diff.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{diff.name}</h3>
                  <p className="text-sm opacity-90">{diff.description}</p>
                </button>
              </motion.div>
            ))}
          </div>
          
          {userProgress && userProgress.total_games_played > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 bg-green-50 rounded-xl p-6 text-center"
            >
              <p className="text-gray-700 mb-2">
                <Star className="w-5 h-5 inline text-amber-500" /> Your Stats:
              </p>
              <p className="text-sm text-gray-600">
                Games Played: {userProgress.total_games_played} • Best Score: {userProgress.best_score} • 
                Questions Seen: {userProgress.completed_questions ? userProgress.completed_questions.length : 0}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (gameCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Book className="w-24 h-24 mx-auto mb-6 text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Masha'Allah! 📖
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              You earned <span className="font-bold text-green-600">{score} points!</span>
            </p>
            <p className="text-gray-500 mb-6">Badges Earned: {earnedBadges.length}</p>
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                Difficulty: <span className="font-bold capitalize">{difficulty}</span>
              </p>
              <p className="text-sm text-gray-700">
                Questions Answered: {questions.length}
              </p>
            </div>
            <div className="space-y-2 mb-6">
              {earnedBadges.map((badge, index) => (
                <Badge key={index} className="bg-green-500 text-white mr-2">
                  ⭐ {badge}
                </Badge>
              ))}
            </div>
            <Button
              onClick={() => {
                setDifficulty(null);
                setCurrentQuestion(0);
                setScore(0);
                setGameCompleted(false);
                setSelectedAnswer(null);
                setShowResult(false);
                setEarnedBadges([]);
                setQuestions([]); // Clear questions for next game
                setUserProgress(null); // Reload user progress to get latest state
              }}
              className="bg-gradient-to-r from-green-500 to-teal-500"
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading questions...</p>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const diffConfig = difficulties.find(d => d.id === difficulty);

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Book className="w-6 h-6" />
            Qur'an Quest
          </CardTitle>
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-white">{score} pts</span>
          </div>
        </div>
        <div className="bg-white text-gray-900 p-3 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 mb-4 shadow-lg">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span>Monthly Prize Competition! Top scores win!</span>
        </div>
        <p className="text-sm text-white">Question {currentQuestion + 1} of {questions.length} • {diffConfig.name} Mode</p>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-4 md:mb-6 px-2">
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 leading-snug">
                {question.question}
              </h3>
              <Badge className="bg-green-100 text-green-800 text-xs md:text-sm">
                Earn Badge: {question.badge}
              </Badge>
            </div>
            
            <div className="grid gap-2 md:gap-4">
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
                    className={`h-auto py-3 md:py-4 px-3 md:px-4 text-sm md:text-lg justify-start transition-all duration-300 ${
                      showCorrect
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : showWrong
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white hover:bg-green-50 text-gray-900 border-2"
                    }`}
                    variant={showResult ? "default" : "outline"}
                  >
                    <span className="flex-1 text-left leading-snug break-words">{option}</span>
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
