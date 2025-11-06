
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";

const islamicPairs = [
  { id: 1, text: "Allah", emoji: "✨" },
  { id: 2, text: "Muhammad ﷺ", emoji: "🕌" },
  { id: 3, text: "Quran", emoji: "📖" },
  { id: 4, text: "Salah", emoji: "🤲" },
  { id: 5, text: "Jannah", emoji: "🌸" },
  { id: 6, text: "Ramadan", emoji: "🌙" },
  { id: 7, text: "Kaaba", emoji: "🕋" },
  { id: 8, text: "Zakat", emoji: "💝" }
];

export default function MemoryMatchGame({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
    initializeGame();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      console.log("User not authenticated", error);
    }
  };

  const initializeGame = () => {
    const duplicatedCards = [...islamicPairs, ...islamicPairs].map((card, index) => ({
      ...card,
      uniqueId: index
    }));
    
    const shuffled = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameOver(false);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].id)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].id === cards[second].id) {
        setMatched([...matched, cards[first].id]);
        setFlipped([]);
        
        if (matched.length + 1 === islamicPairs.length) {
          completeGame();
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const completeGame = async () => {
    setGameOver(true);
    const fallbackScore = Math.max(100 - moves * 2, 20);
    let awarded = fallbackScore;
    
    if (user) {
      try {
        awarded = await awardPointsForGame(user, "memory_match", { fallbackScore });
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }

    if (onComplete) {
      setTimeout(() => onComplete(awarded), 2000);
    }
  };

  if (gameOver) {
    const score = Math.max(100 - moves * 2, 20);
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Masha'Allah! 🎉</h2>
            <p className="text-xl text-gray-600 mb-4">You found all pairs!</p>
            <p className="text-5xl font-bold text-green-600 mb-2">{score}</p>
            <p className="text-gray-600 mb-6">Points earned in {moves} moves</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={initializeGame} className="bg-gradient-to-r from-green-500 to-teal-500">
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

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Islamic Memory Match</CardTitle>
          <div className="flex gap-3">
            <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
              Moves: {moves}
            </Badge>
            <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
              {matched.length}/{islamicPairs.length}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(card.id);
            
            return (
              <motion.button
                key={card.uniqueId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-xl text-2xl font-bold transition-all duration-300 ${
                  isFlipped
                    ? matched.includes(card.id)
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                    : "bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200"
                }`}
              >
                {isFlipped ? (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl">{card.emoji}</span>
                    <span className="text-xs">{card.text}</span>
                  </div>
                ) : (
                  <span className="text-4xl">?</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={initializeGame} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
