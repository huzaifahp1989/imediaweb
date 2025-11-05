import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Swords, CheckCircle2, XCircle, Clock, Send, Users, Gamepad2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const gameTypes = [
  { id: "islamic_quiz", name: "Islamic Quiz", icon: "🧠" },
  { id: "word_search", name: "Word Search", icon: "🔍" },
  { id: "memory_match", name: "Memory Match", icon: "🎴" },
  { id: "seerah", name: "Seerah Quiz", icon: "📖" },
  { id: "quran", name: "Quran Quiz", icon: "📚" },
  { id: "hadith", name: "Hadith Match", icon: "📜" }
];

export default function Challenges() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState(gameTypes[0].id);
  const [opponentEmail, setOpponentEmail] = useState("");
  const [filter, setFilter] = useState("all"); // all, sent, received, completed

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        navigate(createPageUrl("Games"));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      navigate(createPageUrl("Games"));
    }
  };

  // Fetch all users for suggestions
  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const users = await base44.entities.User.list('-points', 100);
      return users.filter(u => u.id !== user?.id && u.email);
    },
    enabled: !!user,
    initialData: [],
  });

  // Fetch challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const sentChallenges = await base44.entities.Challenge.filter({ challenger_id: user.id }, '-created_date', 100);
      const receivedChallenges = await base44.entities.Challenge.filter({ opponent_id: user.id }, '-created_date', 100);
      
      return [...sentChallenges, ...receivedChallenges];
    },
    enabled: !!user,
    initialData: [],
  });

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData) => {
      return await base44.entities.Challenge.create(challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      setShowNewChallenge(false);
      setOpponentEmail("");
    },
  });

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      return await base44.entities.Challenge.update(challengeId, { status: "accepted" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  // Decline challenge mutation
  const declineChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      return await base44.entities.Challenge.update(challengeId, { status: "declined" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const handleCreateChallenge = async () => {
    if (!opponentEmail || !user) return;

    // Find opponent by email
    const opponent = allUsers.find(u => u.email === opponentEmail);
    if (!opponent) {
      alert("User not found. Please check the email address.");
      return;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to complete

    await createChallengeMutation.mutateAsync({
      challenger_id: user.id,
      challenger_name: user.full_name || user.email,
      opponent_id: opponent.id,
      opponent_name: opponent.full_name || opponent.email,
      game_type: selectedGameType,
      status: "pending",
      expires_at: expiresAt.toISOString()
    });

    alert(`Challenge sent to ${opponent.full_name || opponent.email}!`);
  };

  const handleAcceptChallenge = async (challenge) => {
    await acceptChallengeMutation.mutateAsync(challenge.id);
    // Navigate to game with challenge ID
    navigate(createPageUrl("Games") + `?challenge=${challenge.id}`);
  };

  const handlePlayChallenge = (challenge) => {
    navigate(createPageUrl("Games") + `?challenge=${challenge.id}`);
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === "all") return true;
    if (filter === "sent") return challenge.challenger_id === user?.id;
    if (filter === "received") return challenge.opponent_id === user?.id && challenge.status === "pending";
    if (filter === "completed") return challenge.status === "completed";
    return true;
  });

  const getStatusBadge = (challenge) => {
    const isSent = challenge.challenger_id === user?.id;
    
    switch (challenge.status) {
      case "pending":
        return <Badge className="bg-yellow-500">{isSent ? "Waiting" : "New!"}</Badge>;
      case "accepted":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "declined":
        return <Badge className="bg-red-500">Declined</Badge>;
      default:
        return null;
    }
  };

  const getWinnerDisplay = (challenge) => {
    if (challenge.status !== "completed" || !challenge.winner_id) return null;
    
    const isWinner = challenge.winner_id === user?.id;
    const isDraw = challenge.challenger_score === challenge.opponent_score;

    if (isDraw) {
      return <Badge className="bg-gray-500">Draw</Badge>;
    }

    return isWinner ? (
      <Badge className="bg-green-500 flex items-center gap-1">
        <Trophy className="w-3 h-3" /> You Won!
      </Badge>
    ) : (
      <Badge className="bg-red-500">You Lost</Badge>
    );
  };

  if (!user) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Games"))}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Challenge Arena</h1>
          <p className="text-lg text-gray-600">Challenge friends and compete for glory!</p>
        </motion.div>

        {/* Create Challenge Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowNewChallenge(!showNewChallenge)}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Swords className="w-5 h-5 mr-2" />
            Send New Challenge
          </Button>
        </div>

        {/* New Challenge Form */}
        <AnimatePresence>
          {showNewChallenge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="border-2 border-purple-300 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle>Create New Challenge</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Game Type
                      </label>
                      <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {gameTypes.map(game => (
                            <SelectItem key={game.id} value={game.id}>
                              {game.icon} {game.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Opponent's Email
                      </label>
                      <Input
                        type="email"
                        value={opponentEmail}
                        onChange={(e) => setOpponentEmail(e.target.value)}
                        placeholder="friend@example.com"
                        list="users-list"
                      />
                      <datalist id="users-list">
                        {allUsers.map(u => (
                          <option key={u.id} value={u.email}>{u.full_name || u.email}</option>
                        ))}
                      </datalist>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleCreateChallenge}
                        disabled={!opponentEmail || createChallengeMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-green-500 to-teal-500"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {createChallengeMutation.isPending ? "Sending..." : "Send Challenge"}
                      </Button>
                      <Button
                        onClick={() => setShowNewChallenge(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "all", label: "All Challenges", icon: Users },
            { id: "received", label: "New Challenges", icon: Clock },
            { id: "sent", label: "Sent", icon: Send },
            { id: "completed", label: "Completed", icon: Trophy }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                variant={filter === tab.id ? "default" : "outline"}
                className={filter === tab.id ? "bg-purple-500" : ""}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Challenges List */}
        {isLoading ? (
          <div className="text-center py-12">Loading challenges...</div>
        ) : filteredChallenges.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No challenges yet. Send one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredChallenges.map((challenge, index) => {
              const isSent = challenge.challenger_id === user.id;
              const opponent = isSent ? challenge.opponent_name : challenge.challenger_name;
              const gameType = gameTypes.find(g => g.id === challenge.game_type);
              const isExpired = new Date(challenge.expires_at) < new Date();

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-3xl">{gameType?.icon}</div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">
                                {gameType?.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {isSent ? "vs" : "from"} {opponent}
                              </p>
                            </div>
                          </div>

                          {challenge.status === "completed" && (
                            <div className="flex gap-4 mt-3 text-sm">
                              <div className="bg-blue-50 px-3 py-2 rounded-lg">
                                <span className="text-gray-600">Your score: </span>
                                <span className="font-bold text-blue-600">
                                  {isSent ? challenge.challenger_score : challenge.opponent_score}
                                </span>
                              </div>
                              <div className="bg-purple-50 px-3 py-2 rounded-lg">
                                <span className="text-gray-600">Their score: </span>
                                <span className="font-bold text-purple-600">
                                  {isSent ? challenge.opponent_score : challenge.challenger_score}
                                </span>
                              </div>
                            </div>
                          )}

                          {isExpired && challenge.status === "pending" && (
                            <Badge className="bg-gray-500 mt-2">Expired</Badge>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(challenge)}
                          {getWinnerDisplay(challenge)}

                          {/* Action Buttons */}
                          {challenge.status === "pending" && !isSent && !isExpired && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                onClick={() => handleAcceptChallenge(challenge)}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                onClick={() => declineChallengeMutation.mutate(challenge.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}

                          {challenge.status === "accepted" && (
                            <Button
                              onClick={() => handlePlayChallenge(challenge)}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 mt-2"
                            >
                              <Gamepad2 className="w-4 h-4 mr-1" />
                              Play Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}