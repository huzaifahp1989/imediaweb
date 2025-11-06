import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, Navigation, CheckCircle2, XCircle } from "lucide-react";
import PropTypes from 'prop-types';

const mazes = {
  mecca: {
    name: "Mecca Maze",
    emoji: "🕋",
    difficulty: "Easy",
    gridSize: 7,
    start: { row: 0, col: 0 },
    end: { row: 6, col: 6 },
    walls: [
      "1-2", "1-3", "1-4",
      "2-1", "2-4", "2-5",
      "3-2", "3-3", "3-5",
      "4-1", "4-3", "4-4",
      "5-2", "5-4", "5-5"
    ],
    questions: [
      {
        position: "3-4",
        question: "How many days is the Hajj pilgrimage?",
        options: ["3", "5", "7", "10"],
        correct: 1,
        explanation: "Hajj lasts 5-6 days during Dhul Hijjah."
      },
      {
        position: "5-3",
        question: "What do we call the running between Safa and Marwah?",
        options: ["Tawaf", "Sa'i", "Wuquf", "Rami"],
        correct: 1,
        explanation: "Sa'i is the ritual of walking between Safa and Marwah seven times."
      }
    ],
    points: 50
  },
  medina: {
    name: "Medina Maze",
    emoji: "🌙",
    difficulty: "Medium",
    gridSize: 9,
    start: { row: 0, col: 4 },
    end: { row: 8, col: 4 },
    walls: [
      "1-2", "1-3", "1-5", "1-6",
      "2-1", "2-4", "2-7",
      "3-2", "3-3", "3-5", "3-6",
      "4-1", "4-4", "4-7",
      "5-2", "5-3", "5-5", "5-6",
      "6-1", "6-4", "6-7",
      "7-2", "7-3", "7-5", "7-6"
    ],
    questions: [
      {
        position: "4-4",
        question: "What was the original name of Medina before the Hijrah?",
        options: ["Makkah", "Yathrib", "Taif", "Badr"],
        correct: 1,
        explanation: "Medina was called Yathrib before the Prophet's ﷺ migration."
      },
      {
        position: "6-4",
        question: "Name the two main tribes of Medina that accepted the Prophet ﷺ.",
        options: ["Quraysh and Banu Hashim", "Aws and Khazraj", "Banu Nadir and Banu Qaynuqa", "Thaqif and Hawazin"],
        correct: 1,
        explanation: "The Aws and Khazraj were the two main Arab tribes of Medina."
      }
    ],
    points: 100
  },
  spiritual: {
    name: "Spiritual Maze",
    emoji: "✨",
    difficulty: "Hard",
    gridSize: 11,
    start: { row: 0, col: 5 },
    end: { row: 10, col: 5 },
    walls: [
      "1-2", "1-3", "1-4", "1-6", "1-7", "1-8",
      "2-1", "2-5", "2-9",
      "3-2", "3-3", "3-4", "3-6", "3-7", "3-8",
      "4-1", "4-5", "4-9",
      "5-2", "5-3", "5-4", "5-6", "5-7", "5-8",
      "6-1", "6-5", "6-9",
      "7-2", "7-3", "7-4", "7-6", "7-7", "7-8",
      "8-1", "8-5", "8-9",
      "9-2", "9-3", "9-4", "9-6", "9-7", "9-8"
    ],
    questions: [
      {
        position: "5-5",
        question: "In which Surah is the Ayat al-Kursi found?",
        options: ["Surah Al-Fatiha", "Surah Al-Baqarah", "Surah Al-Ikhlas", "Surah An-Nas"],
        correct: 1,
        explanation: "Ayat al-Kursi is verse 255 of Surah Al-Baqarah."
      },
      {
        position: "8-5",
        question: "What is the name of the treaty between the Muslims and the Quraysh of Mecca?",
        options: ["Treaty of Badr", "Treaty of Hudaybiyyah", "Treaty of Uhud", "Treaty of Tabuk"],
        correct: 1,
        explanation: "The Treaty of Hudaybiyyah was signed in the year 6 AH."
      }
    ],
    points: 200
  }
};

export default function MazeOfGuidance({ onComplete }) {
  const [selectedMaze, setSelectedMaze] = useState(null);
  const [playerPos, setPlayerPos] = useState(null);
  const [visited, setVisited] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
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

  const startGame = (mazeKey) => {
    const maze = mazes[mazeKey];
    setSelectedMaze({ ...maze, key: mazeKey });
    setPlayerPos(maze.start);
    setVisited([`${maze.start.row}-${maze.start.col}`]);
    setMoves(0);
    setGameComplete(false);
  };

  const canMove = (newRow, newCol) => {
    const maze = selectedMaze;
    if (newRow < 0 || newRow >= maze.gridSize || newCol < 0 || newCol >= maze.gridSize) {
      return false;
    }
    if (maze.walls.includes(`${newRow}-${newCol}`)) {
      return false;
    }
    return true;
  };

  const handleMove = (direction) => {
    let newRow = playerPos.row;
    let newCol = playerPos.col;

    switch (direction) {
      case "up": newRow--; break;
      case "down": newRow++; break;
      case "left": newCol--; break;
      case "right": newCol++; break;
      default: return;
    }

    if (!canMove(newRow, newCol)) return;

    const newPos = { row: newRow, col: newCol };
    const posKey = `${newRow}-${newCol}`;
    
    // Check if there's a question at this position
    const question = selectedMaze.questions.find(q => q.position === posKey);
    if (question && !visited.includes(posKey)) {
      setCurrentQuestion(question);
    } else {
      setPlayerPos(newPos);
      setVisited([...visited, posKey]);
      setMoves(moves + 1);

      // Check if reached end
      if (newRow === selectedMaze.end.row && newCol === selectedMaze.end.col) {
        completeGame();
      }
    }
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
  };

  const handleNextAfterQuestion = () => {
    const isCorrect = selectedAnswer === currentQuestion.correct;
    
    if (isCorrect) {
      const [row, col] = currentQuestion.position.split('-').map(Number);
      setPlayerPos({ row, col });
      setVisited([...visited, currentQuestion.position]);
      setMoves(moves + 1);

      if (row === selectedMaze.end.row && col === selectedMaze.end.col) {
        completeGame();
      }
    } else {
      // Wrong answer - go back one step
      if (visited.length > 1) {
        const prevPos = visited[visited.length - 2];
        const [row, col] = prevPos.split('-').map(Number);
        setPlayerPos({ row, col });
      }
    }

    setCurrentQuestion(null);
    setShowExplanation(false);
    setSelectedAnswer(null);
  };

  const completeGame = async () => {
    setGameComplete(true);
    const fallbackScore = selectedMaze.points;
    
    if (user) {
      try {
        await awardPointsForGame(user, "maze_of_guidance", { fallbackScore });
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const resetGame = () => {
    setSelectedMaze(null);
    setPlayerPos(null);
    setVisited([]);
    setCurrentQuestion(null);
    setMoves(0);
    setGameComplete(false);
  };

  // Maze Selection Screen
  if (!selectedMaze) {
    return (
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-2 justify-center">
            <Navigation className="w-6 h-6" />
            Maze of Guidance
          </CardTitle>
          <p className="text-center text-indigo-100 mt-2">Navigate through the maze by answering questions</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(mazes).map(([key, maze]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(key)}
                className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 hover:border-indigo-400 transition-all"
              >
                <div className="text-5xl mb-3">{maze.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{maze.name}</h3>
                <Badge className="mb-2">{maze.difficulty}</Badge>
                <p className="text-sm text-gray-600">{maze.points} points</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <div className="text-6xl mb-4">{selectedMaze.emoji}</div>
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Maze Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">{selectedMaze.name}</p>
            <div className="space-y-2 mb-6">
              <p className="text-lg"><strong>Moves:</strong> {moves}</p>
              <p className="text-3xl font-bold text-green-600">{selectedMaze.points} Points</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-green-500 to-teal-500">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(selectedMaze.points)} variant="outline">
                  Back to Games
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Question Screen
  if (currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="text-xl">Question at Checkpoint</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
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
              onClick={handleNextAfterQuestion}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600"
              size="lg"
            >
              Continue
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Playing Screen
  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">{selectedMaze.emoji}</span>
            {selectedMaze.name}
          </CardTitle>
          <Badge className="bg-white/30 backdrop-blur-sm text-white px-3 py-1">
            Moves: {moves}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Maze Grid */}
        <div 
          className="grid gap-1 mx-auto mb-6"
          style={{ 
            gridTemplateColumns: `repeat(${selectedMaze.gridSize}, 1fr)`,
            maxWidth: `${selectedMaze.gridSize * 40}px`
          }}
        >
          {Array.from({ length: selectedMaze.gridSize }, (_, row) =>
            Array.from({ length: selectedMaze.gridSize }, (_, col) => {
              const posKey = `${row}-${col}`;
              const isWall = selectedMaze.walls.includes(posKey);
              const isPlayer = playerPos.row === row && playerPos.col === col;
              const isStart = selectedMaze.start.row === row && selectedMaze.start.col === col;
              const isEnd = selectedMaze.end.row === row && selectedMaze.end.col === col;
              const isVisited = visited.includes(posKey);
              const hasQuestion = selectedMaze.questions.some(q => q.position === posKey);

              return (
                <div
                  key={posKey}
                  className={`aspect-square rounded flex items-center justify-center text-xs font-bold transition-all ${
                    isWall
                      ? "bg-gray-800"
                      : isPlayer
                      ? "bg-blue-500 text-white text-lg"
                      : isEnd
                      ? "bg-green-500 text-white"
                      : isStart
                      ? "bg-purple-500 text-white"
                      : hasQuestion && !isVisited
                      ? "bg-amber-300"
                      : isVisited
                      ? "bg-blue-100"
                      : "bg-gray-100"
                  }`}
                >
                  {isPlayer ? "👤" : isEnd ? "🎯" : isStart ? "🚀" : hasQuestion && !isVisited ? "❓" : ""}
                </div>
              );
            })
          ).flat()}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2">
          <Button onClick={() => handleMove("up")} size="sm" className="w-20">↑</Button>
          <div className="flex gap-2">
            <Button onClick={() => handleMove("left")} size="sm" className="w-20">←</Button>
            <Button onClick={() => handleMove("down")} size="sm" className="w-20">↓</Button>
            <Button onClick={() => handleMove("right")} size="sm" className="w-20">→</Button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

MazeOfGuidance.propTypes = {
  onComplete: PropTypes.func
};
