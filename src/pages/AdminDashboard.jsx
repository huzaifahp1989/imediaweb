
import React, { useState, useEffect } from "react"; // Added React and hooks
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Headphones, 
  Video, 
  Image, 
  Users, 
  Trophy,
  Settings,
  FileText,
  Palette,
  Newspaper,
  HelpCircle, // Added new icon
  GraduationCap, // Added new icon
  MessageSquare, // Added new icon
  Gamepad2, // Added new icon
  BarChart3 // Added new icon
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  // State to hold dashboard statistics
  // In a real application, this data would typically be fetched from an API
  const [stats, setStats] = useState({
    totalUsers: 1200,
    totalStories: 500,
    totalAudio: 300,
    totalVideos: 150,
    totalQuestions: 1000,
    totalPaths: 50,
  });

  // Example of how you might fetch stats (uncomment and implement for real data)
  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       // const response = await api.get('/admin/dashboard-stats');
  //       // setStats(response.data);
  //     } catch (error) {
  //       console.error("Failed to fetch dashboard stats", error);
  //     }
  //   };
  //   fetchStats();
  // }, []);

  const adminSections = [
    {
      title: "Users Management",
      description: "Manage users, view profiles, reset points",
      icon: Users,
      path: "AdminUsers",
      color: "from-blue-500 to-cyan-500",
      stats: `${stats.totalUsers} users`
    },
    {
      title: "Points Tools",
      description: "Reset or add points for learners",
      icon: Trophy,
      path: "ResetPointsAdmin",
      color: "from-amber-500 to-orange-500",
      stats: "Adjust points"
    },
    {
      title: "Stories Management",
      description: "Add, edit, delete stories with images",
      icon: BookOpen,
      path: "AdminStories",
      color: "from-green-500 to-teal-500",
      stats: `${stats.totalStories} stories`
    },
    {
      title: "Audio Content",
      description: "Manage audio files and recordings",
      icon: Headphones,
      path: "AdminAudioContent",
      color: "from-purple-500 to-pink-500",
      stats: `${stats.totalAudio} tracks`
    },
    {
      title: "Videos Management",
      description: "Add and manage video content",
      icon: Video,
      path: "AdminVideos",
      color: "from-red-500 to-orange-500",
      stats: `${stats.totalVideos} videos`
    },
    {
      title: "Quiz Questions",
      description: "Create and edit quiz questions",
      icon: HelpCircle,
      path: "AdminQuestions",
      color: "from-amber-500 to-yellow-500",
      stats: `${stats.totalQuestions} questions`
    },
    {
      title: "Learning Paths",
      description: "Create and manage learning paths",
      icon: GraduationCap,
      path: "AdminLearningPaths",
      color: "from-indigo-500 to-purple-500",
      stats: `${stats.totalPaths} paths`
    },
    {
      title: "Homepage Banners",
      description: "Manage rotating homepage banners",
      icon: MessageSquare,
      path: "AdminBanners",
      color: "from-teal-500 to-cyan-500",
      stats: "Edit slides"
    },
    {
      title: "Sponsors & Ads",
      description: "Manage sponsors and advertising tiles",
      icon: Newspaper,
      path: "AdminSponsors",
      color: "from-amber-500 to-orange-500",
      stats: "Configure placements"
    },
    {
      title: "Media Library",
      description: "Upload and manage images",
      icon: Image,
      path: "AdminMedia",
      color: "from-pink-500 to-rose-500",
      stats: "Upload files"
    },
    {
      title: "Recordings Review",
      description: "Review user submissions",
      icon: Gamepad2,
      path: "RecordingsAdmin",
      color: "from-cyan-500 to-blue-500",
      stats: "Pending review"
    },
    {
      title: "Analytics & Reports",
      description: "View site statistics and reports",
      icon: BarChart3,
      path: "AdminAnalytics",
      color: "from-violet-500 to-purple-500",
      stats: "View insights"
    },
    {
      title: "Site Settings",
      description: "Configure website settings",
      icon: Settings,
      path: "AdminSettings",
      color: "from-gray-500 to-slate-500",
      stats: "Configure"
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">⚙️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage all website content without using AI credits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(section.path)}> {/* Changed from section.link to section.path */}
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-300">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-2">{section.description}</p> {/* Added mb-2 */}
                      {section.stats && ( // Conditionally render stats
                        <p className="text-sm font-semibold text-gray-800">{section.stats}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="bg-blue-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <Settings className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No AI Credits Required
              </h3>
              <p className="text-gray-600">
                All admin pages use standard forms and database operations - no AI processing needed!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
