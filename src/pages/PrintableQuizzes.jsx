import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function PrintableQuizzes() {
  const quizCategories = [
    {
      id: "quran",
      title: "Qur'an Knowledge Quiz",
      icon: "📖",
      description: "Test knowledge of Surahs, verses, and Quranic stories",
      levels: ["Easy", "Medium", "Hard"],
      color: "from-green-500 to-teal-500"
    },
    {
      id: "prophets",
      title: "Prophets & Messengers Quiz",
      icon: "⭐",
      description: "Learn about the noble prophets mentioned in the Quran",
      levels: ["Easy", "Medium", "Hard"],
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: "seerah",
      title: "Life of Prophet Muhammad ﷺ",
      icon: "🌙",
      description: "Questions about the Seerah and the Prophet's life",
      levels: ["Easy", "Medium", "Hard"],
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "fiqh",
      title: "Fiqh & Islamic Practices",
      icon: "🕌",
      description: "Salah, fasting, Hajj, and daily Islamic practices",
      levels: ["Easy", "Medium", "Hard"],
      color: "from-amber-500 to-orange-500"
    },
    {
      id: "akhlaq",
      title: "Islamic Manners & Character",
      icon: "🌸",
      description: "Good character, honesty, kindness, and respect",
      levels: ["Easy", "Medium"],
      color: "from-rose-500 to-pink-500"
    },
    {
      id: "history",
      title: "Islamic History Quiz",
      icon: "📚",
      description: "Sahabah, battles, caliphs, and Islamic civilization",
      levels: ["Medium", "Hard"],
      color: "from-cyan-500 to-blue-500"
    }
  ];

  const handleDownload = (category, level) => {
    alert(`Downloading ${category} - ${level} quiz... (Feature coming soon!)`);
  };

  const handlePrint = (category, level) => {
    alert(`Preparing to print ${category} - ${level} quiz... (Feature coming soon!)`);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Printable Islamic Quizzes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download and print Islamic quizzes for your children, students, or homeschool!
          </p>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <Card className="border-4 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-3">For Parents & Teachers</h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>All quizzes are designed for kids ages 5-12</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>Answer keys included for easy grading</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>Perfect for homeschooling, Islamic schools, or weekend classes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>Free to download and print!</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quizCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-100">
                <CardHeader className={`bg-gradient-to-br ${category.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{category.icon}</div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  
                  <div className="space-y-2">
                    {category.levels.map(level => (
                      <div key={level} className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(category.title, level)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {level}
                        </Button>
                        <Button
                          onClick={() => handlePrint(category.title, level)}
                          variant="outline"
                          size="sm"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Submit Your Own Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-green-300 bg-gradient-to-r from-green-50 to-teal-50">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Submit Your Own Quiz Questions!
              </h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Have great Islamic quiz questions or crosswords? Share them with us and they might be featured!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = "mailto:huzaify786@gmail.com?subject=Islamic Quiz Submission"}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                  size="lg"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Your Submission
                </Button>
                <Button
                  onClick={() => window.open("https://wa.me/447447999284?text=I'd like to submit Islamic quiz questions!", "_blank")}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  💬 WhatsApp Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}