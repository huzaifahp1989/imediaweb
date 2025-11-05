import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Heart, BookOpen, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const articles = [
  {
    title: "How to Teach Islam with Love",
    excerpt: "Creating a nurturing environment where children develop a genuine love for their faith...",
    icon: Heart,
    color: "from-pink-500 to-rose-500"
  },
  {
    title: "Digital Safety for Muslim Kids",
    excerpt: "Essential guidelines to ensure your children's online experience is safe and beneficial...",
    icon: Shield,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Making Learning Fun",
    excerpt: "Creative ways to engage children in Islamic education through play and activities...",
    icon: BookOpen,
    color: "from-purple-500 to-violet-500"
  }
];

export default function ParentZone() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Parent Guidance
          </h1>
          <p className="text-lg text-gray-600">
            Resources and support for raising righteous children
          </p>
        </motion.div>

        {/* Safety Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <Card className="border-2 border-green-300 shadow-lg">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Safe & Ad-Free Environment 🛡️
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Islam Kids Zone is committed to providing a completely safe, ad-free learning environment. 
                All content is carefully curated and monitored to ensure it aligns with Islamic values and is age-appropriate.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Parenting Resources</h2>
          <div className="space-y-6">
            {articles.map((article, index) => {
              const Icon = article.icon;
              return (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${article.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                          <p className="text-gray-600">{article.excerpt}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline">Read More</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Send Us Your Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6">
                We'd love to hear your thoughts, suggestions, or concerns about Islam Kids Zone. 
                Your feedback helps us create a better experience for your children.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Share Your Feedback
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}