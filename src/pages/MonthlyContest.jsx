import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Award, Gift, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const contestCategories = [
  {
    id: "story",
    title: "Best Story",
    emoji: "📖",
    prize: "Islamic Story Book Set",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "drawing",
    title: "Best Drawing",
    emoji: "🎨",
    prize: "Art Supplies Kit",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: "recitation",
    title: "Best Recitation",
    emoji: "🎙️",
    prize: "Special Islamic Gift",
    color: "from-green-500 to-teal-500"
  },
  {
    id: "poem",
    title: "Best Poem/Nasheed",
    emoji: "📝",
    prize: "Featured on Website + Prize",
    color: "from-purple-500 to-violet-500"
  }
];

export default function MonthlyContest() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-8xl mb-6"
          >
            🏆
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Monthly Creative Contest
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Showcase your talents and win amazing prizes every month!
          </p>
        </motion.div>

        {/* Current Month Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <Card className="border-4 border-amber-400 shadow-2xl bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-amber-600" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                December 2024 Contest
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Submit your entries before December 31st!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white px-6 py-3 rounded-full shadow-lg">
                  <span className="font-bold text-amber-600">Total Prizes:</span> 4 Winners
                </div>
                <div className="bg-white px-6 py-3 rounded-full shadow-lg">
                  <span className="font-bold text-amber-600">Deadline:</span> Dec 31
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contest Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contestCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2">
                <CardHeader className={`bg-gradient-to-br ${category.color} text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{category.emoji}</div>
                    <div>
                      <CardTitle className="text-2xl mb-2">{category.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <Gift className="w-4 h-4" />
                        <span>Prize: {category.prize}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Link to={createPageUrl(category.id === "story" ? "Stories" : category.id === "drawing" ? "DrawingBoard" : category.id === "recitation" ? "RecordAndShare" : "PoetryWriting")}>
                    <Button className="w-full bg-gray-900 hover:bg-gray-800">
                      Submit Entry
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Rules & Guidelines */}
        <Card className="shadow-2xl border-2 border-blue-300">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="w-6 h-6" />
              Contest Rules & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4 text-blue-900">How to Participate</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-xl">✅</span>
                    <span>Create your best Islamic artwork, story, poem, or recitation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">📤</span>
                    <span>Submit before the monthly deadline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">🎯</span>
                    <span>Winners announced at the start of each month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">🎁</span>
                    <span>Prizes shipped to winners worldwide!</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-4 text-purple-900">Judging Criteria</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-xl">⭐</span>
                    <span>Originality and creativity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❤️</span>
                    <span>Islamic values and messages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">🎨</span>
                    <span>Effort and presentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">👥</span>
                    <span>Age-appropriate content</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Winners (placeholder) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300">
            <CardContent className="p-8 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Join Our Hall of Fame!
              </h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                All winners get featured on our website and receive special badges on their profiles. 
                Start creating today and join the ranks of talented young Muslim artists!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}