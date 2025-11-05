import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, BookOpen, Sparkles, FileText, Trophy, Lightbulb, Headphones, Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const quickLinks = [
  {
    category: "Daily Duas 🤲",
    links: [
      { name: "Morning Duas", path: "Duas", icon: Heart },
      { name: "Bedtime Duas", path: "Duas", icon: Heart },
      { name: "Eating Duas", path: "Duas", icon: Heart },
    ]
  },
  {
    category: "Creative Corner 🎨",
    links: [
      { name: "Colouring Pages", path: "ColoringPages", icon: Palette },
      { name: "Drawing Board", path: "DrawingBoard", icon: Sparkles },
      { name: "Write Poetry", path: "PoetryWriting", icon: FileText },
      { name: "Monthly Contest", path: "MonthlyContest", icon: Trophy }
    ]
  },
  {
    category: "Learning Library 📚",
    links: [
      { name: "Islamic Encyclopedia", path: "IslamicEncyclopedia", icon: BookOpen },
      { name: "Audio Tafsir", path: "AudioTafsir", icon: Headphones },
      { name: "Fun Facts", path: "IslamicFacts", icon: Lightbulb },
      { name: "Worksheets", path: "Worksheets", icon: FileText }
    ]
  },
  {
    category: "More Features ✨",
    links: [
      { name: "Record & Share", path: "RecordAndShare", icon: MessageSquare },
      { name: "Contact Us", path: "ContactUs", icon: MessageSquare }
    ]
  }
];

export default function QuickAccessSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {quickLinks.map((section, idx) => (
        <Card key={idx} className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">{section.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path + link.name}
                  to={createPageUrl(link.path)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <Icon className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}