
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";

const allJourneyStages = {
  easy: [
    {
      id: "easy_childhood",
      stage: "Childhood",
      emoji: "👶",
      question: "Where was Prophet Muhammad ﷺ born?",
      options: ["Makkah", "Madinah", "Egypt", "Syria"],
      correct: 0,
      story: "Prophet Muhammad ﷺ was born in Makkah in the year 570 CE. He was known for his honesty even as a child.",
      points: 2
    },
    {
      id: "easy_youth",
      stage: "Youth",
      emoji: "🌟",
      question: "What title was Prophet Muhammad ﷺ known by?",
      options: ["Al-Amin", "Al-Hakim", "Al-Rashid", "Al-Karim"],
      correct: 0,
      story: "He was known as 'Al-Amin' (The Trustworthy) because of his honesty and good character.",
      points: 2
    },
    {
      id: "easy_marriage",
      stage: "Marriage",
      emoji: "💍",
      question: "Who was the first wife of Prophet Muhammad ﷺ?",
      options: ["Aisha", "Khadijah", "Fatimah", "Hafsa"],
      correct: 1,
      story: "Khadijah (RA) was a wealthy merchant who married the Prophet ﷺ. She was his first wife and supporter.",
      points: 2
    },
    {
      id: "easy_revelation",
      stage: "First Revelation",
      emoji: "📖",
      question: "Where did Prophet Muhammad ﷺ receive the first revelation?",
      options: ["Masjid", "Cave of Hira", "His home", "Market"],
      correct: 1,
      story: "The first revelation came to him in the Cave of Hira where he used to meditate.",
      points: 2
    },
    {
      id: "easy_orphan",
      stage: "Early Life",
      emoji: "🌙",
      question: "Who raised Prophet Muhammad ﷺ after his mother passed away?",
      options: ["His father", "His grandfather", "Abu Bakr", "Umar"],
      correct: 1,
      story: "His grandfather Abdul Muttalib and later his uncle Abu Talib raised him with love and care.",
      points: 2
    },
    {
      id: "easy_honest",
      stage: "Character",
      emoji: "⭐",
      question: "What was the Prophet ﷺ famous for even before Islam?",
      options: ["Being rich", "Being honest and trustworthy", "Being a king", "Being strong"],
      correct: 1,
      story: "Even before prophethood, everyone trusted him and called him 'The Trustworthy One'.",
      points: 2
    }
  ],
  medium: [
    {
      id: "medium_prophethood",
      stage: "Prophethood",
      emoji: "📖",
      question: "How old was the Prophet ﷺ when he received the first revelation?",
      options: ["30 years", "35 years", "40 years", "45 years"],
      correct: 2,
      story: "At age 40, Angel Jibreel brought the first revelation in the cave of Hira.",
      points: 2
    },
    {
      id: "medium_persecution",
      stage: "Persecution",
      emoji: "😢",
      question: "Which uncle protected the Prophet ﷺ during early persecution?",
      options: ["Abu Lahab", "Abu Talib", "Abbas", "Hamza"],
      correct: 1,
      story: "Abu Talib, though not Muslim, protected his nephew from the Quraysh persecution.",
      points: 2
    },
    {
      id: "medium_hijrah",
      stage: "Hijrah",
      emoji: "🐪",
      question: "Where did the Prophet ﷺ migrate to?",
      options: ["Syria", "Egypt", "Madinah", "Yemen"],
      correct: 2,
      story: "The Hijrah (migration) to Madinah marked the beginning of the Islamic calendar.",
      points: 2
    },
    {
      id: "medium_companion",
      stage: "The Companion",
      emoji: "🤝",
      question: "Who accompanied the Prophet ﷺ during Hijrah?",
      options: ["Abu Bakr", "Umar", "Uthman", "Ali"],
      correct: 0,
      story: "Abu Bakr (RA) was the loyal companion who traveled with the Prophet ﷺ during the dangerous migration.",
      points: 2
    },
    {
      id: "medium_taif",
      stage: "Visit to Taif",
      emoji: "🌆",
      question: "What happened when the Prophet ﷺ went to Taif?",
      options: ["They accepted Islam", "They threw stones at him", "They gave him gifts", "They ignored him"],
      correct: 1,
      story: "The people of Taif rejected him and threw stones, but he prayed for their guidance instead of punishment.",
      points: 2
    },
    {
      id: "medium_cave",
      stage: "Cave of Thawr",
      emoji: "🕊️",
      question: "What protected the Prophet ﷺ in the Cave of Thawr?",
      options: ["A spider's web and bird's nest", "A large rock", "An army", "A river"],
      correct: 0,
      story: "Allah sent a spider to spin a web and a bird to build a nest at the cave entrance, making it look abandoned.",
      points: 2
    }
  ],
  hard: [
    {
      id: "hard_madinah",
      stage: "Madinah",
      emoji: "🕌",
      question: "What did the Prophet ﷺ build first in Madinah?",
      options: ["Palace", "Masjid", "School", "Market"],
      correct: 1,
      story: "The Prophet ﷺ built Masjid Nabawi and established a community based on faith and brotherhood.",
      points: 2
    },
    {
      id: "hard_treaty",
      stage: "Treaty of Hudaybiyyah",
      emoji: "📜",
      question: "The Treaty of Hudaybiyyah was signed with which tribe?",
      options: ["Aws", "Khazraj", "Quraysh", "Thaqif"],
      correct: 2,
      story: "This treaty was called a 'clear victory' by Allah, leading to the peaceful conquest of Makkah.",
      points: 2
    },
    {
      id: "hard_conquest",
      stage: "Conquest of Makkah",
      emoji: "⚔️",
      question: "In which year was Makkah conquered?",
      options: ["6 AH", "7 AH", "8 AH", "9 AH"],
      correct: 2,
      story: "In 8 AH, the Prophet ﷺ peacefully conquered Makkah with 10,000 companions, showing mercy to all.",
      points: 2
    },
    {
      id: "hard_farewell",
      stage: "Farewell Sermon",
      emoji: "🗣️",
      question: "Where did the Prophet ﷺ deliver his farewell sermon?",
      options: ["Makkah", "Madinah", "Mount Arafat", "Taif"],
      correct: 2,
      story: "On Mount Arafat during his last Hajj, he delivered powerful messages about equality and rights.",
      points: 2
    },
    {
      id: "hard_badr",
      stage: "Battle of Badr",
      emoji: "⚔️",
      question: "How many Muslims fought in the Battle of Badr?",
      options: ["100", "313", "500", "1000"],
      correct: 1,
      story: "With only 313 Muslims against 1000 enemies, Allah gave them victory through faith and courage.",
      points: 2
    },
    {
      id: "hard_isra",
      stage: "Night Journey",
      emoji: "🌙",
      question: "During Isra and Mi'raj, how many daily prayers were prescribed?",
      options: ["3", "5", "7", "10"],
      correct: 1,
      story: "Initially 50 prayers were prescribed, but through the Prophet's requests, Allah reduced it to 5 with the reward of 50.",
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

export default function SeerahAdventureGame({ onComplete }) {
  const [difficulty, setDifficulty] = useState(null);
  const [journeyStages, setJourneyStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const difficulties = [
    { id: "easy", name: "Easy", icon: "🌱", color: "from-green-500 to-green-600", description: "Early Life", count: 4 },
    { id: "medium", name: "Medium", icon: "⚡", color: "from-yellow-500 to-orange-500", description: "Prophethood", count: 4 },
    { id: "hard", name: "Hard", icon: "🔥", color: "from-red-500 to-red-600", description: "Later Years", count: 4 }
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
    if (journeyStages.length > 0 && currentStage < journeyStages.length) {
      const stage = journeyStages[currentStage];
      const { shuffled, newCorrectIndex } = shuffleOptions(stage.options, stage.correct);
      setShuffledOptions(shuffled);
      setCorrectIndex(newCorrectIndex);
    }
  }, [currentStage, journeyStages]);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      console.log("User not authenticated or error loading user:", error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const progressList = await base44.entities.UserGameProgress.filter({
        user_id: user.id,
        game_type: "seerah"
      });

      let progress = progressList[0];
      if (!progress) {
        progress = await base44.entities.UserGameProgress.create({
          user_id: user.id,
          game_type: "seerah",
          completed_questions: [],
          highest_difficulty: "easy",
          total_games_played: 0,
          best_score: 0
        });
      }
      setUserProgress(progress);
      selectStages(progress.completed_questions || []);
    } catch (error) {
      console.error("Error loading progress:", error);
      // Fallback to empty completed questions if progress loading fails
      selectStages([]);
    }
  };

  const selectStages = (completedQuestions) => {
    const availableStagesForDifficulty = allJourneyStages[difficulty];
    
    // Filter out completed stages
    let unseenStages = availableStagesForDifficulty.filter(stage => !completedQuestions.includes(stage.id));
    
    // If all stages for this difficulty have been seen, reset to all stages for this difficulty
    if (unseenStages.length === 0) {
      unseenStages = [...availableStagesForDifficulty];
    }
    
    // Shuffle the unseen stages multiple times for better randomization
    for (let i = 0; i < 3; i++) { // Shuffling 3 times
      unseenStages = unseenStages.sort(() => Math.random() - 0.5);
    }
    
    // Take a subset if the total count of stages for this difficulty is set in the `difficulties` array
    const diffConfig = difficulties.find(d => d.id === difficulty);
    const stagesToSelectCount = diffConfig ? diffConfig.count : 4; // Default to 4 if not found
    
    setJourneyStages(unseenStages.slice(0, stagesToSelectCount));
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === correctIndex) {
      setScore(score + journeyStages[currentStage].points);
    }

    setTimeout(() => {
      setShowStory(true);
    }, 1000);
  };

  const handleContinue = () => {
    if (currentStage < journeyStages.length - 1) {
      setCurrentStage(currentStage + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowStory(false);
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    setGameCompleted(true);
    
    if (user && userProgress) {
      try {
        const completedStageIds = journeyStages.map(s => s.id);
        const updatedCompletedQuestions = [
          ...new Set([...(userProgress.completed_questions || []), ...completedStageIds])
        ]; // Use Set to avoid duplicates

        // Determine highest difficulty
        const currentDifficultyIndex = difficulties.findIndex(d => d.id === difficulty);
        const highestDifficultyIndex = difficulties.findIndex(d => d.id === userProgress.highest_difficulty);
        const newHighestDifficulty = currentDifficultyIndex > highestDifficultyIndex ? difficulty : userProgress.highest_difficulty;

        await base44.entities.UserGameProgress.update(userProgress.id, {
          completed_questions: updatedCompletedQuestions,
          highest_difficulty: newHighestDifficulty,
          total_games_played: (userProgress.total_games_played || 0) + 1,
          best_score: Math.max(score, userProgress.best_score || 0)
        });

        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "seerah",
          score: score,
          completed: true,
          difficulty: difficulty,
          stages_count: journeyStages.length
        });
        
        await base44.auth.updateMe({
          points: (user.points || 0) + score
        });
      } catch (error) {
        console.error("Error saving game score or updating user progress:", error);
      }
    }
    
    onComplete(score);
  };

  if (!difficulty) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
          <CardTitle className="text-3xl text-center">Choose Your Journey</CardTitle>
          <p className="text-center mt-2 text-blue-100">Select a difficulty level to begin the Seerah adventure!</p>
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
                  <p className="text-xs mt-2 opacity-75">{diff.count} stages</p>
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
                <Star className="w-5 h-5 inline text-amber-500 mr-1" /> Your Progress:
              </p>
              <p className="text-sm text-gray-600">
                Games Played: <span className="font-semibold">{userProgress.total_games_played}</span> • 
                Best Score: <span className="font-semibold">{userProgress.best_score}</span> • 
                Highest Difficulty: <span className="font-semibold capitalize">{userProgress.highest_difficulty}</span>
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
            <p className="text-xl text-gray-600 mb-4">
              You completed the Seerah journey!
            </p>
            <p className="text-2xl font-bold text-amber-600 mb-6">
              {score} points earned!
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                Difficulty: <span className="font-bold capitalize">{difficulty}</span>
              </p>
              <p className="text-sm text-gray-700">
                Stages Completed: <span className="font-bold">{journeyStages.length}</span>
              </p>
            </div>
            <Button
              onClick={() => {
                setDifficulty(null); // Go back to difficulty selection
                setCurrentStage(0);
                setScore(0);
                setGameCompleted(false);
                setSelectedAnswer(null);
                setShowResult(false);
                setShowStory(false);
                setJourneyStages([]); // Clear stages for new game
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

  if (!user || !userProgress || journeyStages.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading journey...</p>
        </CardContent>
      </Card>
    );
  }

  const stage = journeyStages[currentStage];
  const progress = ((currentStage + 1) / journeyStages.length) * 100;
  const diffConfig = difficulties.find(d => d.id === difficulty);

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">{stage.emoji}</span>
            Seerah Adventure
          </CardTitle>
          <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
            <Star className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-white">{score} pts</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2 text-white">
            <span>{stage.stage}</span>
            <span>Stage {currentStage + 1} of {journeyStages.length} • {diffConfig.name}</span>
          </div>
          <Progress value={progress} className="bg-white/30" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        {!showStory ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id} // Use stage.id as key for animation
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-4 md:mb-6 flex items-start gap-2 md:gap-3 px-2">
                <MapPin className="w-5 md:w-6 h-5 md:h-6 text-blue-600 flex-shrink-0 mt-1" />
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug">
                  {stage.question}
                </h3>
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-2"
          >
            <div className="text-5xl md:text-6xl mb-4 md:mb-6">{stage.emoji}</div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-600 mb-3 md:mb-4">{stage.stage}</h3>
            <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">{stage.story}</p>
            </div>
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 w-full md:w-auto"
            >
              {currentStage < journeyStages.length - 1 ? "Continue Journey" : "Complete"}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
