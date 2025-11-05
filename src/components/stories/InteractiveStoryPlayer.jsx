import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Star, BookOpen, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PropTypes from 'prop-types';
import { base44 } from "@/api/base44Client";

export default function InteractiveStoryPlayer({ story, onComplete }) {
  const [currentNodeId, setCurrentNodeId] = useState(story.starting_node);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [user, setUser] = useState(null);
  const [storyComplete, setStoryComplete] = useState(false);

  useEffect(() => {
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

  const getCurrentNode = () => {
    return story.story_nodes?.find(node => node.id === currentNodeId);
  };

  const handleChoice = async (choice) => {
    // Award points for this choice
    if (choice.points) {
      setTotalPoints(totalPoints + choice.points);
    }

    // Track visited nodes
    setVisitedNodes([...visitedNodes, currentNodeId]);

    // Move to next node
    const nextNode = story.story_nodes?.find(node => node.id === choice.next_node);
    setCurrentNodeId(choice.next_node);

    // Check if it's an ending
    if (nextNode?.is_ending) {
      setStoryComplete(true);
      
      // Award points to user
      if (user) {
        try {
          const finalPoints = 10; // Flat 10 points per interactive story
          const newTotalPoints = Math.min((user.points || 0) + finalPoints, 1500);
          await base44.auth.updateMe({ points: newTotalPoints });
        } catch (error) {
          console.error("Error saving points:", error);
        }
      }
    }
  };

  const restartStory = () => {
    setCurrentNodeId(story.starting_node);
    setVisitedNodes([]);
    setTotalPoints(0);
    setStoryComplete(false);
  };

  const currentNode = getCurrentNode();

  if (!currentNode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Story node not found</p>
        <Button onClick={restartStory} className="mt-4">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart Story
        </Button>
      </div>
    );
  }

  const endingColors = {
    good: "from-green-500 to-teal-500",
    great: "from-blue-500 to-purple-500",
    excellent: "from-amber-500 to-orange-500",
    bad: "from-gray-500 to-slate-500"
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-gray-600">
            {visitedNodes.length} decisions made
          </span>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-amber-900">{totalPoints} points</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentNodeId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`shadow-2xl overflow-hidden ${
            currentNode.is_ending 
              ? `bg-gradient-to-br ${endingColors[currentNode.ending_type] || endingColors.good}` 
              : 'bg-white'
          }`}>
            {/* Story Image */}
            {currentNode.image_url && (
              <div className="h-64 md:h-80 overflow-hidden">
                <img
                  src={currentNode.image_url}
                  alt="Story scene"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardContent className={`p-6 md:p-8 ${currentNode.is_ending ? 'text-white' : ''}`}>
              {/* Character Name */}
              {currentNode.character && (
                <Badge className="mb-4 bg-purple-100 text-purple-800 px-4 py-1">
                  {currentNode.character}
                </Badge>
              )}

              {/* Story Content */}
              <div className={`prose prose-lg max-w-none mb-6 ${
                currentNode.is_ending ? 'prose-invert' : 'prose-slate'
              }`}>
                <ReactMarkdown>{currentNode.content}</ReactMarkdown>
              </div>

              {/* Ending Badge */}
              {currentNode.is_ending && (
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">
                    {currentNode.ending_type === "excellent" && "🌟"}
                    {currentNode.ending_type === "great" && "✨"}
                    {currentNode.ending_type === "good" && "😊"}
                    {currentNode.ending_type === "bad" && "😔"}
                  </div>
                  <Badge className="bg-white/20 text-white text-lg px-6 py-2">
                    {currentNode.ending_type === "excellent" && "Excellent Ending!"}
                    {currentNode.ending_type === "great" && "Great Ending!"}
                    {currentNode.ending_type === "good" && "Good Ending!"}
                    {currentNode.ending_type === "bad" && "Try Again!"}
                  </Badge>
                </div>
              )}

              {/* Choices */}
              {!currentNode.is_ending && currentNode.choices && currentNode.choices.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    What will you do?
                  </p>
                  {currentNode.choices.map((choice, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleChoice(choice)}
                      className="w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 hover:border-purple-300 rounded-xl text-left transition-all duration-300 transform hover:scale-102 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 group-hover:text-purple-900">
                          {choice.text}
                        </span>
                        <div className="flex items-center gap-2">
                          {choice.points > 0 && (
                            <Badge className="bg-amber-100 text-amber-800">
                              +{choice.points} pts
                            </Badge>
                          )}
                          <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Ending Actions */}
              {currentNode.is_ending && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    onClick={restartStory}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/40"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Try Different Choices
                  </Button>
                  {onComplete && (
                    <Button
                      onClick={onComplete}
                      size="lg"
                      className="bg-white text-purple-600 hover:bg-gray-100"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Back to Stories
                    </Button>
                  )}
                </div>
              )}

              {/* Story Moral (at ending) */}
              {currentNode.is_ending && story.moral && (
                <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
                  <h3 className="text-xl font-bold mb-2">📚 Moral of the Story:</h3>
                  <p className="text-lg">{story.moral}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Story Map (Debug - can be removed) */}
      {visitedNodes.length > 0 && !currentNode.is_ending && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your journey: {visitedNodes.length} choices made
          </p>
        </div>
      )}
    </div>
  );
}

InteractiveStoryPlayer.propTypes = {
  story: PropTypes.object.isRequired,
  onComplete: PropTypes.func
};