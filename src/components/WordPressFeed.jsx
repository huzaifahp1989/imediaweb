import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, Loader2, Newspaper } from "lucide-react";
import PropTypes from 'prop-types';

export default function WordPressFeed({ limit = 3 }) {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['wordpress-feed', limit],
    queryFn: async () => {
      try {
        // Fetch from WordPress REST API
        const response = await fetch(`https://www.imediac.com/wp-json/wp/v2/posts?per_page=${limit}&_embed`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        
        return data.map(post => {
          // Get featured image
          let imageUrl = '';
          if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
            imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
          }
          
          // Clean excerpt
          const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
          
          return {
            id: post.id,
            title: post.title.rendered,
            link: post.link,
            excerpt: excerpt,
            date: new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            imageUrl: imageUrl
          };
        });
      } catch (error) {
        console.error('Error fetching WordPress posts:', error);
        throw error;
      }
    },
    refetchInterval: 600000, // 10 minutes
    staleTime: 300000, // 5 minutes
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Loading articles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500">Unable to load articles at the moment.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <Newspaper className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm text-gray-500">No articles available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden border-2 hover:border-blue-300">
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              {post.imageUrl && (
                <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                {post.date && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                  <span>Read More</span>
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

WordPressFeed.propTypes = {
  limit: PropTypes.number
};