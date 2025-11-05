import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Sparkles, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const encyclopediaCategories = [
  {
    id: "prophets",
    title: "25 Prophets",
    emoji: "👥",
    color: "from-blue-500 to-cyan-500",
    description: "Learn about all 25 prophets mentioned in the Quran"
  },
  {
    id: "angels",
    title: "Angels in Islam",
    emoji: "✨",
    color: "from-purple-500 to-pink-500",
    description: "Discover the angels and their important roles"
  },
  {
    id: "months",
    title: "Islamic Months",
    emoji: "📅",
    color: "from-green-500 to-teal-500",
    description: "Understand the 12 Islamic calendar months"
  },
  {
    id: "pillars",
    title: "5 Pillars of Islam",
    emoji: "🕌",
    color: "from-amber-500 to-orange-500",
    description: "The foundation of Islamic practice"
  }
];

const prophetsList = [
  "Adam", "Idris", "Nuh (Noah)", "Hud", "Saleh", "Ibrahim (Abraham)",
  "Lut (Lot)", "Ismail (Ishmael)", "Ishaq (Isaac)", "Yaqub (Jacob)",
  "Yusuf (Joseph)", "Ayyub (Job)", "Shuaib", "Musa (Moses)", "Harun (Aaron)",
  "Dhul-Kifl", "Dawud (David)", "Sulaiman (Solomon)", "Ilyas (Elijah)",
  "Al-Yasa (Elisha)", "Yunus (Jonah)", "Zakariya (Zechariah)", "Yahya (John)",
  "Isa (Jesus)", "Muhammad ﷺ"
];

export default function IslamicEncyclopedia() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory === "prophets") {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant="outline"
            className="mb-6"
          >
            ← Back to Encyclopedia
          </Button>
          
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <CardTitle className="text-3xl flex items-center gap-3">
                <Users className="w-8 h-8" />
                The 25 Prophets in the Quran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-4">
                {prophetsList.map((prophet, index) => (
                  <motion.div
                    key={prophet}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-900">{prophet}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            Mini Islamic Encyclopedia
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn about prophets, angels, Islamic months, and more!
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {encyclopediaCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => setSelectedCategory(category.id)}
                className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
              >
                <CardHeader className={`bg-gradient-to-br ${category.color} text-white pb-6`}>
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{category.emoji}</div>
                    <div>
                      <CardTitle className="text-2xl mb-2">{category.title}</CardTitle>
                      <p className="text-sm text-white/90">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Explore Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}