import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, PenTool, FileText, Trophy, Download, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const creativeActivities = [
  {
    id: "coloring",
    title: "Colouring Pages",
    description: "Print or colour online: mosques, Ka'bah, Islamic patterns",
    icon: Palette,
    color: "from-pink-500 to-rose-500",
    emoji: "🎨",
    link: "ColoringPages"
  },
  {
    id: "drawing",
    title: "Islamic Art Board",
    description: "Digital drawing pad for Islamic art and calligraphy",
    icon: PenTool,
    color: "from-purple-500 to-violet-500",
    emoji: "✏️",
    link: "DrawingBoard"
  },
  {
    id: "writing",
    title: "Poem & Nasheed Writing",
    description: "Write and submit your Islamic poems and nasheeds",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
    emoji: "📝",
    link: "PoetryWriting"
  },
  {
    id: "contest",
    title: "Monthly Contest",
    description: "Win prizes for best story, drawing, or recitation!",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    emoji: "🏆",
    link: "MonthlyContest"
  }
];

export default function CreativeCorner() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Creative Corner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Express your creativity through Islamic art, poetry, and more!
          </p>
        </motion.div>

        {/* Monthly Contest Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <Card className="border-4 border-amber-400 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 text-white text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Monthly Creative Contest!</h2>
              <p className="text-xl mb-4">
                Submit your best work and win amazing prizes! 🎁
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/20 px-4 py-2 rounded-full">
                  🎨 Best Drawing
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full">
                  📖 Best Story
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-full">
                  🎙️ Best Recitation
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creativeActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(activity.link)}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden border-2 hover:border-blue-300">
                    <CardHeader className={`bg-gradient-to-br ${activity.color} text-white pb-6`}>
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="text-6xl"
                        >
                          {activity.emoji}
                        </motion.div>
                        <div>
                          <CardTitle className="text-2xl mb-2">{activity.title}</CardTitle>
                          <p className="text-sm text-white/90">{activity.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-200 group-hover:border-blue-500 transition-all">
                        <Icon className="w-5 h-5 mr-2" />
                        Start Creating
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Creative Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-purple-800">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">✨</span>
                  <p>Be original and express your unique creativity</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🤲</span>
                  <p>Start with Bismillah before creating</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">🎨</span>
                  <p>Use bright colours and Islamic patterns</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">❤️</span>
                  <p>Create with love for Allah and Islam</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}