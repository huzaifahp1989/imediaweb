
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

const originalSahabahStories = [
  {
    sahabah: "Abu Bakr As-Siddiq (RA)",
    emoji: "⭐",
    storyParts: [
      "Abu Bakr was the Prophet Muhammad's ﷺ best friend and closest companion.",
      "When the Prophet ﷺ told people about Al-Isra wal Mi'raj, many didn't believe him.",
      "But Abu Bakr (RA) said immediately: 'If he said it, then it is true!'",
      "This is why he was called 'As-Siddiq' - The Truthful One."
    ],
    moral: "True friendship means believing in and being loyal to your friends, even when others doubt.",
    quiz: {
      question: "Why was Abu Bakr called 'As-Siddiq'?",
      options: [
        "Because he was rich",
        "Because he always believed the Prophet ﷺ",
        "Because he was strong",
        "Because he was the oldest"
      ],
      correct: 1
    },
    points: 2
  },
  {
    sahabah: "Umar ibn Al-Khattab (RA)",
    emoji: "⚡",
    storyParts: [
      "Umar (RA) was known for his incredible strength and bravery.",
      "When he became a Muslim, Islam became much stronger!",
      "As a Caliph, he would walk the streets at night to make sure everyone had what they needed.",
      "One night, he carried a bag of flour on his own shoulders to help a poor family."
    ],
    moral: "True strength includes being fair, humble, and helping others in need.",
    quiz: {
      question: "What did Umar (RA) do at night as a Caliph?",
      options: [
        "He would sleep",
        "He would check on his people to make sure they had what they needed",
        "He would count money",
        "He would practice fighting"
      ],
      correct: 1
    },
    points: 2
  },
  {
    sahabah: "Bilal ibn Rabah (RA)",
    emoji: "🎵",
    storyParts: [
      "Bilal (RA) was a slave with a beautiful, powerful voice.",
      "When he accepted Islam, his master tortured him under the hot sun.",
      "But Bilal would only say 'Ahad, Ahad!' - meaning 'One God, One God!'",
      "The Prophet ﷺ chose him to be the first person to call Muslims to prayer!"
    ],
    moral: "No matter where you come from, if you have faith and stay strong, Allah will honor you.",
    quiz: {
      question: "What did Bilal (RA) say when he was being tortured?",
      options: [
        "Please stop",
        "Ahad, Ahad (One God)",
        "I give up",
        "Help me"
      ],
      correct: 1
    },
    points: 2
  },
  {
    sahabah: "Khadijah bint Khuwaylid (RA)",
    emoji: "💎",
    storyParts: [
      "Khadijah (RA) was a successful businesswoman in Makkah.",
      "When the Prophet ﷺ received his first revelation, she comforted him.",
      "She was the very first person to believe in his message!",
      "She spent her wealth to help spread Islam and support the poor."
    ],
    moral: "Supporting your family and believing in them is one of the greatest acts of love.",
    quiz: {
      question: "Who was the first person to believe in Islam?",
      options: [
        "Abu Bakr (RA)",
        "Umar (RA)",
        "Khadijah (RA)",
        "Ali (RA)"
      ],
      correct: 2
    },
    points: 2
  },
  {
    sahabah: "Ali ibn Abi Talib (RA)",
    emoji: "🦁",
    storyParts: [
      "Ali (RA) was the cousin of Prophet Muhammad ﷺ and grew up in his house.",
      "When enemies planned to attack the Prophet ﷺ at night, Ali slept in his bed!",
      "This brave act helped the Prophet ﷺ escape safely to Madinah.",
      "Ali was not just brave in battle, but also very wise and knowledgeable."
    ],
    moral: "True courage means standing up for what is right and gaining knowledge.",
    quiz: {
      question: "What did Ali (RA) do to help the Prophet ﷺ escape?",
      options: [
        "He fought the enemies",
        "He slept in the Prophet's bed to trick the enemies",
        "He called for help",
        "He ran away"
      ],
      correct: 1
    },
    points: 2
  },
  {
    sahabah: "Uthman ibn Affan (RA)",
    emoji: "📜",
    storyParts: [
      "Uthman (RA) was known for his generosity and kindness.",
      "When Muslims needed water, he bought a well and made it free for everyone!",
      "He was so generous that he funded the entire army during hard times.",
      "He also compiled the Quran into one book so everyone could read it the same way."
    ],
    moral: "Being generous and helping others brings great rewards from Allah.",
    quiz: {
      question: "What did Uthman (RA) do with the well?",
      options: [
        "He kept it for himself",
        "He bought it and made it free for everyone",
        "He sold it",
        "He destroyed it"
      ],
      correct: 1
    },
    points: 2
  },
  {
    sahabah: "Fatimah bint Muhammad (RA)",
    emoji: "🌸",
    storyParts: [
      "Fatimah (RA) was the beloved daughter of Prophet Muhammad ﷺ.",
      "She worked hard at home, grinding grain until her hands had marks.",
      "The Prophet ﷺ taught her special words to say that were better than a servant.",
      "She was known for her patience, kindness, and strong faith."
    ],
    moral: "Hard work, patience, and remembering Allah are true treasures.",
    quiz: {
      question: "What did the Prophet ﷺ teach Fatimah instead of getting a servant?",
      options: [
        "To complain",
        "Special words to remember Allah",
        "To stop working",
        "To ask others for help"
      ],
      correct: 1
    },
    points: 2
  },
  {
    sahabah: "Sa'd ibn Abi Waqqas (RA)",
    emoji: "🏹",
    storyParts: [
      "Sa'd (RA) was one of the bravest companions and an expert archer.",
      "In the Battle of Uhud, the Prophet ﷺ gave him his own arrows!",
      "The Prophet ﷺ said: 'Shoot, Sa'd! May my mother and father be sacrificed for you!'",
      "He protected the Prophet ﷺ with incredible courage and skill."
    ],
    moral: "Courage and skill used to protect others is a noble quality.",
    quiz: {
      question: "What weapon was Sa'd (RA) famous for using?",
      options: [
        "Sword",
        "Bow and arrow",
        "Spear",
        "Shield"
      ],
      correct: 1
    },
    points: 2
  },
  {
    sahabah: "Aisha bint Abi Bakr (RA)",
    emoji: "📚",
    storyParts: [
      "Aisha (RA) was one of the most knowledgeable companions.",
      "She memorized and taught thousands of hadiths to people.",
      "Scholars would come from far away to learn from her wisdom.",
      "She was known as 'The Mother of Believers' and a great teacher."
    ],
    moral: "Knowledge is a treasure, and teaching others is a great deed.",
    quiz: {
      question: "What was Aisha (RA) famous for?",
      options: [
        "Being a warrior",
        "Her knowledge and teaching",
        "Her wealth",
        "Her cooking"
      ],
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

export default function SahabahStoriesGame({ onComplete }) {
  const [shuffledSahabahStories, setShuffledSahabahStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyStep, setStoryStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  // Load user data on component mount
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

  // Shuffle stories at game start
  useEffect(() => {
    const shuffled = [...originalSahabahStories].sort(() => Math.random() - 0.5);
    setShuffledSahabahStories(shuffled);
  }, []); // Empty dependency array means this runs once on mount

  // Shuffle quiz options when a quiz is shown
  useEffect(() => {
    if (showQuiz && shuffledSahabahStories.length > 0) {
      const story = shuffledSahabahStories[currentStoryIndex];
      const { shuffled, newCorrectIndex } = shuffleOptions(story.quiz.options, story.quiz.correct);
      setShuffledOptions(shuffled);
      setCorrectOptionIndex(newCorrectIndex);
    }
  }, [showQuiz, currentStoryIndex, shuffledSahabahStories]);

  const handleContinueStory = () => {
    const story = shuffledSahabahStories[currentStoryIndex];
    if (storyStep < story.storyParts.length - 1) {
      setStoryStep(storyStep + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const story = shuffledSahabahStories[currentStoryIndex];
    
    if (answerIndex === correctOptionIndex) {
      setScore(score + story.points);
    }

    setTimeout(() => {
      if (currentStoryIndex < shuffledSahabahStories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
        setStoryStep(0);
        setShowQuiz(false);
        setSelectedAnswer(null);
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
          game_type: "sahabah_stories",
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

  if (shuffledSahabahStories.length === 0) {
    return <div className="text-center text-lg mt-8">Loading stories...</div>;
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
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Masha'Allah! 🌟
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You earned <span className="font-bold text-amber-600">{score} points!</span>
            </p>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                You've learned about the brave companions of Prophet Muhammad ﷺ!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const story = shuffledSahabahStories[currentStoryIndex];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-lg p-3 md:p-4 mb-4 md:mb-6 text-center shadow-md flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 w-full max-w-2xl"
      >
        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row items-center sm:gap-2">
          <p className="font-semibold text-base md:text-lg">Monthly Prize Competition!</p>
          <p className="text-xs md:text-sm text-green-100">(Top scorer wins a prize!)</p>
        </div>
      </motion.div>

      <Card className="max-w-2xl mx-auto shadow-lg w-full">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <span className="text-2xl md:text-3xl">{story.emoji}</span>
              <span className="text-base md:text-xl">Sahabah Stories</span>
            </CardTitle>
            <div className="flex items-center gap-2 bg-white/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-300" />
              <span className="font-bold text-sm md:text-base">{score} pts</span>
            </div>
          </div>
          <p className="text-xs md:text-sm mt-2">Story {currentStoryIndex + 1} of {shuffledSahabahStories.length}</p>
        </CardHeader>
        
        <CardContent className="p-4 md:p-8">
          {!showQuiz ? (
            <motion.div
              key={`${currentStoryIndex}-${storyStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center mb-4 md:mb-6 px-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{story.sahabah}</h3>
                <Badge className="bg-green-100 text-green-800 text-xs md:text-sm">
                  Part {storyStep + 1} of {story.storyParts.length}
                </Badge>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 md:p-8 mb-4 md:mb-6 min-h-[180px] md:min-h-[200px] flex items-center justify-center">
                <p className="text-base md:text-xl text-gray-800 leading-relaxed text-center">
                  {story.storyParts[storyStep]}
                </p>
              </div>
              
              <div className="text-center">
                <Button
                  onClick={handleContinueStory}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-sm md:text-base w-full md:w-auto"
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
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed">{story.moral}</p>
                </div>
                
                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 leading-snug">
                  {story.quiz.question}
                </h4>
              </div>
              
              <div className="grid gap-2 md:gap-3">
                {shuffledOptions.map((option, index) => {
                  const isCorrect = index === correctOptionIndex;
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
                          : "bg-white hover:bg-green-50 text-gray-900 border-2"
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
