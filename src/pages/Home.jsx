
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, BookOpen, Headphones, Video, GraduationCap, Trophy, Star, Sparkles, Heart, Shield, MessageCircle, ExternalLink, Palette, Mic, Newspaper, Radio, Play, Pause, Volume2, VolumeX, Target, Award, Users, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import WordPressFeed from "@/components/WordPressFeed";
import { useState, useEffect } from "react";
import { sponsorsApi } from "@/api/firebase";
import React from "react";
import { useRadio } from "@/pages/Layout";

const features = [
  {
    title: "Full Quran",
    description: "Read and learn the full Qur'an",
    icon: BookOpen,
    link: "FullQuran",
    color: "from-green-600 to-teal-500"
  },
  {
    title: "Quran Dictionary",
    description: "Word-by-word meanings and transliteration",
    icon: Sparkles,
    link: "QuranDictionary",
    color: "from-purple-600 to-indigo-500"
  },
  {
    title: "Hadith",
    description: "Explore authentic hadith collections",
    icon: Newspaper,
    link: "Hadith",
    color: "from-amber-600 to-orange-500"
  },
  {
    title: "Duas",
    description: "Daily duas for kids to learn",
    icon: Heart,
    link: "Duas",
    color: "from-rose-600 to-pink-500"
  },
  {
    title: "Islamic Games",
    description: "Fun educational games to learn about Islam",
    icon: Gamepad2,
    link: "Games",
    color: "from-blue-600 to-purple-500"
  },
  {
    title: "Learning Activities",
    description: "Printable worksheets and activities",
    icon: GraduationCap,
    link: "Worksheets",
    color: "from-cyan-600 to-blue-500"
  },
];

const islamicValues = [
  {
    icon: Heart,
    title: "Love & Compassion",
    description: "Teaching kindness and mercy to all",
    color: "text-red-500"
  },
  {
    icon: Star,
    title: "Knowledge & Wisdom",
    description: "Seeking knowledge is obligatory",
    color: "text-yellow-500"
  },
  {
    icon: Shield,
    title: "Safety & Security",
    description: "A safe environment for children",
    color: "text-blue-500"
  }
];

export default function Home() {
  const { isPlaying, isMuted, volume, togglePlay, toggleMute, setVolume } = useRadio();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sponsors, setSponsors] = useState([]);

  // Banner slides data
  const bannerSlides = [
    {
      id: 1,
      text: "Welcome to Islam Kids Zone",
      subtext: "Learn, Play & Grow in Faith",
      gradient: "from-blue-600 via-purple-600 to-pink-600"
    },
    {
      id: 2,
      text: "\"Whoever guides someone to goodness will have a reward like one who did it.\"",
      subtext: "— Sahih Muslim",
      gradient: "from-green-600 via-teal-600 to-cyan-600"
    },
    {
      id: 3,
      text: "\"The best among you are those who learn the Qur'an and teach it.\"",
      subtext: "— Sahih Bukhari",
      gradient: "from-amber-600 via-orange-600 to-red-600"
    },
    {
      id: 4,
      text: "\"Remember Allah much so that you may be successful.\"",
      subtext: "— Qur'an 62:10",
      gradient: "from-purple-600 via-pink-600 to-rose-600"
    }
  ];

  // Auto-play banner slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Load sponsors/ads for home placement
  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const list = await sponsorsApi.list();
        const filtered = (list || []).filter(it => (it.active ?? true) && (it.placement || 'home') === 'home');
        filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSponsors(filtered);
      } catch (e) {
        try {
          const raw = localStorage.getItem('homepage_sponsors');
          const list = raw ? JSON.parse(raw) : [];
          const filtered = (Array.isArray(list) ? list : []).filter(it => (it.active ?? true) && (it.placement || 'home') === 'home');
          filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setSponsors(filtered);
        } catch {
          setSponsors([]);
        }
      }
    };
    loadSponsors();
  }, []);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  function SponsorTile({ item }) {
    const [imgError, setImgError] = React.useState(false);
    const hasImg = item.imageUrl && !imgError;
    return (
      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow hover:shadow-lg transition">
          {hasImg ? (
            <img
              src={item.imageUrl}
              alt={item.name || 'Sponsor'}
              className="w-full h-24 md:h-28 object-contain p-4"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="p-6 text-center text-gray-700 font-semibold">{item.name || 'Sponsor'}</div>
          )}
        </div>
      </a>
    );
  }

  return (
    <div className="min-h-screen">
      {/* WhatsApp Chat Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-4 md:left-6 z-50"
      >
        <a
          href="https://wa.me/447447999284?text=Assalamu%20Alaikum!%20I%20have%20a%20question%20about%20Islam%20Kids%20Zone."
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-green-500 hover:bg-green-600 text-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
        </a>
      </motion.div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 opacity-50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div 
              className="text-6xl md:text-8xl mb-6"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              🌙
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Islam Kids Zone</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-6 md:mb-8 max-w-3xl mx-auto">
              A comprehensive Islamic learning platform designed for children. Learn through interactive games, stories, and engaging activities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Games")}>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Sparkles className="mr-2 w-5 h-5 md:w-6 md:h-6" />
                  Start Learning
                </Button>
              </Link>
              {/* Learning Paths CTA removed */}
              <Link to={createPageUrl("Signup")}>
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <UserPlus className="mr-2 w-5 h-5 md:w-6 md:h-6" />
                  Signup
                </Button>
              </Link>
              <a href="https://studio--studio-653801381-47983.us-central1.hosted.app/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-2 border-blue-400 text-blue-700 bg-white hover:bg-blue-50 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <ExternalLink className="mr-2 w-5 h-5 md:w-6 md:h-6" />
                  Open Studio
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      

      {/* Animated Text Slider Banner */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className={`bg-gradient-to-r ${bannerSlides[currentSlide].gradient} flex items-center justify-center p-8 md:p-12`}
              >
                <div className="text-center text-white">
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">
                    {bannerSlides[currentSlide].text}
                  </h2>
                  {bannerSlides[currentSlide].subtext && (
                    <p className="text-sm md:text-lg text-white/90">
                      {bannerSlides[currentSlide].subtext}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {bannerSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-6 md:w-8' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-8 md:py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200"
            >
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">12+</h3>
              <p className="text-gray-600 font-medium">Interactive Games</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border-2 border-green-200"
            >
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">7</h3>
              <p className="text-gray-600 font-medium">Educational Modules</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200"
            >
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100+</h3>
              <p className="text-gray-600 font-medium">Active Learners</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sponsors & Ads */}
      {/* Removed sponsors section as per request */}
      {/* Islamic Radio Player Section */}
      <section className="py-8 md:py-12 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-4 border-purple-300 shadow-2xl bg-gradient-to-r from-purple-600 to-blue-600">
              <CardContent className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Radio className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      Islamic Radio 🎧
                    </h2>
                  </div>
                  <p className="text-lg md:text-xl text-white/90">
                    Listen to Live Islamic Content 24/7
                  </p>
                  <p className="text-sm text-white/80 mt-2">
                    Radio continues playing as you browse the site!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* Play/Pause Button */}
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-4 border-white/40 rounded-full w-20 h-20 md:w-24 md:h-24 p-0 shadow-xl"
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 md:w-12 md:h-12" />
                    ) : (
                      <Play className="w-10 h-10 md:w-12 md:h-12 ml-1" />
                    )}
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-4 bg-white/20 px-6 py-4 rounded-full backdrop-blur-sm w-full sm:w-auto sm:min-w-[300px]">
                    <Button
                      onClick={toggleMute}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 p-2 h-10 w-10"
                    >
                      {isMuted ? (
                        <VolumeX className="w-6 h-6" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 h-3 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-white/80">
                    {isPlaying ? "🎵 Now Playing - Islamic Radio" : "Click play to start listening"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Islamic Values */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Building strong Islamic character and knowledge through engaging content
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {islamicValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-2 hover:border-purple-300">
                  <CardContent className="p-6 text-center">
                    <value.icon className={`w-16 h-16 mx-auto mb-4 ${value.color}`} />
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Islamic Learning
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of educational resources designed for children
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
              >
                <Link to={createPageUrl(feature.link)}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Competition Section */}
      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-4 border-amber-400 shadow-2xl bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-8 md:p-12">
                <div className="text-center">
                  <div className="text-6xl mb-6">🏆</div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Monthly Learning Competition
                  </h2>
                  <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                    Compete with learners worldwide! Top 3 students each month win amazing prizes. 
                    Play games, complete challenges, and climb the leaderboard.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link to={createPageUrl("Leaderboard")}>
                      <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        <Trophy className="w-5 h-5 mr-2" />
                        View Leaderboard
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Games")}>
                      <Button size="lg" variant="outline" className="border-2 border-amber-500">
                        <Gamepad2 className="w-5 h-5 mr-2" />
                        Start Playing
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Social Media Links Section */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join Our Community
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Follow us for daily Islamic inspiration and educational content
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a
                href="https://www.tiktok.com/@islamkidszone"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-semibold">TikTok</span>
              </a>
              <a
                href="https://www.instagram.com/islamkidszone"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="font-semibold">Instagram</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog section removed per request: external link not pointing to correct page */}

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Start Your Islamic Learning Journey Today
            </h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Join thousands of children learning about Islam through our engaging platform
            </p>
            <Link to={createPageUrl("Games")}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-blue-50 text-base md:text-lg px-8 md:px-12 py-4 md:py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Sparkles className="mr-2 w-5 h-5 md:w-6 md:h-6" />
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
