import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import PropTypes from 'prop-types';

export default function InstagramFeed({ limit = 3 }) {
  // Instagram posts from @imediac786 account
  // Update these when new posts are published
  const instagramPosts = [
    {
      id: "1",
      postId: "C_example1", // Replace with actual post ID
      username: "imediac786",
      caption: "Islamic education for children 🌙",
      thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400",
      likes: "1.2K",
      comments: "45"
    },
    {
      id: "2",
      postId: "C_example2", // Replace with actual post ID
      username: "imediac786",
      caption: "Learn and grow with Islam ✨",
      thumbnail: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400",
      likes: "980",
      comments: "32"
    },
    {
      id: "3",
      postId: "C_example3", // Replace with actual post ID
      username: "imediac786",
      caption: "Islamic stories and lessons 📚",
      thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
      likes: "1.5K",
      comments: "56"
    }
  ].slice(0, limit);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {instagramPosts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-purple-200 group cursor-pointer">
            <a
              href={`https://www.instagram.com/p/${post.postId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400";
                  }}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Instagram
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">@{post.username}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.caption}</p>
                <div className="flex items-center gap-4 text-gray-500 text-xs mb-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-purple-600 text-sm font-semibold">
                  <span>View on Instagram</span>
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

InstagramFeed.propTypes = {
  limit: PropTypes.number
};