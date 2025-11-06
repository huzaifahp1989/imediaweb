
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, Puzzle, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";
import PropTypes from 'prop-types';

const mosques = [
  {
    id: "aqsa",
    name: "Al-Masjid al-Aqsa",
    description: "The Noble Sanctuary in Jerusalem",
    emoji: "🕌",
    imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80"
  },
  {
    id: "haram",
    name: "Al-Masjid al-Haram (The Kaaba in Makkah)",
    description: "The Sacred Mosque with the Holy Kaaba in Makkah",
    emoji: "🕋",
    imageUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80"
  },
  {
    id: "nabawi",
    name: "Al-Masjid an-Nabawi (Madinah)",
    description: "The Prophet's Mosque with the Green Dome in Madinah",
    emoji: "🌙",
    imageUrl: "https://images.unsplash.com/photo-1591135480936-0b5e90c2f7e6?w=800&q=80"
  }
];

const difficulties = {
  easy: { pieces: 9, gridSize: 3, points: 50 },
  medium: { pieces: 16, gridSize: 4, points: 100 },
  hard: { pieces: 25, gridSize: 5, points: 200 }
};

export default function SacredSitesJigsaw({ onComplete }) {
  const [selectedMosque, setSelectedMosque] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [solved, setSolved] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
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

  const startGame = (mosque, diff) => {
    setSelectedMosque(mosque);
    setDifficulty(diff);
    setStartTime(Date.now());
    
    const { gridSize } = difficulties[diff];
    const puzzlePieces = [];
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        puzzlePieces.push({
          id: `${row}-${col}`,
          correctRow: row,
          correctCol: col,
          currentRow: row,
          currentCol: col
        });
      }
    }
    
    // Shuffle pieces
    const shuffled = puzzlePieces.sort(() => Math.random() - 0.5);
    shuffled.forEach((piece, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      piece.currentRow = row;
      piece.currentCol = col;
    });
    
    setPieces(shuffled);
    setSolved([]);
    setMoves(0);
    setGameComplete(false);
  };

  const handlePieceClick = (piece) => {
    if (solved.includes(piece.id)) return;
    
    if (!selectedPiece) {
      setSelectedPiece(piece);
    } else {
      // Swap pieces
      const temp = { row: selectedPiece.currentRow, col: selectedPiece.currentCol };
      selectedPiece.currentRow = piece.currentRow;
      selectedPiece.currentCol = piece.currentCol;
      piece.currentRow = temp.row;
      piece.currentCol = temp.col;
      
      setPieces([...pieces]);
      setSelectedPiece(null);
      setMoves(moves + 1);
      
      // Check if piece is in correct position
      const newSolved = [...solved];
      pieces.forEach(p => {
        if (p.correctRow === p.currentRow && p.correctCol === p.currentCol && !solved.includes(p.id)) {
          newSolved.push(p.id);
        }
      });
      setSolved(newSolved);
      
      // Check if puzzle is complete
      if (newSolved.length === pieces.length) {
        completePuzzle();
      }
    }
  };

  const completePuzzle = async () => {
    setGameComplete(true);
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const fallbackScore = difficulties[difficulty].points;
    
    if (user) {
      try {
        await awardPointsForGame(user, "sacred_sites_jigsaw", { fallbackScore });
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const resetGame = () => {
    setSelectedMosque(null);
    setDifficulty(null);
    setPieces([]);
    setSolved([]);
    setSelectedPiece(null);
    setMoves(0);
    setGameComplete(false);
  };

  // Mosque Selection Screen
  if (!selectedMosque) {
    return (
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-2 justify-center">
            <Puzzle className="w-6 h-6" />
            Sacred Sites Jigsaw
          </CardTitle>
          <p className="text-center text-emerald-100 mt-2">Choose a holy mosque to assemble</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {mosques.map((mosque) => (
              <motion.button
                key={mosque.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMosque(mosque)}
                className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-400 transition-all"
              >
                <div className="text-5xl mb-3">{mosque.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{mosque.name}</h3>
                <p className="text-sm text-gray-600">{mosque.description}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Difficulty Selection
  if (!difficulty) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="text-3xl">{selectedMosque.emoji}</span>
              {selectedMosque.name}
            </CardTitle>
            <Button onClick={() => setSelectedMosque(null)} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-center mb-6">Select Difficulty</h3>
          <div className="grid gap-4">
            {Object.entries(difficulties).map(([level, config]) => (
              <Button
                key={level}
                onClick={() => startGame(selectedMosque, level)}
                className="h-auto py-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                size="lg"
              >
                <div className="text-left w-full">
                  <div className="text-2xl font-bold capitalize mb-2">{level}</div>
                  <div className="text-sm opacity-90">{config.pieces} pieces • {config.points} points</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Game Complete Screen
  if (gameComplete) {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const score = difficulties[difficulty].points;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <div className="text-6xl mb-4">{selectedMosque.emoji}</div>
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Puzzle Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-6">{selectedMosque.name}</p>
            <div className="space-y-2 mb-6">
              <p className="text-lg"><strong>Time:</strong> {timeElapsed}s</p>
              <p className="text-lg"><strong>Moves:</strong> {moves}</p>
              <p className="text-3xl font-bold text-green-600">{score} Points</p>
            </div>
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

  // Playing Screen
  const { gridSize } = difficulties[difficulty];
  
  return (
    <Card className="max-w-4xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">{selectedMosque.emoji}</span>
            {selectedMosque.name}
          </CardTitle>
          <div className="flex gap-3">
            <Badge className="bg-white/30 backdrop-blur-sm text-white px-3 py-1">
              Moves: {moves}
            </Badge>
            <Badge className="bg-white/30 backdrop-blur-sm text-white px-3 py-1">
              {solved.length}/{pieces.length}
            </Badge>
          </div>
        </div>
        <p className="text-emerald-100 text-sm mt-2 capitalize">{difficulty} • {difficulties[difficulty].pieces} pieces</p>
      </CardHeader>

      <CardContent className="p-6">
        <div 
          className="grid gap-1 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: `${gridSize * 100}px`
          }}
        >
          {pieces.map((piece) => {
            const isSolved = solved.includes(piece.id);
            const isSelected = selectedPiece?.id === piece.id;
            
            return (
              <motion.button
                key={piece.id}
                onClick={() => handlePieceClick(piece)}
                disabled={isSolved}
                whileHover={{ scale: isSolved ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-lg transition-all ${
                  isSolved
                    ? "bg-green-500 border-2 border-green-600 cursor-default"
                    : isSelected
                    ? "bg-blue-500 border-4 border-blue-600"
                    : "bg-gradient-to-br from-emerald-200 to-teal-200 border-2 border-emerald-300 hover:border-emerald-400"
                }`}
                style={{
                  backgroundImage: isSolved ? `url(${selectedMosque.imageUrl})` : "none",
                  backgroundPosition: `${(piece.correctCol / (gridSize - 1)) * 100}% ${(piece.correctRow / (gridSize - 1)) * 100}%`,
                  backgroundSize: `${gridSize * 100}%`
                }}
              >
                {!isSolved && (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">
                    {piece.id}
                  </div>
                )}
              </motion.button>
            );
          })}
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

SacredSitesJigsaw.propTypes = {
  onComplete: PropTypes.func
};
