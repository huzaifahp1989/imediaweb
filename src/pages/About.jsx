import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star, Shield, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    icon: Heart,
    title: "Learn with Love",
    description: "Every activity is designed to inspire love for Islam in young hearts"
  },
  {
    icon: Star,
    title: "Quality Content",
    description: "Carefully curated Islamic content that's both educational and engaging"
  },
  {
    icon: Shield,
    title: "Safe Environment",
    description: "100% ad-free and child-safe platform monitored by caring educators"
  },
  {
    icon: Sparkles,
    title: "Fun Learning",
    description: "Interactive games and activities that make learning enjoyable"
  }
];

export default function About() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🌙</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Islam Kids Zone
          </h1>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="shadow-lg border-2 border-blue-200">
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong>Islam Media Kids Zone</strong> is part of <strong>Islam Media Central</strong>, 
                built to inspire the next generation through games, stories, and educational media.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every activity is designed to teach Islamic manners, knowledge, and fun learning experiences — 
                all in a safe and loving environment where children can explore their faith with joy and confidence.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                          <p className="text-gray-600">{value.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Connect Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Connect with Islam Media Central</h2>
              <p className="text-blue-100 mb-6 text-lg">
                Discover more Islamic content and resources for the whole family
              </p>
              <Button
                onClick={() => window.open('https://www.imediac.com', '_blank')}
                className="bg-white hover:bg-gray-100 text-blue-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Credits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="shadow border-2 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Acknowledgements</h3>
              <p className="text-gray-700">
                Qur’an text, translations, and audio in our Recitation & Hifz module are powered by the
                <a href="https://alquran.cloud/api" target="_blank" rel="noreferrer" className="text-green-700 font-semibold ml-1">AlQuran.Cloud API</a>
                by Islamic Network. We are grateful for their service to the community.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
