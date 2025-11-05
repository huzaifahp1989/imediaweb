import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Lightbulb, FileText, Users, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const libraryResources = [
  {
    id: "encyclopedia",
    title: "Islamic Encyclopedia",
    description: "Learn about prophets, angels, and Islamic months",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    emoji: "📚",
    link: "IslamicEncyclopedia"
  },
  {
    id: "tafsir",
    title: "Audio Tafsir for Kids",
    description: "Easy explanations of short surahs",
    icon: Headphones,
    color: "from-green-500 to-teal-500",
    emoji: "🎧",
    link: "AudioTafsir"
  },
  {
    id: "facts",
    title: "Did You Know?",
    description: "Fun and amazing Islamic facts",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    emoji: "💡",
    link: "IslamicFacts"
  },
  {
    id: "worksheets",
    title: "Printable Worksheets",
    description: "Quran tracing, matching activities & more",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    emoji: "📄",
    link: "Worksheets"
  }
];

const quickLinks = [
  { title: "25 Prophets", icon: Users, count: "25 stories" },
  { title: "Islamic Months", icon: Calendar, count: "12 months" },
  { title: "99 Names of Allah", icon: Star, count: "Learn all" }
];

export default function LearningLibrary() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Learning Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore Islamic knowledge through engaging resources and materials
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Icon className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-1">{link.title}</h3>
                      <p className="text-sm text-blue-100">{link.count}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {libraryResources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Link to={createPageUrl(resource.link)}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden border-2 hover:border-green-300">
                    <CardHeader className={`bg-gradient-to-br ${resource.color} text-white pb-6`}>
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="text-6xl"
                        >
                          {resource.emoji}
                        </motion.div>
                        <div>
                          <CardTitle className="text-2xl mb-2">{resource.title}</CardTitle>
                          <p className="text-sm text-white/90">{resource.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 border-2 border-gray-200 group-hover:border-green-500 transition-all">
                        <Icon className="w-5 h-5 mr-2" />
                        Explore Now
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Educational Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-4 border-green-400 shadow-2xl bg-gradient-to-r from-green-50 to-teal-50">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                "Seek knowledge from the cradle to the grave"
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                - Prophet Muhammad ﷺ
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our learning library is designed to make Islamic education easy, fun, and engaging for young learners.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}