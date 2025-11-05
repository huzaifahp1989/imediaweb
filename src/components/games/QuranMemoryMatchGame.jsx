import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, RotateCcw, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ayahPairs = [
  {
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    english: "In the name of Allah, Most Gracious, Most Merciful",
    id: "bismillah"
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    english: "All praise is due to Allah, Lord of the worlds",
    id: "alhamdulillah"
  },
  {
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    english: "You alone we worship, and You alone we ask for help",
    id: "iyyaka"
  },
  {
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    english: "Say: He is Allah, the One",
    id: "qul"
  },
  {
    arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ",
    english: "I created jinn and humans only to worship Me",
    id: "khalaqtu"
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    english: "Indeed, with hardship comes ease",
    id: "yusr"
  }
];

export default function QuranMemoryMatchGame({ onComplete }) {
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
    const gameCards = [];
    ayahPairs.forEach((pair, index) => {
      gameCards.push({
        id: `${pair.id}-arabic`,
        content: pair.arabic,
        type: "arabic",
        pairId: pair.id,
        index: index * 2
      });
      gameCards.push({
        id: `${pair.id}-english`,
        content: pair.english,
        type: "english",
        pairId: pair.id,
        index: index * 2 + 1
      });
    });
    
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
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
      
      const card1 = cards[newFlipped[0]];
      const card2 = cards[newFlipped[1]];

      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
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
    const score = Math.max(120 - moves * 3, 50);
    
    if (user) {
      try {
        await base44.entities.GameScore.create({
          user_id: user.id,
          game_type: "quran_memory",
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

  if (gameCompleted) {
    const score = Math.max(120 - moves * 3, 50);
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-green-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Masha'Allah! 📖
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              You earned <span className="font-bold text-green-600">{score} points!</span>
            </p>
            <p className="text-gray-500">Completed in {moves} moves</p>
            <Button onClick={initializeGame} className="mt-6 bg-green-600 hover:bg-green-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <span className="text-3xl">📖</span>
            Qur'an Memory Match
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="font-bold">Moves: {moves}</span>
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
        <p className="text-sm mt-2">Match Arabic Ayahs with their English meanings</p>
      </CardHeader>

      <CardContent className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index) || matched.includes(index);
            const isMatched = matched.includes(index);

            return (
              <motion.div
                key={card.id}
                whileHover={{ scale: isFlipped ? 1 : 1.05 }}
                whileTap={{ scale: isFlipped ? 1 : 0.95 }}
              >
                <div
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-xl cursor-pointer transition-all duration-500 transform ${
                    isFlipped ? "rotate-y-180" : ""
                  } ${
                    isMatched
                      ? "bg-gradient-to-br from-green-400 to-emerald-400"
                      : isFlipped
                      ? "bg-gradient-to-br from-blue-400 to-purple-400"
                      : "bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
                  } flex items-center justify-center p-4 shadow-lg`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                  }}
                >
                  <div
                    className="text-center"
                    style={{
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}
                  >
                    {isFlipped ? (
                      <div className="text-white">
                        <p className={`font-bold ${
                          card.type === "arabic" 
                            ? "text-2xl leading-relaxed" 
                            : "text-sm"
                        }`}>
                          {card.content}
                        </p>
                      </div>
                    ) : (
                      <span className="text-4xl">🌟</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          💡 Match each Arabic Ayah with its English meaning
        </div>
      </CardContent>
    </Card>
  );
}