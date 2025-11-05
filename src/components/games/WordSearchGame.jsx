
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Star, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const words = ["SALAH", "HAJJ", "ZAKAT", "QURAN", "ISLAM"];
const gridSize = 10;

const generateGrid = () => {
  const grid = Array(gridSize).fill(null).map(() => 
    Array(gridSize).fill(null).map(() => 
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    )
  );

  const wordPositions = [];

  words.forEach(word => {
    const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    let placed = false;
    
    while (!placed) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      
      if (direction === 'horizontal' && col + word.length <= gridSize) {
        const positions = [];
        for (let i = 0; i < word.length; i++) {
          grid[row][col + i] = word[i];
          positions.push({ row, col: col + i });
        }
        wordPositions.push({ word, positions });
        placed = true;
      } else if (direction === 'vertical' && row + word.length <= gridSize) {
        const positions = [];
        for (let i = 0; i < word.length; i++) {
          grid[row + i][col] = word[i];
          positions.push({ row: row + i, col });
        }
        wordPositions.push({ word, positions });
        placed = true;
      }
    }
  });

  return { grid, wordPositions };
};

export default function WordSearchGame({ onComplete }) {
  const [{ grid, wordPositions }] = useState(generateGrid());
  const [found, setFound] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
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

  useEffect(() => {
    if (found.length === words.length) {
      completeGame();
    }
  }, [found]);

  const completeGame = async () => {
    const score = 20; // Changed from 70 to 20
    
    if (user) {
      try {
        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "word_search",
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
    
    setTimeout(() => onComplete(score), 2000);
  };

  const startSelection = (row, col) => {
    setSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const continueSelection = (row, col) => {
    if (!selecting) return;

    const lastCell = selectedCells[selectedCells.length - 1];
    
    if (selectedCells.length === 1) {
      setSelectedCells([...selectedCells, { row, col }]);
    } else {
      const firstCell = selectedCells[0];
      
      if (firstCell.row === row && lastCell.row === row) {
        const minCol = Math.min(firstCell.col, col);
        const maxCol = Math.max(firstCell.col, col);
        const newSelection = [];
        for (let c = minCol; c <= maxCol; c++) {
          newSelection.push({ row, col: c });
        }
        setSelectedCells(newSelection);
      } else if (firstCell.col === col && lastCell.col === col) {
        const minRow = Math.min(firstCell.row, row);
        const maxRow = Math.max(firstCell.row, row);
        const newSelection = [];
        for (let r = minRow; r <= maxRow; r++) {
          newSelection.push({ row: r, col });
        }
        setSelectedCells(newSelection);
      }
    }
  };

  const endSelection = () => {
    if (selectedCells.length > 1) {
      checkSelection();
    }
    setSelecting(false);
    setSelectedCells([]);
  };

  const checkSelection = () => {
    const selectedWord = selectedCells.map(pos => grid[pos.row][pos.col]).join('');
    const selectedWordReverse = selectedWord.split('').reverse().join('');
    
    const matchedWord = words.find(word => 
      (word === selectedWord || word === selectedWordReverse) && !found.includes(word)
    );
    
    if (matchedWord) {
      setFound([...found, matchedWord]);
    }
  };

  const handleTouchMove = (e) => {
    if (!selecting) return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.dataset.row !== undefined && element.dataset.col !== undefined) {
      const row = parseInt(element.dataset.row);
      const col = parseInt(element.dataset.col);
      continueSelection(row, col);
    }
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellInFoundWord = (row, col) => {
    return wordPositions.some(wp => 
      found.includes(wp.word) && 
      wp.positions.some(pos => pos.row === row && pos.col === col)
    );
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <CardTitle className="text-2xl flex justify-between items-center">
          <span>Islamic Word Search</span>
          <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2 border border-white/40">
            {found.length}/{words.length} Found
          </Badge>
        </CardTitle>
        
        {/* Monthly Prize Banner */}
        <div className="mt-4 bg-white text-gray-900 p-3 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span>The top 3 players with the most points this month win a prize!</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        {/* Old Monthly Prize Banner removed from here */}

        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700">Find these words:</h3>
          <div className="flex flex-wrap gap-2">
            {words.map(word => (
              <Badge
                key={word}
                variant={found.includes(word) ? "default" : "outline"}
                className={`text-sm px-4 py-2 ${
                  found.includes(word) ? "bg-green-500 text-white" : ""
                }`}
              >
                {found.includes(word) && <CheckCircle2 className="w-4 h-4 mr-2" />}
                {word}
              </Badge>
            ))}
          </div>
        </div>

        <div 
          className="grid gap-1 select-none touch-none" 
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          onTouchMove={handleTouchMove}
          onTouchEnd={endSelection}
          onMouseLeave={() => {
            if (selecting) {
              endSelection();
            }
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                data-row={rowIndex}
                data-col={colIndex}
                onMouseDown={() => startSelection(rowIndex, colIndex)}
                onMouseEnter={() => continueSelection(rowIndex, colIndex)}
                onMouseUp={endSelection}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startSelection(rowIndex, colIndex);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-lg font-bold text-sm md:text-base transition-all duration-200 cursor-pointer ${
                  isCellInFoundWord(rowIndex, colIndex)
                    ? "bg-green-500 text-white shadow-lg"
                    : isCellSelected(rowIndex, colIndex)
                    ? "bg-blue-500 text-white scale-105"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {letter}
              </motion.button>
            ))
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          💡 Tip: Click/tap and drag to select words horizontally or vertically
        </div>

        {found.length === words.length && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6 text-center"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Excellent Work! 🎉
            </h3>
            <p className="text-gray-600">You found all the words!</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
