import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi, watchAuth, getUserProfile } from "@/api/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Star, TrendingUp, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Watch Firebase auth and load current user's profile
  useEffect(() => {
    const stop = watchAuth(async (u) => {
      const authed = !!u;
      setIsAuthenticated(authed);
      if (authed) {
        try {
          const profile = await getUserProfile(u.uid);
          setCurrentUser(profile ? { id: u.uid, ...profile } : { id: u.uid, email: u.email, points: 0 });
        } catch {
          setCurrentUser({ id: u.uid, email: u.email, points: 0 });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => { try { stop?.(); } catch {} };
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboard-users'],
    queryFn: async () => {
      try {
        const list = await usersApi.list();
        // Sort by points descending
        return list.sort((a, b) => (Number(b.points || 0) - Number(a.points || 0)));
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />;
      case 1:
        return <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />;
      default:
        return <span className="text-lg sm:text-2xl font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return "from-amber-400 to-amber-600";
      case 1:
        return "from-gray-300 to-gray-500";
      case 2:
        return "from-amber-500 to-amber-700";
      default:
        return "from-blue-100 to-purple-100";
    }
  };

  const getDisplayName = (user) => {
    const name = user.fullName || user.full_name || user.name || '';
    if (name) {
      const firstName = name.split(' ')[0];
      return firstName;
    }
    return user.email?.split('@')[0] || 'Anonymous';
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="text-5xl sm:text-6xl mb-4">🏆</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Top Young Learners
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-2">
            These amazing kids are learning and earning points!
          </p>
        </motion.div>

        {/* Optional: Show gentle prompt for guests (not blocking) */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-4 sm:p-6 text-center">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 text-blue-600" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Want to See Your Name Here?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                  Join Islam Kids Zone to earn points, compete with friends, and climb the leaderboard!
                </p>
                <Button
                  onClick={() => {
                    const subject = encodeURIComponent("Access Request - Islam Kids Zone");
                    const body = encodeURIComponent("Hi, I'd like to create an account to join the leaderboard. My name is ____ and my contact details are ____.");
                    window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Request Access via Email
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Show current user stats if authenticated */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="border-2 border-blue-300 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="text-3xl sm:text-4xl flex-shrink-0">{currentUser.avatar || "🌟"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500">Your Progress</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{getDisplayName(currentUser)}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                        <span className="font-semibold text-amber-600 text-sm sm:text-base">{currentUser.points || 0} points</span>
                        {currentUser.madrasah_maktab && (
                          <>
                            <span className="text-gray-400 hidden xs:inline">•</span>
                            <span className="text-xs sm:text-sm text-gray-600 truncate">🕌 {currentUser.madrasah_maktab}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1" />
                    <p className="text-xs sm:text-sm text-gray-500">Keep going!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">All-Time Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 sm:p-12 text-center text-gray-500">Loading leaderboard...</div>
            ) : users.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-gray-500">
                <Star className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p>No learners yet. Be the first to earn points!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {users.map((user, index) => (
                  <motion.div
                    key={user.uid || user.id || `${user.email || user.full_name || 'user'}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                      currentUser?.id && (currentUser.id === (user.uid || user.id)) ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Rank Icon */}
                      <div className="w-12 sm:w-16 flex justify-center flex-shrink-0">
                        {getRankIcon(index)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4">
                        {/* Avatar */}
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${getRankBg(index)} flex items-center justify-center text-xl sm:text-2xl shadow-lg flex-shrink-0`}>
                          {user.avatar || "👤"}
                        </div>
                        
                        {/* Name and Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2 flex-wrap">
                            <span className="truncate">{getDisplayName(user)}</span>
                            {currentUser?.id && (currentUser.id === (user.uid || user.id)) && (
                              <Badge className="bg-blue-500 text-xs flex-shrink-0">You</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                            {user.city && (
                              <span className="truncate">{user.city}</span>
                            )}
                            {user.madrasah_maktab && (
                              <>
                                {user.city && <span className="hidden xs:inline">•</span>}
                                <span className="flex items-center gap-1 truncate">
                                  <span className="text-sm sm:text-base">🕌</span>
                                  <span className="truncate">{user.madrasah_maktab}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-bold text-amber-600">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
                          <span>{Number(user.points || 0)}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
 
