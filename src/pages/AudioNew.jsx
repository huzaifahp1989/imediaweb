import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Download, Filter, BookOpen, Star } from "lucide-react";
import { motion } from "framer-motion";
import AudioPlayer from "../components/AudioPlayer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AudioNew() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [currentPlaying, setCurrentPlaying] = useState(null);

  const { data: audioContent = [], isLoading } = useQuery({
    queryKey: ['audioContent'],
    queryFn: () => base44.entities.AudioContent.list('-created_date'),
    initialData: [],
  });

  const { data: featured = [] } = useQuery({
    queryKey: ['featuredAudio'],
    queryFn: async () => {
      const all = await base44.entities.AudioContent.list('-plays_count', 5);
      return all.filter(a => a.featured);
    },
    initialData: [],
  });

  const filteredAudio = audioContent.filter(audio => {
    const matchesSearch = audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         audio.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         audio.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || audio.category === selectedCategory;
    const matchesAge = selectedAge === "all" || audio.age_group === selectedAge;
    return matchesSearch && matchesCategory && matchesAge;
  });

  const handlePlay = async (audio) => {
    setSelectedAudio(audio);
    setCurrentPlaying(audio.id);
    
    // Track play count
    try {
      await base44.entities.AudioContent.update(audio.id, {
        plays_count: (audio.plays_count || 0) + 1
      });
    } catch (error) {
      console.error("Error updating play count:", error);
    }
  };

  const ageGroups = [
    { value: "all", label: "All Ages" },
    { value: "3-6", label: "Ages 3-6" },
    { value: "7-10", label: "Ages 7-10" },
    { value: "11+", label: "Ages 11+" }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "story", label: "Stories" },
    { value: "hadith", label: "Hadith" },
    { value: "history", label: "History" },
    { value: "nasheed", label: "Nasheeds" },
    { value: "tajweed", label: "Tajweed" },
    { value: "fiqh", label: "Fiqh" },
    { value: "quran", label: "Quran" }
  ];

  return (
    <div className="min-h-screen py-8 md:py-12 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="text-6xl mb-4">🎧</div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Audio Library
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Listen to stories, lessons, and nasheeds that teach Islamic values
          </p>
        </motion.div>

        {/* Featured Carousel */}
        {featured.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" />
              Featured Content
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.slice(0, 3).map((audio, index) => (
                <motion.div
                  key={audio.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-amber-200">
                    {audio.cover_image && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={audio.cover_image}
                          alt={audio.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{audio.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{audio.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="text-xs">{audio.duration}</Badge>
                          <Badge variant="outline" className="text-xs">{audio.age_group}</Badge>
                        </div>
                        <Button
                          onClick={() => handlePlay(audio)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search & Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by title, theme, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map(age => (
                      <SelectItem key={age.value} value={age.value}>{age.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currently Playing */}
        {selectedAudio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold mb-4">Now Playing</h3>
            <AudioPlayer
              title={selectedAudio.title}
              mp3Url={selectedAudio.mp3_url}
              youtubeId={selectedAudio.youtube_id}
              coverImage={selectedAudio.cover_image}
              allowDownload={selectedAudio.allow_download}
              onPlayComplete={() => console.log("Audio completed")}
            />
            
            {/* Transcript & Details */}
            <Card className="mt-4 p-4">
              <div className="space-y-4">
                {selectedAudio.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                    <p className="text-gray-700">{selectedAudio.description}</p>
                  </div>
                )}
                
                {selectedAudio.moral_lesson && (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-2">Moral Lesson</h4>
                    <p className="text-blue-800">{selectedAudio.moral_lesson}</p>
                  </div>
                )}
                
                {selectedAudio.transcript && (
                  <details className="cursor-pointer">
                    <summary className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Read Transcript
                    </summary>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm text-gray-700">
                      {selectedAudio.transcript}
                    </div>
                  </details>
                )}

                {selectedAudio.license_source && (
                  <div className="text-xs text-gray-500">
                    <p>Source: {selectedAudio.license_source}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Audio Library Grid */}
        <div>
          <h3 className="text-2xl font-bold mb-6">
            All Audio Content ({filteredAudio.length})
          </h3>
          
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading audio content...</div>
          ) : filteredAudio.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No audio content found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAudio.map((audio, index) => (
                <motion.div
                  key={audio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`hover:shadow-xl transition-all ${currentPlaying === audio.id ? 'border-2 border-blue-500' : ''}`}>
                    {audio.cover_image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={audio.cover_image}
                          alt={audio.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg line-clamp-2 flex-1">{audio.title}</h3>
                        {audio.status === 'broken' && (
                          <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{audio.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {audio.duration && <Badge variant="outline" className="text-xs">{audio.duration}</Badge>}
                        {audio.age_group && <Badge variant="outline" className="text-xs">{audio.age_group}</Badge>}
                        {audio.category && <Badge className="text-xs capitalize">{audio.category}</Badge>}
                      </div>
                      
                      {audio.tags && audio.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {audio.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs text-blue-600">#{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePlay(audio)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={audio.status === 'broken' && !audio.youtube_id}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {currentPlaying === audio.id ? 'Playing' : 'Listen'}
                        </Button>
                        
                        {audio.allow_download && audio.mp3_url && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(audio.mp3_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}