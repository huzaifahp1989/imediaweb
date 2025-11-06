
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, CheckCircle2, RotateCcw, AlertCircle, Info, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";
import PropTypes from 'prop-types';

const wordBanks = {
  easy: {
    seerah: ["MUHAMMAD", "MAKKAH", "MADINAH", "KHADIJAH", "AISHA", "FATIMAH", "HASAN", "JIBREEL", "UHUD", "BADR", "HIJRAH", "HIRA"],
    fiqh: ["SALAH", "WUDU", "ZAKAT", "HAJJ", "SAWM", "QIBLA", "ADHAN", "IQAMAH", "RUKU", "SUJUD", "FARD", "SUNNAH"],
    quran: ["ALLAH", "QURAN", "JANNAH", "ISLAM", "IMAN", "FATIHA", "YASIN", "MULK", "RAHMAN", "NOOR", "AYAH", "SURAH"],
    hadith: ["SUNNAH", "BUKHARI", "MUSLIM", "HADITH", "DEEN", "TAQWA", "IKHLAS", "SABR", "SHUKR", "TAWBAH", "IHSAN", "ADAB"],
    sahabah: ["ABU", "UMAR", "UTHMAN", "ALI", "BILAL", "HAMZA", "KHALID", "ZAID", "TALHA", "ZUBAIR", "SAAD", "ANAS"],
    allah: ["RAHMAN", "RAHIM", "MALIK", "SALAM", "AZIZ", "KARIM", "LATIF", "HAKIM", "ALEEM", "WADUD", "RAZZAQ", "BASIR"],
    gridSize: 10
  },
  medium: {
    seerah: ["IBRAHIM", "JIBREEL", "KHADIJAH", "FAREWELL", "HIJRAH", "CONQUEST", "TABUK", "MEDINA", "QURAISH", "KAABA", "TRENCH", "TAIF"],
    fiqh: ["TAHARAH", "QIBLA", "RAMADAN", "SADAQAH", "FASTING", "GHUSL", "FITRAH", "IFTAR", "SUHOOR", "TARAWEEH", "JUMMAH", "TAKBIR"],
    quran: ["FATIHA", "BAQARAH", "YASIN", "RAHMAN", "MULK", "KAHF", "FURQAN", "NOOR", "MARYAM", "YUSUF", "IMRAN", "TAHA"],
    hadith: ["TAQWA", "IKHLAS", "SABR", "TAWHID", "SUNNAH", "IHSAN", "SHUKR", "TAWBAH", "ADAB", "HALAL", "HARAM", "RIZQ"],
    sahabah: ["KHADIJAH", "FATIMAH", "HAMZA", "KHALID", "ZAID", "AISHA", "HAFSA", "TALHA", "ZUBAIR", "SAAD", "SALMAN", "ANAS"],
    allah: ["KARIM", "LATIF", "HAKIM", "AZIZ", "WADUD", "ALEEM", "BASIR", "SAMI", "QADIR", "JALEEL", "JAMEEL", "RAZZAQ"],
    gridSize: 11
  },
  hard: {
    seerah: ["KHADEEJAH", "CONQUEST", "BADR", "UHUD", "KHAYBAR", "TABUK", "TAIF", "TRENCH", "YAMAMA", "MUBAHALA", "HUDAIBIYA", "ABYSSINIA"],
    fiqh: ["ZAKATUL", "FIDYAH", "ITIKAF", "TAYAMMUM", "WITR", "TAHARAH", "ISTINJA", "KHUTBAH", "JUMMAH", "KHUSHU", "TAKBIR", "IQAMAH"],
    quran: ["MUMINOON", "FURQAN", "KAHF", "NOOR", "YASEEN", "WAQIAH", "MULK", "QALAM", "HAQQAH", "MAARIJ", "INSAN", "TARIQ"],
    hadith: ["TAWAKKUL", "IHSAN", "ADAB", "SHUKR", "TAQWA", "TAWBAH", "ZIKR", "KHUSHU", "SIDQ", "AMANAH", "HAYAA", "HILM"],
    sahabah: ["TALHA", "ZUBAIR", "SAAD", "ANAS", "SALMAN", "SUHAYB", "ABDULLAH", "MUADH", "UBAYY", "ZAYD", "USAMA", "BILAL"],
    allah: ["GHAFFAR", "QAHHAR", "WAHHAB", "FATTAH", "JABBAR", "KHAALIQ", "BARI", "MUQEET", "HASIB", "JALEEL", "KAREEM", "RAQEEB"],
    gridSize: 12
  }
};

const selectRandomWords = (wordArray, count = 6) => {
  const shuffled = [...wordArray].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const generateGrid = (category, level) => {
  const { gridSize, ...categories } = wordBanks[level];
  const allWords = categories[category] || [];
  const words = selectRandomWords(allWords, 6);
  
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const wordPositions = [];
  const placedWords = [];
  const directions = ['horizontal', 'vertical'];

  words.forEach(word => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (!placed && attempts < maxAttempts) {
      attempts++;
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      
      if (canPlaceWord(grid, word, row, col, direction, gridSize)) {
        const positions = placeWord(grid, word, row, col, direction);
        wordPositions.push({ word, positions, direction });
        placedWords.push(word);
        placed = true;
      }
    }
  });

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, wordPositions, words: placedWords };
};

const canPlaceWord = (grid, word, row, col, direction, gridSize) => {
  if (direction === 'horizontal') {
    if (col + word.length > gridSize) return false;
  } else if (direction === 'vertical') {
    if (row + word.length > gridSize) return false;
  }

  for (let i = 0; i < word.length; i++) {
    let r = row;
    let c = col;
    
    if (direction === 'horizontal') c = col + i;
    else if (direction === 'vertical') r = row + i;
    
    const cell = grid[r][c];
    if (cell !== '' && cell !== word[i]) return false;
  }
  
  return true;
};

const placeWord = (grid, word, row, col, direction) => {
  const positions = [];
  
  for (let i = 0; i < word.length; i++) {
    let r = row;
    let c = col;
    
    if (direction === 'horizontal') c = col + i;
    else if (direction === 'vertical') r = row + i;
    
    grid[r][c] = word[i];
    positions.push({ row: r, col: c });
  }
  
  return positions;
};

export default function IslamicWordSearchGame({ onComplete }) {
  const [level, setLevel] = useState(null);
  const [category, setCategory] = useState(null);
  const [{ grid, wordPositions, words }, setGridData] = useState({ grid: [], wordPositions: [], words: [] });
  const [found, setFound] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [user, setUser] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const levels = [
    { id: "easy", name: "Easy", icon: "🌱", color: "from-green-500 to-green-600", description: "6 words - 10x10 grid" },
    { id: "medium", name: "Medium", icon: "⚡", color: "from-yellow-500 to-orange-500", description: "6 words - 11x11 grid" },
    { id: "hard", name: "Hard", icon: "🔥", color: "from-red-500 to-red-600", description: "6 words - 12x12 grid" }
  ];

  const categories = [
    { id: "seerah", name: "Seerah", icon: "📖", description: "Life of Prophet ﷺ" },
    { id: "fiqh", name: "Fiqh", icon: "🕌", description: "Islamic Rulings" },
    { id: "quran", name: "Quran", icon: "📚", description: "Holy Quran" },
    { id: "hadith", name: "Hadith", icon: "📜", description: "Prophet's Sayings" },
    { id: "sahabah", name: "Sahabah", icon: "👥", description: "Companions" },
    { id: "allah", name: "Allah's Names", icon: "✨", description: "99 Names" }
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (err) {
        console.log("User not authenticated", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (level && category) {
      const generatedData = generateGrid(category, level);
      setGridData(generatedData);
      setFound([]);
      setScore(0);
      setGameCompleted(false);
    }
  }, [level, category]);

  const checkDailyCompletionBonus = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todaysScores = await base44.entities.GameScore.filter({
        user_id: userId,
        created_at_gte: `${today}T00:00:00.000Z`,
        created_at_lte: `${today}T23:59:59.999Z`
      });
      
      const uniqueGames = [...new Set(todaysScores.map(s => s.game_type))];
      const totalGames = 13; // Assuming 13 distinct game types for the daily bonus
      
      if (uniqueGames.length >= totalGames) {
        const existingBonus = todaysScores.find(s => s.game_type === 'daily_completion_bonus');
        
        if (!existingBonus) {
          await base44.entities.GameScore.create({
            user_id: userId,
            game_type: 'daily_completion_bonus',
            score: 10,
            bonus_points: 0, // This is the bonus itself
            completed: true
          });

          // Fetch latest user data to apply bonus
          const userData = await base44.auth.me();
          const newTotalPoints = Math.min((userData.points || 0) + 10, 1500);
          
          await base44.auth.updateMe({
            points: newTotalPoints
          });
        }
      }
    } catch (error) {
      console.log("Error checking daily bonus:", error);
    }
  };

  useEffect(() => {
    if (level && category && words.length > 0 && found.length === words.length && !gameCompleted) {
      const completeGameAsync = async () => {
        const fallbackScore = 15; // previous fixed base score
        const isPerfect = true; // completing means perfect here
        setGameCompleted(true);
        
        if (user) {
          try {
            const awarded = await awardPointsForGame(user, "word_search", { isPerfect, fallbackScore });
            setScore(awarded);
            // Check for daily completion bonus separate from game awarding
            await checkDailyCompletionBonus(user.id);
          } catch (err) {
            console.error("Error saving game score:", err);
          }
        }
        
        setTimeout(() => {
          if (onComplete) onComplete(score || fallbackScore);
        }, 2000);
      };
      
      completeGameAsync();
    }
  }, [found, level, category, words, gameCompleted, user, onComplete, checkDailyCompletionBonus]);

  const startSelection = (row, col) => {
    setSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const continueSelection = (row, col) => {
    if (!selecting) return;

    if (selectedCells.length === 1) {
      setSelectedCells([...selectedCells, { row, col }]);
    } else {
      const firstCell = selectedCells[0];
      
      if (firstCell.row === row) {
        const minCol = Math.min(firstCell.col, col);
        const maxCol = Math.max(firstCell.col, col);
        const newSelection = [];
        for (let c = minCol; c <= maxCol; c++) {
          newSelection.push({ row, col: c });
        }
        setSelectedCells(newSelection);
      } else if (firstCell.col === col) {
        const minRow = Math.min(firstCell.row, row);
        const maxRow = Math.max(firstCell.row, row);
        const newSelection = [];
        for (let r = minRow; r <= maxRow; r++) {
          newSelection.push({ row: r, col });
        }
        setSelectedCells(newSelection);
      } else if (Math.abs(firstCell.row - row) === Math.abs(firstCell.col - col)) {
        const newSelection = [];
        const dRow = row > firstCell.row ? 1 : -1;
        const dCol = col > firstCell.col ? 1 : -1;
        const length = Math.abs(firstCell.row - row) + 1;
        for (let i = 0; i < length; i++) {
          newSelection.push({
            row: firstCell.row + i * dRow,
            col: firstCell.col + i * dCol
          });
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
    const selectedText = selectedCells.map(pos => grid[pos.row][pos.col]).join('');
    const selectedTextReverse = selectedText.split('').reverse().join('');
    
    const matchedWord = words.find(word => 
      (word === selectedText || word === selectedTextReverse) && !found.includes(word)
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
      const row = parseInt(element.dataset.row, 10);
      const col = parseInt(element.dataset.col, 10);
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

  if (!level) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8">
          <CardTitle className="text-3xl text-center">Choose Your Level</CardTitle>
          <p className="text-center mt-2 text-green-100">Find Islamic words hidden in the grid!</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((lvl, index) => (
              <motion.div
                key={lvl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={() => setLevel(lvl.id)}
                  className={`w-full p-8 rounded-2xl bg-gradient-to-br ${lvl.color} text-white shadow-xl hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="text-6xl mb-4">{lvl.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{lvl.name}</h3>
                  <p className="text-sm opacity-90">{lvl.description}</p>
                </button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!category) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
          <CardTitle className="text-3xl text-center">Choose a Category</CardTitle>
          <p className="text-center mt-2 text-blue-100">What would you like to learn about?</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setCategory(cat.id)}
                className="p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-3">{cat.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-600">{cat.description}</p>
              </motion.button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button onClick={() => setLevel(null)} variant="outline">
              Change Level
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameCompleted) {
    // `score` state holds the base score (15). `found.length === words.length` is always true if game is completed.
    const bonusPoints = (found.length === words.length) ? 5 : 0;
    const totalScore = score + bonusPoints;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Masha&apos;Allah! 🎉</h2>
            <p className="text-xl text-gray-600 mb-4">You found all the words!</p>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 mb-6">
              <p className="text-4xl font-bold text-green-600 mb-2">{score} points</p>
              {bonusPoints > 0 && (
                <div className="mt-4 p-3 bg-amber-100 rounded-lg border-2 border-amber-400">
                  <p className="text-sm font-bold text-amber-900 flex items-center justify-center gap-2">
                    <Star className="w-5 h-5 fill-amber-500" />
                    Perfect Score Bonus: +{bonusPoints} points!
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">Total: {totalScore} points</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={() => {
                  setLevel(null);
                  setCategory(null);
                }}
                className="bg-gradient-to-r from-green-500 to-teal-500"
              >
                New Game
              </Button>
              <Button
                onClick={() => {
                  const generatedData = generateGrid(category, level);
                  setGridData(generatedData);
                  setFound([]);
                  setScore(0);
                  setGameCompleted(false);
                }}
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (words.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generating puzzle...</h3>
          <p className="text-gray-600">Please wait a moment</p>
        </CardContent>
      </Card>
    );
  }

  const cellSize = level === 'easy' ? 'w-8 h-8 md:w-10 md:h-10' : level === 'medium' ? 'w-7 h-7 md:w-9 md:h-9' : 'w-6 h-6 md:w-8 md:h-8';
  const fontSize = level === 'easy' ? 'text-sm md:text-base' : level === 'medium' ? 'text-xs md:text-sm' : 'text-xs';

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-xl md:text-2xl">
            Islamic Word Search - {categories.find(c => c.id === category)?.name}
          </CardTitle>
          <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
            {found.length}/6 Found
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            <strong>Find all 6 Islamic words in the puzzle!</strong> Each time you play, new words appear. Click and drag to select words (horizontal or vertical).
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-gray-700 text-lg">🔍 Find these words:</h3>
          <div className="flex flex-wrap gap-2">
            {words.map(word => (
              <Badge
                key={word}
                variant={found.includes(word) ? "default" : "outline"}
                className={`text-sm px-3 py-2 ${
                  found.includes(word) ? "bg-green-500 text-white" : "bg-white text-gray-700 border-2"
                }`}
              >
                {found.includes(word) && <CheckCircle2 className="w-4 h-4 mr-2" />}
                {word}
              </Badge>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div 
            className="grid gap-1 select-none touch-none mx-auto w-fit" 
            style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
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
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${cellSize} ${fontSize} rounded-lg font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
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
        </div>

        <div className="flex gap-3 justify-center flex-wrap mt-6">
          <Button onClick={() => setCategory(null)} variant="outline">
            Change Category
          </Button>
          <Button onClick={() => setLevel(null)} variant="outline">
            Change Level
          </Button>
          <Button 
            onClick={() => {
              const generatedData = generateGrid(category, level);
              setGridData(generatedData);
              setFound([]);
            }}
            className="bg-gradient-to-r from-green-500 to-teal-500"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Puzzle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

IslamicWordSearchGame.propTypes = {
  onComplete: PropTypes.func
};
