
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, Heart, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Expanded question bank with MORE questions
const allQuestions = {
  easy: [
    {
      id: "easy_1",
      question: "How many pillars of Islam are there?",
      options: ["3", "4", "5", "6"],
      correct: 2,
      points: 2
    },
    {
      id: "easy_2",
      question: "What is the first pillar of Islam?",
      options: ["Salah", "Shahada", "Zakat", "Hajj"],
      correct: 1,
      points: 2
    },
    {
      id: "easy_3",
      question: "In which month do Muslims fast?",
      options: ["Rajab", "Ramadan", "Shawwal", "Muharram"],
      correct: 1,
      points: 2
    },
    {
      id: "easy_4",
      question: "How many times do Muslims pray each day?",
      options: ["3", "4", "5", "6"],
      correct: 2,
      points: 2
    },
    {
      id: "easy_5",
      question: "What is the holy book of Islam?",
      options: ["Torah", "Bible", "Quran", "Psalms"],
      correct: 2,
      points: 2
    },
    {
      id: "easy_6",
      question: "Which city is home to the Kaaba?",
      options: ["Medina", "Jerusalem", "Mecca", "Damascus"],
      correct: 2,
      points: 2
    },
    {
      id: "easy_7",
      question: "What color is often associated with Islam?",
      options: ["Red", "Blue", "Green", "Yellow"],
      correct: 2,
      points: 2
    },
    {
      id: "easy_8",
      question: "What do Muslims say before starting something?",
      options: ["Alhamdulillah", "Bismillah", "Masha'Allah", "Insha'Allah"],
      correct: 1,
      points: 2
    },
    {
      id: "easy_9",
      question: "What is the name of the Islamic month of fasting?",
      options: ["Shawwal", "Ramadan", "Dhul Hijjah", "Rajab"],
      correct: 1,
      points: 2
    },
    {
      id: "easy_10",
      question: "What do Muslims say when they hear good news?",
      options: ["Subhanallah", "Alhamdulillah", "Allahu Akbar", "Masha'Allah"],
      correct: 1,
      points: 2
    },
    {
      id: "easy_11",
      question: "Which direction do Muslims face when praying?",
      options: ["North", "Towards the Kaaba", "East", "West"],
      correct: 1,
      points: 2
    },
    {
      id: "easy_12",
      question: "What is the Islamic greeting?",
      options: ["Hello", "As-salamu alaikum", "Good morning", "Hi"],
      correct: 1,
      points: 2
    },
    {
      id: "easy_13",
      question: "What is Zakat?",
      options: ["Prayer", "Fasting", "Charity", "Pilgrimage"],
      correct: 2,
      points: 2
    },
    {
      id: "easy_14",
      question: "What is the night prayer called?",
      options: ["Fajr", "Maghrib", "Isha", "Dhuhr"],
      correct: 2,
      points: 2
    },
    {
      id: "easy_15",
      question: "How many rakats are in Fajr prayer?",
      options: ["2", "3", "4", "5"],
      correct: 0,
      points: 2
    }
  ],
  medium: [
    {
      id: "medium_1",
      question: "Who is considered the last prophet in Islam?",
      options: ["Musa (Moses)", "Isa (Jesus)", "Muhammad ﷺ", "Ibrahim (Abraham)"],
      correct: 2,
      points: 2
    },
    {
      id: "medium_2",
      question: "What is the name of the pilgrimage to Mecca?",
      options: ["Umrah", "Zakat", "Hajj", "Eid"],
      correct: 2,
      points: 2
    },
    {
      id: "medium_3",
      question: "What is the Arabic term for 'God is Great'?",
      options: ["Alhamdulillah", "Subhanallah", "Allahu Akbar", "Insha'Allah"],
      correct: 2,
      points: 2
    },
    {
      id: "medium_4",
      question: "How many Surahs are in the Quran?",
      options: ["100", "114", "120", "99"],
      correct: 1,
      points: 2
    },
    {
      id: "medium_5",
      question: "What is the night journey of Prophet Muhammad ﷺ called?",
      options: ["Hijrah", "Isra and Mi'raj", "Badr", "Uhud"],
      correct: 1,
      points: 2
    },
    {
      id: "medium_6",
      question: "Which angel brought revelations to Prophet Muhammad ﷺ?",
      options: ["Mikail", "Israfil", "Jibreel (Gabriel)", "Azrael"],
      correct: 2,
      points: 2
    },
    {
      id: "medium_7",
      question: "What is the first Surah in the Quran?",
      options: ["Al-Baqarah", "Al-Fatiha", "Al-Ikhlas", "An-Nas"],
      correct: 1,
      points: 2
    },
    {
      id: "medium_8",
      question: "What is the name of the holy month of Hajj?",
      options: ["Ramadan", "Shawwal", "Dhul Hijjah", "Muharram"],
      correct: 2,
      points: 2
    },
    {
      id: "medium_9",
      question: "What does 'Insha'Allah' mean?",
      options: ["God willing", "Thank God", "God is great", "Praise God"],
      correct: 0,
      points: 2
    },
    {
      id: "medium_10",
      question: "Which prayer is performed before sunrise?",
      options: ["Fajr", "Dhuhr", "Asr", "Maghrib"],
      correct: 0,
      points: 2
    },
    {
      id: "medium_11",
      question: "What is the reward for fasting during Ramadan?",
      options: ["Money", "Forgiveness of sins", "Food", "Gifts"],
      correct: 1,
      points: 2
    },
    {
      id: "medium_12",
      question: "What is Laylat al-Qadr?",
      options: ["Night of Power", "Day of Arafah", "Eid night", "Friday night"],
      correct: 0,
      points: 2
    },
    {
      id: "medium_13",
      question: "Who was the first person to accept Islam after the Prophet ﷺ?",
      options: ["Abu Bakr", "Umar", "Khadijah", "Ali"],
      correct: 2,
      points: 2
    },
    {
      id: "medium_14",
      question: "What is the meaning of 'Alhamdulillah'?",
      options: ["God is great", "All praise is for Allah", "God willing", "Peace be upon you"],
      correct: 1,
      points: 2
    },
    {
      id: "medium_15",
      question: "Which Surah is known as the 'Heart of the Quran'?",
      options: ["Al-Fatiha", "Yasin", "Al-Mulk", "Ar-Rahman"],
      correct: 1,
      points: 2
    }
  ],
  hard: [
    {
      id: "hard_1",
      question: "What is the literal meaning of 'Islam'?",
      options: ["Peace", "Submission to God", "Guidance", "Religion"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_2",
      question: "In which year did the Hijrah (migration to Medina) occur?",
      options: ["610 CE", "622 CE", "630 CE", "632 CE"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_3",
      question: "What is the longest Surah in the Quran?",
      options: ["Al-Fatiha", "Al-Baqarah", "Al-Imran", "An-Nisa"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_4",
      question: "How many Prophets are mentioned by name in the Quran?",
      options: ["25", "20", "30", "15"],
      correct: 0,
      points: 2
    },
    {
      id: "hard_5",
      question: "What is the last Surah revealed in the Quran?",
      options: ["Al-Fatiha", "An-Nasr", "Al-Ikhlas", "Al-Falaq"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_6",
      question: "Which Surah is called 'the heart of the Quran'?",
      options: ["Yasin", "Al-Mulk", "Ar-Rahman", "Al-Waqi'ah"],
      correct: 0,
      points: 2
    },
    {
      id: "hard_7",
      question: "How many years did the Quran take to be revealed?",
      options: ["10 years", "23 years", "30 years", "40 years"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_8",
      question: "What is the shortest Surah in the Quran?",
      options: ["Al-Ikhlas", "Al-Kawthar", "An-Nasr", "Al-Asr"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_9",
      question: "How many verses (ayat) are in the Quran?",
      options: ["6000", "6236", "7000", "5500"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_10",
      question: "Which Prophet could speak to animals?",
      options: ["Prophet Musa", "Prophet Sulaiman", "Prophet Ibrahim", "Prophet Nuh"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_11",
      question: "What is the name of the cave where the Quran was first revealed?",
      options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Badr"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_12",
      question: "How many times is Prophet Muhammad ﷺ mentioned by name in the Quran?",
      options: ["4", "5", "10", "25"],
      correct: 0,
      points: 2
    },
    {
      id: "hard_13",
      question: "What is the meaning of 'Tawhid'?",
      options: ["Prayer", "Oneness of Allah", "Charity", "Fasting"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_14",
      question: "Which battle is mentioned in Surah Al-Imran?",
      options: ["Badr", "Uhud", "Khandaq", "Hunayn"],
      correct: 1,
      points: 2
    },
    {
      id: "hard_15",
      question: "What is the name of the angel who will blow the trumpet on the Day of Judgment?",
      options: ["Jibreel", "Mikail", "Israfil", "Azrael"],
      correct: 2,
      points: 2
    }
  ]
};

const shuffleOptions = (options, correctIndex) => {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.indexOf(correctAnswer);
  return { shuffled, newCorrectIndex };
};

export default function TriviaGame({ onComplete }) {
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  const difficulties = [
    { id: "easy", name: "Easy", icon: "🌱", color: "from-green-500 to-green-600", description: "5 questions, 3 lives", lives: 3, count: 5 },
    { id: "medium", name: "Medium", icon: "⚡", color: "from-yellow-500 to-orange-500", description: "7 questions, 2 lives", lives: 2, count: 7 },
    { id: "hard", name: "Hard", icon: "🔥", color: "from-red-500 to-red-600", description: "10 questions, 1 life", lives: 1, count: 10 }
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
    }
  };

  const loadUserProgress = async () => {
    try {
      const progressList = await base44.entities.UserGameProgress.filter({
        user_id: user.id,
        game_type: "trivia"
      });

      let progress = progressList[0];
      if (!progress) {
        progress = await base44.entities.UserGameProgress.create({
          user_id: user.id,
          game_type: "trivia",
          completed_questions: [],
          highest_difficulty: "easy",
          total_games_played: 0,
          best_score: 0
        });
      }
      setUserProgress(progress);
      selectQuestions(progress.completed_questions || []);
    } catch (error) {
      console.error("Error loading progress:", error);
      selectQuestions([]);
    }
  };

  const selectQuestions = (completedQuestions) => {
    const diffConfig = difficulties.find(d => d.id === difficulty);
    const availableQuestions = allQuestions[difficulty];
    
    // Filter out recently completed questions
    let unseenQuestions = availableQuestions.filter(q => !completedQuestions.includes(q.id));
    
    // If not enough unseen questions, include some completed ones but shuffle well
    if (unseenQuestions.length < diffConfig.count) {
      unseenQuestions = [...availableQuestions];
    }
    
    // IMPORTANT: Shuffle multiple times for better randomization
    for (let i = 0; i < 3; i++) {
      unseenQuestions = unseenQuestions.sort(() => Math.random() - 0.5);
    }
    
    // Take random questions
    const selected = unseenQuestions.slice(0, diffConfig.count);
    
    setQuestions(selected);
    setLives(diffConfig.lives);
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const currentQuestionData = questions[currentQuestion];
    const isCorrect = answerIndex === correctIndex;
    
    if (isCorrect) {
      setScore(score + currentQuestionData.points);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setTimeout(() => {
          completeGame();
        }, 1500);
        return;
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
    }, 1500);
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user && userProgress) {
      try {
        // Mark questions as completed
        const completedQuestionIds = questions.map(q => q.id);
        const updatedCompletedQuestions = [
          ...(userProgress.completed_questions || []),
          ...completedQuestionIds
        ];

        // Update progress
        await base44.entities.UserGameProgress.update(userProgress.id, {
          completed_questions: updatedCompletedQuestions,
          highest_difficulty: difficulty,
          total_games_played: (userProgress.total_games_played || 0) + 1,
          best_score: Math.max(score, userProgress.best_score || 0)
        });

        // Save game score
        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "trivia",
          score: score,
          completed: true
        });
        
        // Update user points
        await base44.auth.updateMe({
          points: (user.points || 0) + score
        });
      } catch (error) {
        console.error("Error saving game score:", error);
      }
    }
    
    onComplete(score);
  };

  if (!difficulty) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
          <CardTitle className="text-3xl text-center">Choose Your Difficulty</CardTitle>
          <p className="text-center mt-2 text-blue-100">Select a level to start your Islamic trivia challenge!</p>
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
              className="mt-8 bg-blue-50 rounded-xl p-6 text-center"
            >
              <p className="text-gray-700 mb-2">
                <Star className="w-5 h-5 inline text-amber-500" /> Your Stats:
              </p>
              <p className="text-sm text-gray-600">
                Games Played: {userProgress.total_games_played} • Best Score: {userProgress.best_score} • 
                Questions Completed: {(userProgress.completed_questions || []).length}
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
        <Card className="max-w-md mx-auto border-2 border-amber-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Masha'Allah! 🎉
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You earned <span className="font-bold text-amber-600">{score} points!</span>
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                Difficulty: <span className="font-bold capitalize">{difficulty}</span>
              </p>
              <p className="text-sm text-gray-700">
                Questions Answered: {questions.length}
              </p>
            </div>
            <Button
              onClick={() => {
                setDifficulty(null);
                setCurrentQuestion(0);
                setScore(0);
                setGameCompleted(false);
                setSelectedAnswer(null);
                setShowResult(false);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
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
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const diffConfig = difficulties.find(d => d.id === difficulty);

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl">Islamic Trivia Quiz</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
              {[...Array(diffConfig.lives)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-5 h-5 ${i < lives ? 'text-red-300 fill-red-300' : 'text-white/40'}`} 
                />
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="font-bold text-white">{score} pts</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white text-gray-900 p-3 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 mb-4 shadow-lg">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span className="text-gray-900">Win a monthly prize! Top scores compete.</span>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2 text-white">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span className="capitalize">{difficulty} Mode</span>
          </div>
          <Progress value={progress} className="bg-white/30" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-base md:text-2xl font-bold text-gray-900 mb-4 md:mb-8 leading-snug px-2">
              {question.question}
            </h3>
            
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
                        : "bg-white hover:bg-blue-50 text-gray-900 border-2"
                    }`}
                    variant={showResult ? "default" : "outline"}
                  >
                    <span className="flex-1 text-left leading-snug break-words">{option}</span>
                    {showCorrect && <CheckCircle2 className="w-4 md:w-6 h-4 md:h-6 ml-2 flex-shrink-0" />}
                    {showWrong && <XCircle className="w-4 md:w-6 h-4 md:h-6 ml-2 flex-shrink-0" />}
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
