
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const prophetStories = [
  {
    prophet: "Prophet Nuh (AS)",
    emoji: "🚢",
    storyParts: [
      "Prophet Nuh called people to worship Allah for 950 years",
      "People didn't listen and made fun of him",
      "Allah told him to build a big ark (ship)",
      "The great flood came and the ark saved the believers"
    ],
    moral: "Always be patient and trust in Allah, even if it takes a long time.",
    quiz: {
      question: "How long did Prophet Nuh call people to Islam?",
      options: ["100 years", "500 years", "950 years", "1000 years"],
      correct: 2
    },
    points: 2
  },
  {
    prophet: "Prophet Ibrahim (AS)",
    emoji: "🔥",
    storyParts: [
      "Prophet Ibrahim broke the idols to show people they had no power",
      "The king ordered him to be thrown into a huge fire",
      "Allah commanded the fire: 'Be cool and safe for Ibrahim!'",
      "The fire didn't hurt him at all - it was a miracle!"
    ],
    moral: "When you trust in Allah, He will protect you from all harm.",
    quiz: {
      question: "What happened to Prophet Ibrahim in the fire?",
      options: [
        "He got burned",
        "He escaped",
        "Allah made the fire cool and safe",
        "People saved him"
      ],
      correct: 2
    },
    points: 2
  },
  {
    prophet: "Prophet Yusuf (AS)",
    emoji: "👑",
    storyParts: [
      "Prophet Yusuf's brothers were jealous of him",
      "They threw him in a well, but he was rescued",
      "He was sold as a slave but stayed patient and good",
      "Years later, he became the minister of Egypt and forgave his brothers"
    ],
    moral: "Patience, forgiveness, and good character lead to success.",
    quiz: {
      question: "What did Prophet Yusuf do when he met his brothers again?",
      options: ["Punished them", "Forgave them", "Ignored them", "Sent them away"],
      correct: 1
    },
    points: 2
  },
  {
    prophet: "Prophet Musa (AS)",
    emoji: "⚡",
    storyParts: [
      "Prophet Musa was saved as a baby from Pharaoh's cruel orders",
      "Allah chose him to be a Prophet and speak to Pharaoh",
      "Pharaoh refused to free the slaves",
      "Allah parted the Red Sea for Musa and the believers to escape"
    ],
    moral: "Allah helps those who stand up for what is right.",
    quiz: {
      question: "What miracle did Allah show through Prophet Musa?",
      options: ["Made rain", "Parted the sea", "Moved mountains", "Created trees"],
      correct: 1
    },
    points: 2
  }
];

const shuffleOptions = (options, correctIndex) => {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.indexOf(correctAnswer);
  return { shuffled, newCorrectIndex };
};

export default function ProphetStoriesGame({ onComplete }) {
  const [currentStory, setCurrentStory] = useState(0);
  const [storyStep, setStoryStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
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
    // Shuffle options when showing quiz for a new story
    if (showQuiz) {
      const story = prophetStories[currentStory];
      const { shuffled, newCorrectIndex } = shuffleOptions(story.quiz.options, story.quiz.correct);
      setShuffledOptions(shuffled);
      setCorrectIndex(newCorrectIndex);
    }
  }, [showQuiz, currentStory]); // Depend on showQuiz and currentStory to re-shuffle for each new quiz

  const handleContinueStory = () => {
    const story = prophetStories[currentStory];
    if (storyStep < story.storyParts.length - 1) {
      setStoryStep(storyStep + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const story = prophetStories[currentStory];
    
    // Use the `correctIndex` from the shuffled options
    if (answerIndex === correctIndex) {
      setScore(score + story.points);
    }

    setTimeout(() => {
      if (currentStory < prophetStories.length - 1) {
        setCurrentStory(currentStory + 1);
        setStoryStep(0);
        setShowQuiz(false);
        setSelectedAnswer(null);
        // shuffledOptions and correctIndex will be updated by the useEffect for the new story
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
          game_type: "prophet_stories",
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
        <Card className="max-w-md mx-auto border-2 border-amber-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Amazing! 🌟
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You earned <span className="font-bold text-amber-600">{score} points!</span>
            </p>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                You've learned wonderful stories of the Prophets. These stories teach us important lessons!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const story = prophetStories[currentStory];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg p-4 mb-6 text-center shadow-md flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-2xl"
      >
        <Trophy className="w-6 h-6 text-yellow-300 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row items-center sm:gap-2">
            <p className="font-semibold text-lg">Monthly Prize Competition!</p>
            <p className="text-sm text-indigo-100">(Top scorer wins a prize!)</p>
        </div>
      </motion.div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-3xl">{story.emoji}</span>
              Prophet Stories
            </CardTitle>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-amber-300" />
              <span className="font-bold">{score} pts</span>
            </div>
          </div>
          <p className="text-sm mt-2">Story {currentStory + 1} of {prophetStories.length}</p>
        </CardHeader>
        
        <CardContent className="p-4 md:p-8">
          {!showQuiz ? (
            <motion.div
              key={`${currentStory}-${storyStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{story.prophet}</h3>
                <Badge className="bg-amber-100 text-amber-800 text-xs md:text-sm">
                  Part {storyStep + 1} of {story.storyParts.length}
                </Badge>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 md:p-8 mb-4 md:mb-6 min-h-[180px] md:min-h-[200px] flex items-center justify-center">
                <p className="text-base md:text-xl text-gray-800 leading-relaxed text-center">
                  {story.storyParts[storyStep]}
                </p>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={handleContinueStory}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 w-full md:w-auto"
                >
                  {storyStep < story.storyParts.length - 1 ? "Continue Story" : "Take Quiz"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 md:mb-6 px-2">
                <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                  <h4 className="font-bold text-blue-900 mb-2 text-sm md:text-base">Moral of the Story:</h4>
                  <p className="text-gray-700 text-sm md:text-base">{story.moral}</p>
                </div>
                
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 leading-snug">
                  {story.quiz.question}
                </h4>
              </div>
              
              <div className="grid gap-2 md:gap-3">
                {shuffledOptions.map((option, index) => { // Use shuffledOptions here
                  const isCorrect = index === correctIndex; // Compare with the new correctIndex
                  const isSelected = index === selectedAnswer;
                  const showCorrect = selectedAnswer !== null && isCorrect;
                  const showWrong = selectedAnswer !== null && isSelected && !isCorrect;
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => selectedAnswer === null && handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`h-auto py-3 md:py-4 px-3 md:px-4 text-sm md:text-lg justify-start transition-all duration-300 ${
                        showCorrect
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : showWrong
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-white hover:bg-amber-50 text-gray-900 border-2"
                      }`}
                      variant={selectedAnswer !== null ? "default" : "outline"}
                    >
                      <span className="flex-1 text-left leading-snug break-words">{option}</span>
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
