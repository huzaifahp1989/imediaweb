import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Save, Settings, TrendingUp, Award, AlertCircle, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

const defaultGames = [
  { game_id: "word_scramble", game_name: "Word Scramble Challenge", emoji: "🔤" },
  { game_id: "quest_for_ilm", game_name: "The Quest for Ilm", emoji: "🗺️" },
  { game_id: "sahabah_arena", game_name: "Sahabah Arena", emoji: "⚔️" },
  { game_id: "matching_pairs_iman", game_name: "Matching Pairs of Iman", emoji: "🧩" },
  { game_id: "maze_of_guidance", game_name: "Maze of Guidance", emoji: "🧭" },
  { game_id: "ayat_explorer", game_name: "Ayat Explorer", emoji: "📚" },
  { game_id: "islamic_quiz", game_name: "Islamic Knowledge Quiz", emoji: "🧠" },
  { game_id: "word_search", game_name: "Islamic Word Search", emoji: "🔍" },
  { game_id: "seerah_game", game_name: "Seerah Quiz", emoji: "📖" },
  { game_id: "quran_game", game_name: "Quran Quiz", emoji: "📚" },
  { game_id: "hadith_game", game_name: "Hadith Match", emoji: "📜" },
  { game_id: "fiqh_game", game_name: "Fiqh Challenge", emoji: "🕌" },
  { game_id: "memory_match", game_name: "Islamic Memory Match", emoji: "🎴" }
];

export default function AdminGameSettings() {
  // Email-only mode: disable admin panel and show CTA
  const subject = encodeURIComponent("Admin Access Request - Game Settings");
  const body = encodeURIComponent("Hi, I'd like admin access to manage game settings on Islam Kids Zone. My name is ____ and my contact details are ____.");

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-4">
              The Game Settings admin panel is disabled in this email-only mode. Please request admin access.
            </p>
            <Button
              onClick={() => {
                window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Request Admin Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingSettings, setEditingSettings] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        navigate("/");
        return;
      }
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        navigate("/");
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate("/");
    }
  };

  const { data: gameSettings = [], isLoading } = useQuery({
    queryKey: ['game-settings'],
    queryFn: async () => {
      const settings = await base44.entities.GameSettings.list();
      
      // Initialize settings for any games that don't have them yet
      const existingGameIds = settings.map(s => s.game_id);
      const missingGames = defaultGames.filter(g => !existingGameIds.includes(g.game_id));
      
      if (missingGames.length > 0) {
        await Promise.all(
          missingGames.map(game => 
            base44.entities.GameSettings.create({
              game_id: game.game_id,
              game_name: game.game_name,
              points_per_game: 10,
              perfect_score_bonus: 5,
              is_active: true,
              min_points: 5,
              max_points: 20
            })
          )
        );
        return await base44.entities.GameSettings.list();
      }
      
      return settings;
    },
    enabled: !!user
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GameSettings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  });

  const handleFieldChange = (gameId, field, value) => {
    setEditingSettings(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        [field]: value
      }
    }));
  };

  const handleSave = async (setting) => {
    const updates = editingSettings[setting.game_id] || {};
    if (Object.keys(updates).length === 0) return;

    await updateSettingMutation.mutateAsync({
      id: setting.id,
      data: updates
    });
    
    setEditingSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[setting.game_id];
      return newSettings;
    });
  };

  const getCurrentValue = (setting, field) => {
    return editingSettings[setting.game_id]?.[field] ?? setting[field];
  };

  const hasChanges = (gameId) => {
    return editingSettings[gameId] && Object.keys(editingSettings[gameId]).length > 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading game settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Game Settings</h1>
              <p className="text-gray-600">Manage points and settings for all games</p>
            </div>
            {saveSuccess && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved Successfully!
              </Badge>
            )}
          </div>
        </motion.div>

        <div className="grid gap-6">
          {gameSettings.map((setting, index) => {
            const game = defaultGames.find(g => g.game_id === setting.game_id);
            const isEdited = hasChanges(setting.game_id);
            
            return (
              <motion.div
                key={setting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-2 ${isEdited ? 'border-blue-400 shadow-lg' : 'border-gray-200'}`}>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{game?.emoji || '🎮'}</div>
                        <div>
                          <CardTitle className="text-xl">{setting.game_name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">Game ID: {setting.game_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {isEdited && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">
                            Unsaved Changes
                          </Badge>
                        )}
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${setting.id}`}>Active</Label>
                          <Switch
                            id={`active-${setting.id}`}
                            checked={getCurrentValue(setting, 'is_active')}
                            onCheckedChange={(checked) => handleFieldChange(setting.game_id, 'is_active', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <Label htmlFor={`points-${setting.id}`} className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          Points Per Game
                        </Label>
                        <Input
                          id={`points-${setting.id}`}
                          type="number"
                          value={getCurrentValue(setting, 'points_per_game')}
                          onChange={(e) => handleFieldChange(setting.game_id, 'points_per_game', parseInt(e.target.value))}
                          className="text-center font-bold text-lg"
                          min={getCurrentValue(setting, 'min_points')}
                          max={getCurrentValue(setting, 'max_points')}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`bonus-${setting.id}`} className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Perfect Score Bonus
                        </Label>
                        <Input
                          id={`bonus-${setting.id}`}
                          type="number"
                          value={getCurrentValue(setting, 'perfect_score_bonus')}
                          onChange={(e) => handleFieldChange(setting.game_id, 'perfect_score_bonus', parseInt(e.target.value))}
                          className="text-center font-bold text-lg"
                          min={0}
                          max={20}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`min-${setting.id}`} className="mb-2 block">
                          Min Points
                        </Label>
                        <Input
                          id={`min-${setting.id}`}
                          type="number"
                          value={getCurrentValue(setting, 'min_points')}
                          onChange={(e) => handleFieldChange(setting.game_id, 'min_points', parseInt(e.target.value))}
                          className="text-center"
                          min={0}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`max-${setting.id}`} className="mb-2 block">
                          Max Points
                        </Label>
                        <Input
                          id={`max-${setting.id}`}
                          type="number"
                          value={getCurrentValue(setting, 'max_points')}
                          onChange={(e) => handleFieldChange(setting.game_id, 'max_points', parseInt(e.target.value))}
                          className="text-center"
                          min={getCurrentValue(setting, 'min_points')}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-gray-700">
                          <strong>Total Possible:</strong> {getCurrentValue(setting, 'points_per_game')} + {getCurrentValue(setting, 'perfect_score_bonus')} bonus = <span className="text-blue-600 font-bold">{getCurrentValue(setting, 'points_per_game') + getCurrentValue(setting, 'perfect_score_bonus')} points</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => handleSave(setting)}
                        disabled={!isEdited}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="mt-8 border-2 border-amber-300 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Important Notes:</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Changes take effect immediately for all new games played</li>
                  <li>• User points are capped at 1500 total regardless of individual game settings</li>
                  <li>• Perfect score bonus is only awarded when users get 100% correct</li>
                  <li>• Deactivating a game will hide it from the Games page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
