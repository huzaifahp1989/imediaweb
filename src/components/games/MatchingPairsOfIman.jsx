
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RotateCcw, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";
import PropTypes from 'prop-types';

const levels = {
  easy: {
    name: "Pillars of Islam",
    pairs: [
      { id: 1, text: "Shahadah", match: "Declaration of Faith" },
      { id: 2, text: "Salah", match: "Prayer" },
      { id: 3, text: "Zakat", match: "Charity" },
      { id: 4, text: "Sawm", match: "Fasting" },
      { id: 5, text: "Hajj", match: "Pilgrimage" }
    ]
  },
  medium: {
    name: "Prophets & Miracles",
    pairs: [
      { id: 1, text: "Prophet Musa", match: "Parting the Sea" },
      { id: 2, text: "Prophet Isa", match: "Speaking from Cradle" },
      { id: 3, text: "Prophet Ibrahim", match: "Saved from Fire" },
      { id: 4, text: "Prophet Sulayman", match: "Command over Jinn" },
      { id: 5, text: "Prophet Muhammad ﷺ", match: "Splitting of the Moon" }
    ]
  },
  hard: {
    name: "Arabic Terms",
    pairs: [
      { id: 1, text: "Tafsir", match: "Explanation", emoji: "📖", description: "Tafsir = Explanation of Quran" },
      { id: 2, text: "Surah", match: "Chapter", emoji: "📚", description: "Surah = Chapter of Quran" },
      { id: 3, text: "Ayah", match: "Verse", emoji: "✨", description: "Ayah = Verse/Sign" },
      { id: 4, text: "Ummah", match: "Nation", emoji: "🌍", description: "Ummah = Islamic Nation" },
      { id: 5, text: "Ruku", match: "Bowing", emoji: "🙇", description: "Ruku = Bowing in prayer" },
      { id: 6, text: "Kaaba (Makkah)", match: "House of Allah", emoji: "🕋", description: "Kaaba in Makkah = House of Allah" }
    ]
  }
};

export default function MatchingPairsOfIman({ onComplete }) {
  const [currentLevel, setCurrentLevel] = useState("easy");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    initializeGame();
  }, [currentLevel]);

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

  const initializeGame = () => {
    const levelData = levels[currentLevel];
    const cardPairs = [];
    
    levelData.pairs.forEach((pair) => {
      // For each semantic pair, create two card objects: one for text, one for match.
      // They share the same matchId for the game logic to work.
      cardPairs.push({ id: `${pair.id}-text`, content: pair.text, matchId: pair.id, emoji: pair.emoji, description: pair.description });
      cardPairs.push({ id: `${pair.id}-match`, content: pair.match, matchId: pair.id, emoji: pair.emoji, description: pair.description });
    });
    
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].matchId)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].matchId === cards[second].matchId) {
        setMatched([...matched, cards[first].matchId]);
        setFlipped([]);
        setScore(score + 20);
        
        if (matched.length + 1 === levels[currentLevel].pairs.length) {
          completeLevel();
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const completeLevel = async () => {
    const levelScores = { easy: 100, medium: 150, hard: 200 };
    const fallbackScore = levelScores[currentLevel];
    setGameOver(true);
    
    if (user) {
      try {
        const awarded = await awardPointsForGame(user, "matching_pairs", { fallbackScore });
        // Optionally reflect awarded
        // set some local display if needed
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const nextLevel = () => {
    if (currentLevel === "easy") setCurrentLevel("medium");
    else if (currentLevel === "medium") setCurrentLevel("hard");
    else if (onComplete) {
      const levelScores = { easy: 100, medium: 150, hard: 200 };
      onComplete(levelScores[currentLevel]);
    }
    setGameOver(false);
    setScore(0);
  };

  if (gameOver) {
    const levelScores = { easy: 100, medium: 150, hard: 200 };
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Level Complete! 🎉</h2>
            <p className="text-xl text-gray-600 mb-4">{levels[currentLevel].name}</p>
            <p className="text-5xl font-bold text-green-600 mb-2">{levelScores[currentLevel]}</p>
            <p className="text-gray-600 mb-6">Points earned in {moves} moves</p>
            <div className="flex gap-3 justify-center">
              {currentLevel !== "hard" ? (
                <Button onClick={nextLevel} className="bg-gradient-to-r from-green-500 to-teal-500">
                  Next Level
                </Button>
              ) : (
                <Button onClick={() => onComplete && onComplete(200)} className="bg-gradient-to-r from-green-500 to-teal-500">
                  Complete Game
                </Button>
              )}
              <Button onClick={initializeGame} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Level
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Matching Pairs of Iman</CardTitle>
          <div className="flex gap-3">
            <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
              Moves: {moves}
            </Badge>
            <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
              {matched.length}/{levels[currentLevel].pairs.length}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {Object.keys(levels).map((level) => (
            <Badge
              key={level}
              className={`${currentLevel === level ? 'bg-white text-pink-600' : 'bg-white/20'} cursor-pointer`}
              onClick={() => {
                setCurrentLevel(level);
                setGameOver(false);
                setScore(0);
              }}
            >
              {levels[level].name}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(card.matchId);
            
            return (
              <motion.button
                key={card.id}
                whileHover={{ scale: isFlipped ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-xl text-sm font-bold transition-all p-2 ${
                  isFlipped
                    ? matched.includes(card.matchId)
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                    : "bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200"
                }`}
              >
                {isFlipped ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    {card.emoji && <span className="text-xl mb-1">{card.emoji}</span>}
                    <span className="break-words">{card.content}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Star className="w-8 h-8 text-pink-400" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={initializeGame} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Level
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

MatchingPairsOfIman.propTypes = {
  onComplete: PropTypes.func
};
