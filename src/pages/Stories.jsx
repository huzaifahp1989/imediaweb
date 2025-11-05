import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Headphones, X, Sparkles, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import InteractiveStoryPlayer from "@/components/stories/InteractiveStoryPlayer";

const categories = [
  { id: "all", name: "All Stories", icon: "📚" },
  { id: "prophets", name: "Prophets", icon: "✨" },
  { id: "sahabah", name: "Companions", icon: "⚔️" },
  { id: "manners", name: "Good Manners", icon: "🌟" },
  { id: "kindness", name: "Kindness", icon: "💚" },
  { id: "honesty", name: "Honesty", icon: "🤝" },
  { id: "gratitude", name: "Gratitude", icon: "🙏" },
  { id: "bedtime", name: "Bedtime", icon: "🌙" }
];

export default function Stories() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStory, setSelectedStory] = useState(null);
  const [user, setUser] = useState(null);

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
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
      return await base44.entities.Story.list('-created_date');
    },
    initialData: [],
  });

  const filteredStories = selectedCategory === "all"
    ? stories
    : stories.filter(story => story.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📖</div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="text-5xl md:text-6xl mb-4">📖</div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Stories
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Read inspiring stories from Islamic history and learn valuable lessons
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category.id ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600">No stories available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                  <CardHeader className="p-0 relative">
                    {story.image_url && (
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-xl overflow-hidden">
                        <img
                          src={story.image_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {story.is_interactive && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Interactive
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === story.category)?.icon} {story.category}
                      </Badge>
                      {story.age_range && (
                        <Badge variant="outline" className="text-xs">
                          {story.age_range} years
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-xl mb-3 line-clamp-2">
                      {story.title}
                    </CardTitle>

                    {story.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {story.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      {story.audio_url && (
                        <span className="flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          Audio
                        </span>
                      )}
                      {story.is_interactive && (
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Make Choices
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => setSelectedStory(story)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {story.is_interactive ? "Play Story" : "Read Story"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Story Reader Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-screen p-4 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-5xl"
              >
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => setSelectedStory(null)}
                    variant="ghost"
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Story Content */}
                {selectedStory.is_interactive ? (
                  <InteractiveStoryPlayer
                    story={selectedStory}
                    onComplete={() => setSelectedStory(null)}
                  />
                ) : (
                  <Card className="bg-white shadow-2xl">
                    {selectedStory.image_url && (
                      <div className="h-64 md:h-96 overflow-hidden rounded-t-xl">
                        <img
                          src={selectedStory.image_url}
                          alt={selectedStory.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 md:p-10">
                      <div className="mb-6">
                        <Badge className="mb-4">
                          {categories.find(c => c.id === selectedStory.category)?.icon} {selectedStory.category}
                        </Badge>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          {selectedStory.title}
                        </h1>
                      </div>

                      {selectedStory.audio_url && (
                        <div className="mb-6 bg-purple-50 p-4 rounded-xl">
                          <audio controls className="w-full">
                            <source src={selectedStory.audio_url} type="audio/mpeg" />
                            Your browser does not support audio.
                          </audio>
                        </div>
                      )}

                      <div className="prose prose-lg max-w-none mb-8">
                        <ReactMarkdown>{selectedStory.content}</ReactMarkdown>
                      </div>

                      {selectedStory.moral && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
                          <h3 className="text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-6 h-6" />
                            Moral of the Story
                          </h3>
                          <p className="text-gray-700 text-lg">{selectedStory.moral}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}