
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Trophy, 
  Star, 
  CheckCircle2, 
  Lock, 
  PlayCircle,
  Gamepad2,
  Headphones,
  Video,
  Award,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  X,
  LogIn
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  quran: "from-green-500 to-teal-500",
  hadith: "from-blue-500 to-cyan-500",
  seerah: "from-purple-500 to-pink-500",
  fiqh: "from-amber-500 to-orange-500",
  akhlaq: "from-rose-500 to-red-500",
  prophets: "from-indigo-500 to-blue-500",
  comprehensive: "from-violet-500 to-purple-500"
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800"
};

const moduleIcons = {
  game: Gamepad2,
  story: BookOpen,
  video: Video,
  audio: Headphones,
  quiz: Target,
  reading: BookOpen
};

// Map resource IDs to actual game/page routes
const resourceRoutes = {
  islamic_quiz: "Games",
  seerah_game: "Games",
  quran_game: "Games",
  word_search: "Games",
  ayat_explorer: "Games",
  memory_match: "Games",
  hadith_game: "Games",
  sahabah_arena: "Games",
  fiqh_game: "Games",
  matching_pairs_iman: "Games",
  maze_of_guidance: "Games",
  quest_for_ilm: "Games",
};

export default function LearningPaths() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      console.log("User not authenticated");
      setIsAuthenticated(false);
    }
  };

  // Fetch learning paths
  const { data: paths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      const allPaths = await base44.entities.LearningPath.list('order');
      return allPaths;
    },
    initialData: [],
  });

  // Fetch user progress
  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-path-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const progress = await base44.entities.UserPathProgress.filter({ user_id: user.id });
      return progress;
    },
    enabled: !!user,
    initialData: [],
  });

  // Start path mutation
  const startPathMutation = useMutation({
    mutationFn: async (pathId) => {
      return await base44.entities.UserPathProgress.create({
        user_id: user.id,
        path_id: pathId,
        status: "in_progress",
        started_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-path-progress'] });
    }
  });

  // Complete module mutation
  const completeModuleMutation = useMutation({
    mutationFn: async ({ progressId, moduleId, path }) => {
      const progress = userProgress.find(p => p.id === progressId);
      const completedModules = [...(progress.completed_modules || []), moduleId];
      const completionPercentage = Math.round((completedModules.length / path.modules.length) * 100);
      const isCompleted = completionPercentage === 100;

      const updateData = {
        completed_modules: completedModules,
        completion_percentage: completionPercentage,
        current_module_index: completedModules.length,
        ...(isCompleted && {
          status: "completed",
          completed_date: new Date().toISOString()
        })
      };

      await base44.entities.UserPathProgress.update(progressId, updateData);

      // Award completion bonus if path is completed
      if (isCompleted && user) {
        const newPoints = Math.min((user.points || 0) + (path.completion_points || 50), 1500);
        const newBadges = [...(user.badges || [])];
        if (!newBadges.includes(path.completion_badge)) {
          newBadges.push(path.completion_badge);
        }
        
        await base44.auth.updateMe({
          points: newPoints,
          badges: newBadges
        });
      }

      return { isCompleted, completionPercentage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-path-progress'] });
      loadUser(); // Reload user to get updated points and badges
    }
  });

  const getPathProgress = (pathId) => {
    return userProgress.find(p => p.path_id === pathId);
  };

  const handleStartPath = async (path) => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    const progress = getPathProgress(path.id);
    if (!progress) {
      await startPathMutation.mutateAsync(path.id);
    }
    setSelectedPath(path);
  };

  const handleModuleClick = (module, path) => {
    // Simply navigate to Games page - all games are accessible there
    navigate(createPageUrl("Games"));
  };

  const handleMarkModuleComplete = async (module, path) => {
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    
    const progress = getPathProgress(path.id);
    if (!progress) {
      // Need to start the path first
      await startPathMutation.mutateAsync(path.id);
      // Wait for query cache to update and then find the new progress, or refetch
      // Invalidate queries to ensure `userProgress` is fresh
      await queryClient.invalidateQueries({ queryKey: ['user-path-progress'] });
      // Re-fetch progress to get the newly created entry
      const updatedUserProgress = await base44.entities.UserPathProgress.filter({ 
        user_id: user.id, 
        path_id: path.id 
      });
      if (updatedUserProgress.length === 0) return;
      
      await completeModuleMutation.mutateAsync({
        progressId: updatedUserProgress[0].id,
        moduleId: module.id,
        path: path
      });
    } else {
      const isAlreadyCompleted = progress.completed_modules?.includes(module.id);
      if (isAlreadyCompleted) return;

      await completeModuleMutation.mutateAsync({
        progressId: progress.id,
        moduleId: module.id,
        path: path
      });
    }
  };

  const categories = [
    { id: "all", name: "All Paths", icon: "📚" },
    { id: "quran", name: "Quran", icon: "📖" },
    { id: "hadith", name: "Hadith", icon: "📜" },
    { id: "seerah", name: "Seerah", icon: "🕌" },
    { id: "fiqh", name: "Fiqh", icon: "🤲" },
    { id: "akhlaq", name: "Akhlaq", icon: "💎" },
    { id: "prophets", name: "Prophets", icon: "✨" },
    { id: "comprehensive", name: "Complete", icon: "🎓" }
  ];

  const filteredPaths = selectedCategory === "all" 
    ? paths 
    : paths.filter(p => p.category === selectedCategory);

  if (pathsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-gray-600">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="text-5xl sm:text-6xl mb-4">🎓</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Learning Paths
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Follow structured learning journeys to master Islamic knowledge. Complete paths to earn special badges and bonus points!
          </p>
        </motion.div>

        {/* Login Prompt for Guests */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6 text-center">
                <LogIn className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Track Your Learning Journey
                </h3>
                <p className="text-gray-600 mb-4">
                  Sign in to save your progress, earn badges, and unlock achievements!
                </p>
                <Button
                  onClick={() => {}}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Track Progress
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User Stats */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-purple-300 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {userProgress.filter(p => p.status === "in_progress").length}
                    </div>
                    <div className="text-sm text-gray-600">Active Paths</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-green-600">
                      {userProgress.filter(p => p.status === "completed").length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2">🏆</div>
                    <div className="text-2xl font-bold text-amber-600">
                      {user.badges?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              className={selectedCategory === cat.id ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPaths.map((path, index) => {
              const progress = getPathProgress(path.id);
              const isStarted = !!progress;
              const isCompleted = progress?.status === "completed";

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-purple-300">
                    <CardHeader className={`bg-gradient-to-br ${categoryColors[path.category]} text-white p-4`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl">{path.icon || "📚"}</div>
                        <Badge className={`${difficultyColors[path.difficulty_level]} text-xs`}>
                          {path.difficulty_level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">{path.title}</CardTitle>
                      <p className="text-sm text-white/90 mt-2 line-clamp-2">
                        {path.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="p-4 space-y-4">
                      {/* Progress Bar */}
                      {isStarted && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-bold text-purple-600">
                              {progress.completion_percentage}%
                            </span>
                          </div>
                          <Progress value={progress.completion_percentage} className="h-2" />
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{path.modules?.length || 0} modules</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{path.estimated_duration}</span>
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-900">Completion Rewards:</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            <span className="font-bold text-amber-900">+{path.completion_points} pts</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-600" />
                            <span className="text-amber-900">{path.completion_badge}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleStartPath(path)}
                        className={`w-full ${
                          isCompleted
                            ? "bg-green-500 hover:bg-green-600"
                            : isStarted
                            ? "bg-purple-500 hover:bg-purple-600"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Completed!
                          </>
                        ) : isStarted ? (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Continue Learning
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Path
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* No Paths Message */}
        {filteredPaths.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">
              No learning paths available in this category yet.
            </p>
          </div>
        )}

        {/* Path Detail Modal */}
        <AnimatePresence>
          {selectedPath && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPath(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className={`bg-gradient-to-br ${categoryColors[selectedPath.category]} text-white p-6 sticky top-0 z-10`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-5xl mb-3">{selectedPath.icon || "📚"}</div>
                      <h2 className="text-2xl font-bold mb-2">{selectedPath.title}</h2>
                      <p className="text-white/90">{selectedPath.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPath(null)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                  
                  {/* Progress in Modal */}
                  {getPathProgress(selectedPath.id) && (
                    <div className="mt-4">
                      <Progress 
                        value={getPathProgress(selectedPath.id).completion_percentage} 
                        className="h-3 bg-white/20"
                      />
                      <p className="text-sm text-white/90 mt-2">
                        {getPathProgress(selectedPath.id).completion_percentage}% Complete
                      </p>
                    </div>
                  )}
                </div>

                {/* Modules List */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    Learning Modules
                  </h3>
                  
                  {selectedPath.modules?.map((module, index) => {
                    const Icon = moduleIcons[module.type] || BookOpen;
                    const progress = getPathProgress(selectedPath.id);
                    const isCompleted = progress?.completed_modules?.includes(module.id);
                    const prevModuleCompleted = index === 0 || progress?.completed_modules?.includes(selectedPath.modules[index - 1]?.id);
                    const isUnlocked = !isAuthenticated || prevModuleCompleted;

                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border-2 ${
                          isCompleted
                            ? "bg-green-50 border-green-300"
                            : isUnlocked
                            ? "bg-white border-gray-200 hover:border-purple-300"
                            : "bg-gray-50 border-gray-200 opacity-60"
                        } transition-all`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompleted
                              ? "bg-green-500"
                              : isUnlocked
                              ? "bg-purple-500"
                              : "bg-gray-400"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : isUnlocked ? (
                              <Icon className="w-5 h-5 text-white" />
                            ) : (
                              <Lock className="w-5 h-5 text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-gray-900">
                                Module {index + 1}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {module.type}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {module.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {module.description}
                            </p>
                          </div>

                          {isUnlocked && (
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {/* Play Game Button - Always visible for unlocked modules */}
                              <Button
                                size="sm"
                                onClick={() => handleModuleClick(module, selectedPath)}
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                              >
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Play
                              </Button>
                              
                              {/* Mark Complete Button - Only for authenticated users and not completed */}
                              {isAuthenticated && !isCompleted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkModuleComplete(module, selectedPath)}
                                  className="text-xs border-green-500 text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Mark Done
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}