
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const emojis = ["🕌", "📿", "📖", "🌙", "⭐", "🤲", "☪️", "🕋"];

export default function MemoryGame({ onComplete }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeGame();
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

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, matched: false }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameCompleted(false);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          completeGame();
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const completeGame = async () => {
    setGameCompleted(true);
    const score = Math.max(20 - moves * 2, 10);
    
    if (user) {
      try {
        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "memory",
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
    const score = Math.max(20 - moves * 2, 10);
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-amber-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Masha'Allah! 🎉
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              You earned <span className="font-bold text-amber-600">{score} points!</span>
            </p>
            <p className="text-gray-500">Completed in {moves} moves</p>
            <Button onClick={initializeGame} className="mt-6">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Memory Match Game</CardTitle>
          <div className="flex items-center gap-4">
            <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
              <span className="font-bold text-white">Moves: {moves}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={initializeGame}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Monthly Prize Banner */}
        <div className="mt-4 bg-white text-gray-900 p-3 rounded-lg text-center text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span>Monthly Prize Competition! Accumulate points to win!</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            
            return (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 ${
                    isFlipped
                      ? "bg-gradient-to-br from-blue-400 to-purple-400"
                      : "bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
                  } flex items-center justify-center text-5xl shadow-lg`}
                >
                  <AnimatePresence mode="wait">
                    {isFlipped ? (
                      <motion.span
                        key="emoji"
                        initial={{ rotateY: -90 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: 90 }}
                      >
                        {card.emoji}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="back"
                        initial={{ rotateY: -90 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: 90 }}
                        className="text-3xl"
                      >
                        🌟
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
