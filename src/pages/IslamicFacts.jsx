import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Star } from "lucide-react";
import { motion } from "framer-motion";

const facts = [
  {
    id: 1,
    fact: "The Quran has 114 chapters (surahs) and over 6,000 verses!",
    emoji: "📖",
    category: "Quran"
  },
  {
    id: 2,
    fact: "Muslims pray 5 times a day facing the Ka'bah in Mecca.",
    emoji: "🕌",
    category: "Prayer"
  },
  {
    id: 3,
    fact: "The month of Ramadan is when Muslims fast from sunrise to sunset.",
    emoji: "🌙",
    category: "Ramadan"
  },
  {
    id: 4,
    fact: "There are 25 prophets mentioned by name in the Quran.",
    emoji: "👥",
    category: "Prophets"
  },
  {
    id: 5,
    fact: "Angel Jibreel (Gabriel) brought the Quran's revelations to Prophet Muhammad ﷺ.",
    emoji: "✨",
    category: "Angels"
  },
  {
    id: 6,
    fact: "Muslims greet each other with 'Assalamu Alaikum' which means 'Peace be upon you'.",
    emoji: "🤝",
    category: "Manners"
  },
  {
    id: 7,
    fact: "The Ka'bah was built by Prophet Ibrahim and his son Ismail (peace be upon them).",
    emoji: "🕋",
    category: "History"
  },
  {
    id: 8,
    fact: "Giving charity (Zakat) is one of the 5 pillars of Islam.",
    emoji: "❤️",
    category: "Pillars"
  },
  {
    id: 9,
    fact: "The Islamic calendar is based on the moon and has 12 months.",
    emoji: "📅",
    category: "Calendar"
  },
  {
    id: 10,
    fact: "Prophet Muhammad ﷺ was known as 'Al-Amin' (The Trustworthy) even before prophethood.",
    emoji: "⭐",
    category: "Seerah"
  }
];

export default function IslamicFacts() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">💡</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Did You Know?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fun and amazing Islamic facts for curious minds!
          </p>
        </motion.div>

        {/* Facts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {facts.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0">{item.emoji}</div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-xs bg-amber-200 text-amber-800 px-3 py-1 rounded-full font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {item.fact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Fun Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-4 border-purple-300 shadow-2xl">
            <CardContent className="p-8 text-center">
              <Star className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">
                Keep Learning Every Day!
              </h3>
              <p className="text-lg">
                Come back regularly to discover more amazing Islamic facts! 🌟
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}