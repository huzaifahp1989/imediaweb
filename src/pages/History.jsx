import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scroll, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import AudioPlayer from "../components/AudioPlayer";

const historicalStories = [
  {
    id: 1,
    category: "Prophets",
    title: "Prophet Ibrahim (AS) and the Idols",
    summary: "Learn about Prophet Ibrahim's bravery when he destroyed the idols",
    content: `Prophet Ibrahim (AS) lived among people who worshipped idols made of stone and wood. He knew this was wrong because only Allah deserves to be worshipped.

One day, when everyone went to a festival, Prophet Ibrahim (AS) went to the temple. He broke all the idols except the biggest one, and placed the axe in its hand!

When people returned and asked who did this, Prophet Ibrahim (AS) pointed to the biggest idol and said, "Ask him, if he can speak!" 

The people realized their idols couldn't speak, move, or do anything. This made them think about how foolish it was to worship them.`,
    moral: "We should worship only Allah and have courage to stand for what is right.",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800",
    audioUrl: "",
    ageGroup: "7-10"
  },
  {
    id: 2,
    category: "Prophets",
    title: "Prophet Yusuf (AS) in the Well",
    summary: "The story of Prophet Yusuf and his jealous brothers",
    content: `Prophet Yusuf (AS) was dearly loved by his father, Prophet Yaqub (AS). His brothers became jealous and made a plan to get rid of him.

They threw young Yusuf into a deep, dark well! But Allah protected him. Travelers found him and took him to Egypt.

Years later, after many trials, Prophet Yusuf (AS) became a powerful leader in Egypt. When his brothers came for help during a famine, he forgave them!`,
    moral: "Forgiveness is a beautiful quality. Allah always has a plan for us, even in difficult times.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    audioUrl: "",
    ageGroup: "7-10"
  },
  {
    id: 3,
    category: "Sahabah",
    title: "Abu Bakr (RA) - The Best Friend",
    summary: "How Abu Bakr supported the Prophet ﷺ",
    content: `Abu Bakr (RA) was the Prophet Muhammad's ﷺ closest friend. When others doubted, he always believed.

When the Prophet ﷺ told about his night journey (Isra and Mi'raj), many people didn't believe him. But Abu Bakr (RA) said immediately: "If he said it, then it is true!"

He spent his wealth to help Islam and even accompanied the Prophet ﷺ on the dangerous journey to Madinah, hiding in a cave together.`,
    moral: "True friendship means standing by your friends and believing in them.",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800",
    audioUrl: "",
    ageGroup: "7-10"
  },
  {
    id: 4,
    category: "Makkah & Madinah",
    title: "The Building of the Kaaba",
    summary: "Learn about the sacred Kaaba's history",
    content: `The Kaaba was first built by Prophet Ibrahim (AS) and his son Ismail (AS) thousands of years ago. They built it as a house of worship for Allah.

Prophet Ibrahim (AS) would pray: "O our Lord! I have settled some of my family in a valley without cultivation near Your Sacred House..."

Today, millions of Muslims from around the world face the Kaaba when they pray, and visit it during Hajj.`,
    moral: "The Kaaba reminds us that all Muslims are united in worshipping Allah.",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800",
    audioUrl: "",
    ageGroup: "7-10"
  },
  {
    id: 5,
    category: "Sahabah",
    title: "Bilal (RA) - The First Muezzin",
    summary: "The amazing story of Bilal's beautiful voice",
    content: `Bilal (RA) was once a slave who was tortured for accepting Islam. His master would leave him under the burning sun with a heavy rock on his chest.

But Bilal would only say: "Ahad, Ahad!" meaning "One God, One God!"

When Islam became strong, the Prophet ﷺ chose Bilal to be the first person ever to call Muslims to prayer! His beautiful, strong voice echoed through Madinah.`,
    moral: "No matter where you come from, if you have faith and patience, Allah will honor you.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    audioUrl: "",
    ageGroup: "7-10"
  }
];

export default function History() {
  const [selectedCategory, setSelectedCategory] = useState("Prophets");
  const [selectedStory, setSelectedStory] = useState(null);

  const categories = ["Prophets", "Sahabah", "Makkah & Madinah"];

  const filteredStories = historicalStories.filter(story => story.category === selectedCategory);

  return (
    <div className="min-h-screen py-8 md:py-12 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">📜</div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic History
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Amazing stories from Islamic history
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedStory(null);
              }}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={selectedCategory === cat ? "bg-blue-600" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Story Detail View */}
        {selectedStory ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => setSelectedStory(null)}
              className="mb-4"
            >
              ← Back to Stories
            </Button>

            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardTitle className="text-2xl">{selectedStory.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                {selectedStory.image && (
                  <div className="mb-6">
                    <img
                      src={selectedStory.image}
                      alt={selectedStory.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {selectedStory.audioUrl && (
                  <div className="mb-6">
                    <AudioPlayer
                      title={selectedStory.title}
                      mp3Url={selectedStory.audioUrl}
                      coverImage={selectedStory.image}
                    />
                  </div>
                )}

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line text-lg">
                    {selectedStory.content}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900 mb-2">📚 Moral of the Story:</h4>
                  <p className="text-green-800">{selectedStory.moral}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Stories Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setSelectedStory(story)}>
                  {story.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <Badge className="mb-3">{story.category}</Badge>
                    <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {story.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{story.ageGroup}</Badge>
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}