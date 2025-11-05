import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Video, X, Search, Filter, Clock, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLength, setFilterLength] = useState("all");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('-created_date'),
    initialData: [],
  });

  const categories = [
    { id: "all", name: "All Videos", emoji: "🎬" },
    { id: "prophets", name: "Prophets", emoji: "📖" },
    { id: "manners", name: "Manners", emoji: "🤝" },
    { id: "duas", name: "Duas", emoji: "🤲" },
    { id: "facts", name: "Islamic Facts", emoji: "💡" },
    { id: "series", name: "Series", emoji: "📺" }
  ];

  const categoryColors = {
    prophets: "bg-blue-100 text-blue-800",
    manners: "bg-green-100 text-green-800",
    duas: "bg-purple-100 text-purple-800",
    facts: "bg-amber-100 text-amber-800",
    series: "bg-pink-100 text-pink-800"
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const videoId = getYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  // Filter videos based on search and category
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || video.category === filterCategory;
    const matchesLength = filterLength === "all" || video.filter_tag === filterLength;
    
    return matchesSearch && matchesCategory && matchesLength;
  });

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Islamic Video Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch educational Islamic videos, stories, and lessons!
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLength} onValueChange={setFilterLength}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Video Length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lengths</SelectItem>
                <SelectItem value="short">Short (0-5 min)</SelectItem>
                <SelectItem value="lesson">Lesson (5-15 min)</SelectItem>
                <SelectItem value="series">Series (15+ min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
            <p className="text-gray-500">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">
                {searchQuery || filterCategory !== "all" 
                  ? "No videos found matching your criteria." 
                  : "No videos available yet. Check back soon!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => {
              const thumbnail = video.thumbnail_url || getYouTubeThumbnail(video.video_url);
              
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group overflow-hidden">
                    <div 
                      onClick={() => setSelectedVideo(video)}
                      className="relative"
                    >
                      {/* Thumbnail */}
                      <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 relative">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Video className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-blue-600 ml-1" />
                          </div>
                        </div>
                      </div>

                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                            {video.title}
                          </CardTitle>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {video.category && (
                            <Badge className={categoryColors[video.category]}>
                              {video.category}
                            </Badge>
                          )}
                          {video.duration && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                            </Badge>
                          )}
                          {video.filter_tag && (
                            <Badge variant="outline">
                              {video.filter_tag}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      {video.description && (
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {video.description}
                          </p>
                        </CardContent>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Video Player Modal */}
        <Dialog open={selectedVideo !== null} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold pr-8">
                {selectedVideo?.title}
              </DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedVideo?.category && (
                  <Badge className={categoryColors[selectedVideo.category]}>
                    {selectedVideo.category}
                  </Badge>
                )}
                {selectedVideo?.duration && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedVideo.duration}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {selectedVideo && (
              <div className="space-y-4">
                {/* YouTube Video Player */}
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.video_url)}?autoplay=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                {/* Description */}
                {selectedVideo.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">About this video:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedVideo.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}