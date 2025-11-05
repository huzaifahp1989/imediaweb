import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import PropTypes from 'prop-types';

export default function TikTokFeed({ limit = 3 }) {
  // TikTok video IDs from @imediac account
  // Update these IDs when new videos are posted
  const tiktokVideos = [
    {
      id: "1",
      videoId: "7445678901234567890", // Replace with actual video ID
      username: "imediac",
      description: "Islamic content for kids",
      thumbnail: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400"
    },
    {
      id: "2",
      videoId: "7445678901234567891", // Replace with actual video ID
      username: "imediac",
      description: "Learn about Islam",
      thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400"
    },
    {
      id: "3",
      videoId: "7445678901234567892", // Replace with actual video ID
      username: "imediac",
      description: "Islamic stories",
      thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400"
    }
  ].slice(0, limit);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tiktokVideos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-pink-200 group cursor-pointer">
            <a
              href={`https://www.tiktok.com/@imediac/video/${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.description}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400";
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white rounded-full p-4">
                    <Play className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  TikTok
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">@{video.username}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                <div className="flex items-center gap-2 mt-3 text-pink-600 text-sm font-semibold">
                  <span>Watch on TikTok</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </CardContent>
            </a>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

TikTokFeed.propTypes = {
  limit: PropTypes.number
};