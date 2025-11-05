
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Input component is no longer used with the new puzzle types, so it's removed
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PropTypes from 'prop-types';

// Utility function to shuffle an array (for scrambling words)
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

// Updated puzzles array with a new type "scrambled_words_ordering"
const puzzles = [
  {
    id: 1,
    title: "Surah Al-Fatiha",
    emoji: "📖",
    type: "scrambled_words_ordering",
    ayah: "In the name of Allah, the Most Gracious, the Most Merciful",
    question: "Order the words to form the Ayah:",
    scrambledWords: ["name", "Allah", "Most", "Gracious", "Merciful", "the", "of", "In"],
    correctOrder: ["In", "the", "name", "of", "Allah", "the", "Most", "Gracious", "the", "Most", "Merciful"],
    explanation: "This is the opening verse of the Quran, known as Bismillah. We recite it before every Surah except one.",
    difficulty: "easy",
    points: 30
  },
  {
    id: 2,
    title: "Ayat al-Kursi",
    emoji: "🌟",
    type: "scrambled_words_ordering",
    ayah: "Allah - there is no deity except Him, the Ever-Living, the Sustainer",
    question: "Order the words to form the Ayah:",
    scrambledWords: ["Allah", "no", "deity", "except", "Him", "Ever-Living", "Sustainer", "there", "is", "the", "the", "-", ","], // Added '-' and ','
    correctOrder: ["Allah", "-", "there", "is", "no", "deity", "except", "Him", ",", "the", "Ever-Living", ",", "the", "Sustainer"], // Adjusted for punctuation
    explanation: "This is part of Ayat al-Kursi, one of the most powerful verses in the Quran. It's in Surah Al-Baqarah.",
    difficulty: "medium",
    points: 40
  },
  {
    id: 3,
    title: "Surah Al-Ikhlas",
    emoji: "🤍",
    type: "scrambled_words_ordering",
    ayah: "Say: He is Allah, the One",
    question: "Order the words to form the Ayah:",
    scrambledWords: ["Say", "He", "is", "Allah", "One", "the", ":", ","], // Added ':' and ','
    correctOrder: ["Say", ":", "He", "is", "Allah", ",", "the", "One"], // Adjusted for punctuation
    explanation: "Surah Al-Ikhlas teaches us about the Oneness of Allah (Tawhid). The Prophet ﷺ said it equals one-third of the Quran.",
    difficulty: "easy",
    points: 30
  },
  {
    id: 4,
    title: "Kaaba Direction",
    emoji: "🕋",
    type: "scrambled_words_ordering",
    ayah: "Turn your face toward the Sacred Mosque (in Makkah)",
    question: "Order the words to form the Ayah:",
    scrambledWords: ["Turn", "your", "face", "toward", "Sacred", "Mosque", "Makkah", "the", "in", "(", ")"], // Added '(' and ')'
    correctOrder: ["Turn", "your", "face", "toward", "the", "Sacred", "Mosque", "(", "in", "Makkah", ")"], // Adjusted for punctuation
    explanation: "Allah commanded Muslims to face the Kaaba in Makkah when praying. This is called the Qibla.",
    difficulty: "medium",
    points: 40
  },
  {
    id: 5,
    title: "Prayer Times",
    emoji: "🕌",
    type: "scrambled_words_ordering",
    ayah: "Establish prayer at the decline of the sun until the darkness of the night",
    question: "Order the words to form the Ayah:",
    scrambledWords: ["Establish", "prayer", "at", "decline", "sun", "until", "darkness", "night", "the", "of", "the", "the"],
    correctOrder: ["Establish", "prayer", "at", "the", "decline", "of", "the", "sun", "until", "the", "darkness", "of", "the", "night"],
    explanation: "This verse reminds us to pray at specific times throughout the day, from Dhuhr until Isha.",
    difficulty: "hard",
    points: 60
  },
  {
    id: 6,
    title: "The Best of Speech",
    emoji: "🗣️",
    type: "scrambled_words_ordering",
    ayah: "And who is better in speech than one who invites to Allah",
    question: "Order the words to form the Ayah:",
    scrambledWords: ["And", "who", "is", "better", "speech", "than", "one", "invites", "Allah", "in", "to"],
    correctOrder: ["And", "who", "is", "better", "in", "speech", "than", "one", "who", "invites", "to", "Allah"],
    explanation: "This verse teaches us that inviting people to Allah and doing good is the best form of speech.",
    difficulty: "medium",
    points: 40
  }
];

export default function AyatExplorer({ onComplete }) {
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  // `answer` and `selectedOption` states are no longer needed as old puzzle types are removed.
  // `orderedItems` state is also no longer needed, replaced by `orderedWords`.
  const [orderedWords, setOrderedWords] = useState([]); // State to hold the user's ordered words
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completedPuzzles, setCompletedPuzzles] = useState([]);
  const [user, setUser] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);

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

  const startPuzzle = (puzzle) => {
    setCurrentPuzzle(puzzle);
    setShowResult(false);
    setIsCorrect(false);

    // Initialize `orderedWords` by shuffling the scrambled words for the new puzzle type
    if (puzzle.type === "scrambled_words_ordering") {
      setOrderedWords(shuffleArray([...puzzle.scrambledWords])); // Shuffle a copy to not alter original
    } else {
      // This block should ideally not be reached with the new puzzle data structure
      console.warn("Attempted to start an unknown puzzle type:", puzzle.type);
      setOrderedWords([]); // Clear any previous state
    }
  };

  const checkAnswer = () => {
    let correct = false;

    if (currentPuzzle.type === "scrambled_words_ordering") {
      // Compare the user's ordered words array with the correct order array
      correct = JSON.stringify(orderedWords) === JSON.stringify(currentPuzzle.correctOrder);
    }
    // All other puzzle types (fillblank, multiple, ordering) were removed from the `puzzles` array,
    // so their check logic is removed here.

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + currentPuzzle.points);
      setCompletedPuzzles([...completedPuzzles, currentPuzzle.id]);

      // Check if all puzzles are completed
      if (completedPuzzles.length + 1 === puzzles.length) {
        setTimeout(() => completeGame(), 2000);
      }
    }
  };

  const completeGame = async () => {
    setGameComplete(true);
    const finalScore = score;
    
    if (user) {
      try {
        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "ayat_explorer",
          score: finalScore,
          completed: true
        });
        
        // Update user's total points, capped at 1500 as in original logic
        const newTotalPoints = Math.min((user.points || 0) + finalScore, 1500);
        await base44.auth.updateMe({ points: newTotalPoints });
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const resetGame = () => {
    setCurrentPuzzle(null);
    setScore(0);
    setCompletedPuzzles([]);
    setGameComplete(false);
  };

  // Function to move a word in the orderedWords array
  const moveWord = (from, to) => {
    const newOrder = [...orderedWords];
    const [movedWord] = newOrder.splice(from, 1); // Remove item from 'from' position
    newOrder.splice(to, 0, movedWord); // Insert item at 'to' position
    setOrderedWords(newOrder);
  };

  // Game Complete Screen
  if (gameComplete) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <div className="text-6xl mb-4">📚</div>
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Library Explored! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">You completed all puzzles!</p>
            <p className="text-5xl font-bold text-green-600 mb-6">{score}</p>
            <p className="text-gray-600 mb-6">Total Points Earned</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-green-500 to-teal-500">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(score)} variant="outline">
                  Back to Games
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Puzzle Selection Screen
  if (!currentPuzzle) {
    return (
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Ayat Explorer
            </CardTitle>
            <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
              Score: {score}
            </Badge>
          </div>
          <p className="text-center text-cyan-100 mt-2">Order words to form Quranic Ayahs</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {puzzles.map((puzzle) => {
              const completed = completedPuzzles.includes(puzzle.id);
              return (
                <motion.button
                  key={puzzle.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startPuzzle(puzzle)}
                  disabled={completed}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    completed
                      ? "bg-green-50 border-green-400 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 hover:border-cyan-400"
                  }`}
                >
                  <div className="text-5xl mb-3">{puzzle.emoji}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{puzzle.title}</h3>
                  <Badge className="mb-2">{puzzle.points} pts</Badge>
                  {completed && (
                    <div className="mt-2 text-green-600 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Puzzle Screen - now exclusively for "scrambled_words_ordering" type
  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">{currentPuzzle.emoji}</span>
            {currentPuzzle.title}
          </CardTitle>
          <Button onClick={() => setCurrentPuzzle(null)} variant="ghost" size="sm" className="text-white hover:bg-white/20">
            Back
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {currentPuzzle.question || currentPuzzle.ayah}
        </h3>

        {/* Scrambled Words Ordering Puzzle UI */}
        {currentPuzzle.type === "scrambled_words_ordering" && (
          <div className="space-y-3">
            <p className="text-base text-gray-700 mb-4 italic text-center">
              Arrange the words below to form the correct Ayah.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {orderedWords.map((word, position) => (
                <div key={word + position} className="flex items-center gap-1">
                  <Badge className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white text-md">
                    {position + 1}
                  </Badge>
                  <motion.div
                    layout // Enables smooth animations for reordering
                    className="flex-1 bg-gray-100 p-2 rounded-lg font-medium text-gray-800 border border-gray-200"
                  >
                    {word}
                  </motion.div>
                  <div className="flex flex-col gap-1">
                    {position > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveWord(position, position - 1)}
                        disabled={showResult}
                        className="p-1 h-auto"
                      >
                        ↑
                      </Button>
                    )}
                    {position < orderedWords.length - 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveWord(position, position + 1)}
                        disabled={showResult}
                        className="p-1 h-auto"
                      >
                        ↓
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {currentPuzzle.reference && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Reference: {currentPuzzle.reference}
              </p>
            )}
          </div>
        )}

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl border-2 ${
                isCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="font-semibold mb-2 flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-900">Correct! +{currentPuzzle.points} points</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-900">Incorrect. Try again!</span>
                  </>
                )}
              </p>
              {isCorrect && currentPuzzle.explanation && (
                <p className="text-sm text-gray-700">{currentPuzzle.explanation}</p>
              )}
              {!isCorrect && (
                <p className="text-sm text-gray-700 mt-2">
                  Correct Ayah: <span className="font-semibold">{currentPuzzle.correctOrder.join(" ")}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-3 mt-6">
          {!showResult ? (
            <Button
              onClick={checkAnswer}
              disabled={orderedWords.length === 0} // Disable if no words are placed yet
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
              size="lg"
            >
              Check Answer
            </Button>
          ) : isCorrect ? (
            <Button
              onClick={() => setCurrentPuzzle(null)}
              className="bg-gradient-to-r from-green-500 to-teal-500"
              size="lg"
            >
              Next Puzzle
            </Button>
          ) : (
            <Button
              onClick={() => {
                setShowResult(false);
                // Reshuffle words if incorrect for another attempt
                setOrderedWords(shuffleArray([...currentPuzzle.scrambledWords])); 
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
              size="lg"
            >
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

AyatExplorer.propTypes = {
  onComplete: PropTypes.func
};
