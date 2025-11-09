
import React, { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Star, Medal, Crown, ArrowLeft, Gamepad2, Users, Gift, LogIn, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Lazy load game components
const WordScrambleGame = lazy(() => import("../components/games/WordScrambleGame"));
const IslamicQuizGame = lazy(() => import("../components/games/IslamicQuizGame"));
const IslamicWordSearchGame = lazy(() => import("../components/games/IslamicWordSearchGame"));
const SeerahGame = lazy(() => import("../components/games/SeerahGame"));
const QuranGame = lazy(() => import("../components/games/QuranGame"));
const HadithGame = lazy(() => import("../components/games/HadithGame"));
const FiqhGame = lazy(() => import("../components/games/FiqhGame"));
const MemoryMatchGame = lazy(() => import("../components/games/MemoryMatchGame"));
const QuestForIlm = lazy(() => import("../components/games/QuestForIlm"));
const MatchingPairsOfIman = lazy(() => import("../components/games/MatchingPairsOfIman"));
const SahabahArena = lazy(() => import("../components/games/SahabahArena"));
const MazeOfGuidance = lazy(() => import("../components/games/MazeOfGuidance"));
const AyatExplorer = lazy(() => import("../components/games/AyatExplorer"));
const AkhlaqChallengeGame = lazy(() => import("../components/games/AkhlaqChallengeGame"));
const DailySunnahGame = lazy(() => import("../components/games/DailySunnahGame"));
const IslamKnowledgeRaceGame = lazy(() => import("../components/games/IslamKnowledgeRaceGame"));
const IslamicCrosswordGame = lazy(() => import("../components/games/IslamicCrosswordGame"));
const IslamicMoralsMazeGame = lazy(() => import("../components/games/IslamicMoralsMazeGame"));
const ProphetStoriesGame = lazy(() => import("../components/games/ProphetStoriesGame"));
const QuranMemoryMatchGame = lazy(() => import("../components/games/QuranMemoryMatchGame"));
const QuranQuestGame = lazy(() => import("../components/games/QuranQuestGame"));
const SacredSitesJigsaw = lazy(() => import("../components/games/SacredSitesJigsaw"));
const SahabahStoriesGame = lazy(() => import("../components/games/SahabahStoriesGame"));
const SeerahAdventureGame = lazy(() => import("../components/games/SeerahAdventureGame"));
const SpinToWinWheel = lazy(() => import("../components/games/SpinToWinWheel"));

const gamesList = [
  {
    id: "word_scramble",
    title: "🔤 Word Scramble Challenge",
    description: "Unscramble Islamic words - Easy, Medium & Hard!",
    emoji: "🔤",
    difficulty: "All Levels",
    points: "10 pts per game",
    allowPoints: true,
    allowPrizes: false,
    component: WordScrambleGame
  },
  {
    id: "matching_pairs_iman",
    title: "🧩 Matching Pairs of Iman",
    description: "Match Islamic concepts and terms to strengthen your Iman!",
    emoji: "🧩",
    difficulty: "All Levels",
    points: "10 pts per game",
    allowPoints: true,
    allowPrizes: false,
    component: MatchingPairsOfIman
  },
  {
    id: "ayat_explorer",
    title: "📚 Ayat Explorer",
    description: "Explore Quranic knowledge through puzzles!",
    emoji: "📚",
    difficulty: "Medium",
    points: "10 pts per game",
    component: AyatExplorer
  },
  {
    id: "islamic_quiz",
    title: "🧠 Islamic Knowledge Quiz",
    description: "Test your knowledge of Quran, Hadith, Seerah & more!",
    emoji: "🧠",
    difficulty: "All Levels",
    points: "10 pts per game",
    component: IslamicQuizGame
  },
  {
    id: "word_search",
    title: "🔍 Islamic Word Search",
    description: "Find Islamic words hidden in the grid",
    emoji: "🔍",
    difficulty: "All Levels",
    points: "10 pts per game",
    component: IslamicWordSearchGame
  },
  {
    id: "seerah_game",
    title: "📖 Seerah Quiz",
    description: "Learn about the life of Prophet Muhammad ﷺ",
    emoji: "📖",
    difficulty: "All Levels",
    points: "10 pts per game",
    component: SeerahGame
  },
  {
    id: "quran_game",
    title: "📚 Quran Quiz",
    description: "Test your knowledge of the Holy Quran",
    emoji: "📚",
    difficulty: "All Levels",
    points: "10 pts per game",
    component: QuranGame
  },
  {
    id: "hadith_game",
    title: "📜 Hadith Match",
    description: "Learn authentic sayings of Prophet ﷺ",
    emoji: "📜",
    difficulty: "All Levels",
    points: "10 pts per game",
    component: HadithGame
  },
  {
    id: "fiqh_game",
    title: "🕌 Fiqh Challenge",
    description: "Learn Islamic rulings and practices",
    emoji: "🕌",
    difficulty: "All Levels",
    points: "10 pts per game",
    component: FiqhGame
  },
  {
    id: "memory_match",
    title: "🎴 Islamic Memory Match",
    description: "Match pairs of Islamic terms",
    emoji: "🎴",
    difficulty: "All Levels",
    points: "10 pts per game",
    component: MemoryMatchGame
  }
];

const GameLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="text-6xl mb-4 animate-bounce">🎮</div>
      <p className="text-gray-600 font-medium">Loading game...</p>
    </div>
  </div>
);

export default function Games() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showMonthlyLeaderboard, setShowMonthlyLeaderboard] = useState(false);

  useEffect(() => {
    // Local-only authentication logic
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, [navigate]);

  const { data: monthlyLeaderboard = [] } = useQuery({
    queryKey: ['monthly-leaderboard'],
    queryFn: async () => {
      // Local-only leaderboard logic
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Get scores from localStorage
      const scores = JSON.parse(localStorage.getItem('gameScores') || '[]');
      const monthlyScores = scores.filter(score => new Date(score.created_date) >= firstDayOfMonth);
      const userScores = {};
      monthlyScores.forEach(score => {
        if (!userScores[score.user_id]) {
          userScores[score.user_id] = { user_id: score.user_id, total_score: 0, games_played: 0 };
        }
        userScores[score.user_id].total_score += score.score || 0;
        userScores[score.user_id].games_played += 1;
      });
      // Get user info from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIds = Object.keys(userScores);
      const usersWithMonthlyScores = userIds.map(userId => {
        const userInfo = users.find(u => u.id === userId) || { id: userId, name: 'Guest' };
        return {
          ...userInfo,
          monthly_score: userScores[userId].total_score,
          monthly_games: userScores[userId].games_played
        };
      });
      return usersWithMonthlyScores
        .filter(u => u.monthly_score > 0)
        .sort((a, b) => b.monthly_score - a.monthly_score)
        .slice(0, 10);
    },
    enabled: isAuthenticated,
    initialData: [],
  });

  const { data: leaderboardUsers = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Local-only leaderboard logic
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.filter(u => u.points > 0).sort((a, b) => b.points - a.points).slice(0, 10);
    },
    enabled: isAuthenticated,
    initialData: [],
  });

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleGameComplete = async (score) => {
    if (isAuthenticated && user && selectedGame) {
      try {
        // Save score to localStorage
        const gameScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
        gameScores.push({
          user_id: user.id,
          game_type: selectedGame.id,
          score: score,
          created_date: new Date().toISOString()
        });
        localStorage.setItem('gameScores', JSON.stringify(gameScores));
        // Update user points
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        let newTotalPoints = Math.min((user.points || 0) + score, 1500);
        if (idx !== -1) {
          users[idx].points = newTotalPoints;
          localStorage.setItem('users', JSON.stringify(users));
        }
        setUser(prevUser => ({ ...prevUser, points: newTotalPoints }));
      } catch (error) {
        console.error("Error saving game score:", error);
      }
    }
    setTimeout(() => setSelectedGame(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <p className="text-gray-600 font-medium">Loading games...</p>
        </div>
      </div>
    );
  }

  const GameComponent = selectedGame?.component;

  if (selectedGame) {
    return (
      <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedGame(null)}
            className="mb-6 bg-white/80 backdrop-blur-sm hover:bg-white"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
          <Suspense fallback={<GameLoader />}>
            {GameComponent && <GameComponent onComplete={handleGameComplete} />}
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            🎮
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Knowledge Games
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Play fun games and test your Islamic knowledge!
            {isAuthenticated 
              ? " Each game earns you 10 points." 
              : " Email us at imediac786@gmail.com to create your account and track your progress!"}
          </p>
        </motion.div>

        {/* Guest User Prompt - Encourage signup */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <Card className="border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🎉 Playing as Guest
                </h3>
                <p className="text-gray-600 mb-4">
                  You can play all games for free! Email us to create your account, track your progress, earn points, and compete on the leaderboard.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      const subject = encodeURIComponent("Access Request - Islam Kids Zone");
                      const body = encodeURIComponent("Hi, I'd like to create an account for Islam Kids Zone. My name is ____ and my contact details are ____.");
                      window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow hover:scale-105 transition-transform"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Request Access via Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Show leaderboard and monthly champions only for authenticated users */}
        {isAuthenticated && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              <Button
                onClick={() => setShowMonthlyLeaderboard(!showMonthlyLeaderboard)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Monthly Champions
              </Button>
              <Link to={createPageUrl("Challenges")}>
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Challenge Friends
                </Button>
              </Link>
            </motion.div>

            <AnimatePresence>
              {showMonthlyLeaderboard && monthlyLeaderboard.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12 max-w-xl mx-auto"
                >
                  <Card className="border-2 border-purple-300 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                      <CardTitle className="text-2xl flex items-center gap-2 justify-center">
                        <Trophy className="w-6 h-6" />
                        Monthly Champions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                      <div className="space-y-3">
                        {monthlyLeaderboard.slice(0, 10).map((player, index) => {
                          const medals = [
                            { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50" },
                            { icon: Medal, color: "text-gray-400", bg: "bg-gray-50" },
                            { icon: Medal, color: "text-orange-600", bg: "bg-orange-50" }
                          ];
                          const medal = medals[index];
                          const Icon = medal?.icon || Star;
                          
                          return (
                            <motion.div
                              key={player.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-center gap-3 p-3 rounded-xl ${medal?.bg || 'bg-white'} border-2 ${index === 0 ? 'border-amber-400' : 'border-gray-200'}`}
                            >
                              <div className={`w-8 h-8 rounded-full ${medal?.bg || 'bg-blue-50'} flex items-center justify-center ${medal?.color || 'text-gray-600'}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-sm text-gray-900">
                                  {player.full_name || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {player.monthly_games} games this month
                                </p>
                              </div>
                              <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                                <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                                <span className="font-bold text-sm text-purple-900">{player.monthly_score}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-4 border-amber-400 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏆</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Win Prizes Every Month!
                  </h3>
                  <p className="text-gray-800 font-medium">
                    Play games, earn points, compete! Top 3 players win prizes!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {leaderboardUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-500" />
                    Top Players (All Time)
                  </CardTitle>
                  <Button
                    onClick={() => navigate(createPageUrl("Leaderboard"))}
                    variant="outline"
                    size="sm"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardUsers.slice(0, 3).map((player, index) => {
                    const medals = [
                      { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50" },
                      { icon: Medal, color: "text-gray-400", bg: "bg-gray-50" },
                      { icon: Medal, color: "text-orange-600", bg: "bg-orange-50" }
                    ];
                    const medal = medals[index];
                    const Icon = medal?.icon || Star;
                    
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl ${medal?.bg || 'bg-white'} border-2 ${index === 0 ? 'border-amber-400' : 'border-gray-200'}`}
                      >
                        <div className={`w-10 h-10 rounded-full ${medal?.bg || 'bg-blue-50'} flex items-center justify-center ${medal?.color || 'text-gray-600'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-base text-gray-900">
                            {player.full_name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {player.city || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                          <span className="font-bold text-sm text-amber-900">{player.points}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-12 text-white shadow-2xl"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Gamepad2 className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{gamesList.length}</div>
              <div className="text-sm text-blue-100">Games</div>
            </div>
            <div>
              <Star className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{user?.points || 0}</div>
              <div className="text-sm text-blue-100">Your Points</div>
            </div>
            <div>
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{user?.badges?.length || 0}</div>
              <div className="text-sm text-blue-100">Badges</div>
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-semibold mb-2 flex items-center justify-center gap-2">
                <Gift className="w-4 h-4" />
                Daily Challenge: Complete all {gamesList.length} games for +10 bonus points!
              </p>
              <div className="text-xs text-blue-100 text-center">
                Perfect score on any game = +5 bonus points 🌟
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <AnimatePresence>
            {gamesList.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-2 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="flex justify-between items-start mb-2">
                      <motion.div 
                        className="text-5xl"
                        whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {game.emoji}
                      </motion.div>
                      <Badge className="bg-amber-500 hover:bg-amber-600">
                        {game.points}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {game.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{game.description}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">{game.difficulty}</Badge>
                      <Button
                        onClick={() => handleGameSelect(game)}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        Play Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}