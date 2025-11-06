

import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Gamepad2, BookOpen, Music, GraduationCap, Users, Info, Book, Trophy, ChevronDown, Menu, X, LogOut, User, LogIn, UserPlus, Video, Settings, Play, Pause, Volume2, VolumeX, Radio, Mail } from "lucide-react";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import PropTypes from 'prop-types';
// Base44 auth removed from public UI; email-only access in place

// Create Radio Context
const RadioContext = createContext();

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (!context) {
    return {
      isPlaying: false,
      isMuted: false,
      volume: 0.7,
      togglePlay: () => {},
      toggleMute: () => {},
      setVolume: () => {}
    };
  }
  return context;
};

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Radio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);

  // Site settings (localStorage-driven)
  const [siteSettings, setSiteSettings] = useState({
    siteTitle: "Islam Kids Zone",
    tagline: "Learn, Play & Grow",
    logoEmoji: "🌙",
    headerGradient: "from-blue-600 to-purple-600",
    navActiveGradient: "from-blue-500 to-purple-500",
    backgroundGradient: "from-blue-50 via-purple-50 to-pink-50",
    darkModeDefault: false,
    showTestBanner: true,
    showRadioBar: true,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("siteSettings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSiteSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (siteSettings.darkModeDefault) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [siteSettings.darkModeDefault]);

  const bgClass = `min-h-screen bg-gradient-to-br ${siteSettings.backgroundGradient}`;
  const headerClass = `bg-gradient-to-r ${siteSettings.headerGradient} text-white shadow-lg sticky top-0 z-50`;
  const supportEmail = siteSettings.supportEmail || "imedia786@gmail.com";
  const radioSrc = siteSettings.radioUrl || "https://a4.asurahosting.com:7820/radio.mp3";

  useEffect(() => {
    // Define public pages that do NOT require authentication
    const publicPages = [
      "Home", "About", "ContactUs", "Welcome", "ParentZone", "PrivacyPolicy", "Games", "Leaderboard", "Stories", "Audio", "Learn", "Quran", "Duas", "RecordAndShare", "IslamicEncyclopedia", "IslamicFacts", "ColoringPages", "PoetryWriting", "Worksheets", "MonthlyContest", "CreativeCorner", "Videos", "History", "Hadith", "Tajweed", "LearningPaths", "LearningLibrary"
    ];
    console.log("currentPageName:", currentPageName);
    console.log("publicPages:", publicPages);
    // Email-only flow: skip external auth checks entirely
  }, [currentPageName]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // No-op for email-only access
  const checkAuth = async () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLogin = () => {
    // Login functionality removed
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing radio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const navItems = [
    { name: "Home", icon: Home, path: "Home" },
    { name: "Games", icon: Gamepad2, path: "Games" },
    { name: "Learning Paths", icon: GraduationCap, path: "LearningPaths" },
    { name: "Leaderboard", icon: Trophy, path: "Leaderboard" },
    { name: "Stories", icon: BookOpen, path: "Stories" },
    { name: "Videos", icon: Video, path: "Videos" },
    { name: "Audio", icon: Music, path: "Audio" },
    {
      name: "Learn",
      icon: GraduationCap,
      dropdown: [
        { name: "Hadith", path: "Hadith" },
        { name: "History", path: "History" },
        { name: "Tajweed", path: "Tajweed" },
      ]
    },
    {
      name: "Quran",
      icon: Book,
      dropdown: [
        { name: "Learn Quran", path: "Quran" },
        { name: "Full Quran", path: "FullQuran" },
      ]
    },
    { name: "Challenges", icon: Trophy, path: "Challenges" },
    { name: "Parents", icon: Users, path: "ParentZone" },
    { name: "Signup", icon: UserPlus, path: "Signup" },
    { name: "About", icon: Info, path: "About" },
  ];

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (itemName) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  const radioContextValue = {
    isPlaying,
    isMuted,
    volume,
    togglePlay,
    toggleMute,
    setVolume: handleVolumeChange
  };

  return (
    <RadioContext.Provider value={radioContextValue}>
      <div className={bgClass}>
        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={radioSrc}
          preload="none"
        />

        {/* Header */}
        <header className={headerClass}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2 md:gap-3 hover:opacity-90 transition-opacity">
                <div className="text-3xl md:text-4xl">{siteSettings.logoEmoji}</div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">{siteSettings.siteTitle}</h1>
                  <p className="text-xs md:text-sm text-blue-100">{siteSettings.tagline}</p>
                </div>
              </Link>

              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full hover:bg-white/30 transition-colors">
                          <User className="w-4 h-4" />
                          <div className="text-sm text-left">
                            <div className="font-semibold">{user.full_name || 'User'}</div>
                            <div className="text-xs text-blue-100">{user.points || 0} points</div>
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("DeleteAccount")} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Settings className="w-4 h-4 mr-2" />
                            Delete Account
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : null}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Desktop Navigation */}
        <nav className="hidden md:block bg-white shadow-md sticky top-[68px] z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path && currentPageName === item.path;
                
                if (item.dropdown && item.dropdown.length > 0) {
                  const isDropdownActive = item.dropdown.some(subItem => currentPageName === subItem.path);
                  
                  return (
                    <DropdownMenu key={item.name}>
                      <DropdownMenuTrigger asChild>
                        <button type="button" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                            isDropdownActive
                              ? `bg-gradient-to-r ${siteSettings.navActiveGradient} text-white shadow-md`
                              : "text-gray-700 hover:bg-gray-100"
                          }`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.name}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {item.dropdown.map((subItem) => (
                          <DropdownMenuItem key={subItem.path} asChild>
                            <Link to={createPageUrl(subItem.path)} className="cursor-pointer">
                              {subItem.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                      isActive
                        ? `bg-gradient-to-r ${siteSettings.navActiveGradient} text-white shadow-md`
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <div className="absolute top-0 right-0 h-full w-[280px] bg-white shadow-2xl overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Mobile Auth Section */}
                {isAuthenticated && user ? (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-3 bg-gradient-to-r from-blue-50 to-purple-500 p-3 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                        {user.avatar || '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{user.full_name || 'User'}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-blue-600 font-semibold mt-1">
                          ⭐ {user.points || 0} points
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link to={createPageUrl("DeleteAccount")} onClick={handleMobileLinkClick}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </Link>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 pb-4 border-b border-gray-200 space-y-2">
                    <Link to={createPageUrl("Signup")} onClick={handleMobileLinkClick}>
                      <Button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow hover:scale-105 transition-transform w-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign up
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Login")} onClick={handleMobileLinkClick}>
                      <Button variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-lg w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  </div>
                )}

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path && currentPageName === item.path;
                    
                    if (item.dropdown && item.dropdown.length > 0) {
                      const isDropdownActive = item.dropdown.some(subItem => currentPageName === subItem.path);
                      const isOpen = openDropdown === item.name;
                      
                      return (
                        <div key={item.name} className="space-y-1">
                          <button
                            onClick={() => toggleDropdown(item.name)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                              isDropdownActive
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isOpen && (
                            <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                              {item.dropdown.map((subItem) => (
                                <Link
                                  key={subItem.path}
                                  to={createPageUrl(subItem.path)}
                                  onClick={handleMobileLinkClick}
                                  className={`block px-4 py-2 rounded-lg transition-all ${
                                    currentPageName === subItem.path
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    return (
                      <Link
                        key={item.path}
                        to={createPageUrl(item.path)}
                        onClick={handleMobileLinkClick}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6" style={{ paddingBottom: isPlaying ? '100px' : '24px' }}>
          {siteSettings.maintenanceMode && (
            <div className="mb-4">
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3 shadow-md">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm text-gray-800">
                    <strong className="text-yellow-700">Maintenance Mode:</strong> Some features may be temporarily unavailable.
                    For support, email <span className="font-medium">{supportEmail}</span>
                    {siteSettings.supportWhatsappNumber && (
                      <> or WhatsApp <span className="font-medium">{siteSettings.supportWhatsappNumber}</span></>
                    )}.
                  </div>
                </div>
              </div>
            </div>
          )}
          {children}
          
          {siteSettings.showTestBanner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 mb-4"
          >
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-lg p-4 shadow-md">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <strong className="text-blue-600">⚠️ Test Mode:</strong> We are currently testing the website. 
                    If you see any errors, please use the WhatsApp icon on the home page or contact page to message us. 
                    <br className="hidden md:block" />
                    <strong className="text-purple-600">📱 Install as App:</strong> To install this website as an app on your device, 
                    click on the three dots (⋮) if using Chrome and scroll down to "Add to Home Screen."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          )}
        </main>

        {/* Persistent Radio Player Bar */}
        {siteSettings.showRadioBar && isPlaying && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl z-50 border-t-4 border-purple-400"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Now Playing Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Radio className="w-6 h-6 text-white flex-shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">Islamic Radio 24/7</p>
                    <p className="text-xs text-purple-200 truncate">Live Islamic Content</p>
                  </div>
                </div>
                {/* Controls */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Volume Control - Hidden on small screens */}
                  <div className="hidden sm:flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full backdrop-blur-sm">
                    <Button
                      onClick={toggleMute}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 p-1 h-8 w-8"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                  {/* Play/Pause Button */}
                  <Button
                    onClick={togglePlay}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-full w-10 h-10 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </Button>
                  {/* Mute button for mobile */}
                  <Button
                    onClick={toggleMute}
                    size="sm"
                    variant="ghost"
                    className="sm:hidden text-white hover:bg-white/20 p-2 h-10 w-10"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/20"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>
    </RadioContext.Provider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  currentPageName: PropTypes.string
};


