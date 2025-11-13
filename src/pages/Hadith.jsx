
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { BookOpen, Search, ExternalLink, Book, Heart, Star } from "lucide-react";

const hadithBooks = [
  { value: "1", name: "Sahih Bukhari", color: "from-green-600 to-emerald-600" },
  { value: "2", name: "Sahih Muslim", color: "from-blue-600 to-cyan-600" },
  { value: "3", name: "Sunan Abu Dawud", color: "from-orange-600 to-amber-600" },
  { value: "4", name: "Jami' at-Tirmidhi", color: "from-purple-600 to-pink-600" },
  { value: "5", name: "Sunan an-Nasa'i", color: "from-red-600 to-rose-600" },
  { value: "6", name: "Sunan Ibn Majah", color: "from-indigo-600 to-purple-600" },
  { value: "7", name: "Muwatta Malik", color: "from-teal-600 to-cyan-600" },
  { value: "8", name: "Musnad Ahmad", color: "from-amber-600 to-orange-600" }
];

// Weekly Hadith Collection - 10 Hadiths
const weeklyHadiths = [
  {
    id: 1,
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english: "Actions are judged by intentions, and every person will get the reward according to what he intended.",
    reference: "Sahih Bukhari & Muslim",
    narrator: "Umar ibn Al-Khattab (RA)",
    kidsAdvice: "Always do good things because you want to make Allah happy, not to show off to others!"
  },
  {
    id: 2,
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    english: "The best among you are those who learn the Quran and teach it.",
    reference: "Sahih Bukhari",
    narrator: "Uthman (RA)",
    kidsAdvice: "Learning Quran is amazing! And when you help others learn it too, you become even more special to Allah."
  },
  {
    id: 3,
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ",
    english: "Your smile in the face of your brother is charity.",
    reference: "Jami' at-Tirmidhi",
    narrator: "Abu Dharr (RA)",
    kidsAdvice: "Smiling at people is free but makes everyone happy! Even a smile counts as a good deed!"
  },
  {
    id: 4,
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    reference: "Sahih Bukhari & Muslim",
    narrator: "Anas ibn Malik (RA)",
    kidsAdvice: "Want good things for your friends just like you want them for yourself. Share happiness and toys!"
  },
  {
    id: 5,
    arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنْ الْمُؤْمِنِ الضَّعِيفِ",
    english: "A strong believer is better and more beloved to Allah than a weak believer.",
    reference: "Sahih Muslim",
    narrator: "Abu Hurairah (RA)",
    kidsAdvice: "Being strong means having strong faith, good character, and helping others - not just being physically strong!"
  },
  {
    id: 6,
    arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ",
    english: "The best of you are those who are best to their families.",
    reference: "Sahih Muslim & Tirmidhi",
    narrator: "Abu Hurairah (RA)",
    kidsAdvice: "Be kind and helpful to your parents, brothers, and sisters. Your family is very special!"
  },
  {
    id: 7,
    arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    english: "A good word is charity.",
    reference: "Sahih Bukhari & Muslim",
    narrator: "Abu Hurairah (RA)",
    kidsAdvice: "Saying nice things to people like 'thank you' and 'please' is a good deed that Allah loves!"
  },
  {
    id: 8,
    arabic: "لَا يَدْخُلُ الْجَنَّةَ مَنْ لَا يَأْمَنُ جَارُهُ بَوَائِقَهُ",
    english: "He will not enter Paradise whose neighbor is not secure from his wrongful conduct.",
    reference: "Sahih Muslim",
    narrator: "Abu Hurairah (RA)",
    kidsAdvice: "Always be nice to your neighbors! Don't be noisy or do things that bother them."
  },
  {
    id: 9,
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    english: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    reference: "Sahih Bukhari & Muslim",
    narrator: "Abu Hurairah (RA)",
    kidsAdvice: "If you don't have something nice to say, it's better to stay quiet. Don't say mean things!"
  },
  {
    id: 10,
    arabic: "إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا",
    english: "Allah is Good and accepts only that which is good.",
    reference: "Sahih Muslim",
    narrator: "Abu Hurairah (RA)",
    kidsAdvice: "Always do things with a clean heart and good intentions. Allah loves when we are pure and honest!"
  }
];

export default function Hadith() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedBooks, setSelectedBooks] = useState({
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
    "7": false,
    "8": false
  });
  const [currentWeekHadith, setCurrentWeekHadith] = useState(null);

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  useEffect(() => {
    const dayNum = getDayOfYear();
    const hadithIndex = dayNum % weeklyHadiths.length;
    setCurrentWeekHadith(weeklyHadiths[hadithIndex]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const selectedBookIds = Object.entries(selectedBooks)
      .filter(([_, isSelected]) => isSelected)
      .map(([bookId, _]) => bookId)
      .join(",");
    
    const searchUrl = `https://www.searchtruth.com/searchHadith.php?keyword=${encodeURIComponent(searchKeyword)}&book=${selectedBookIds}&translator=1&search=1`;
    
    window.open(searchUrl, '_blank');
  };

  const toggleBook = (bookId) => {
    setSelectedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  const selectAll = () => {
    const newState = {};
    hadithBooks.forEach(book => {
      newState[book.value] = true;
    });
    setSelectedBooks(newState);
  };

  const deselectAll = () => {
    const newState = {};
    hadithBooks.forEach(book => {
      newState[book.value] = false;
    });
    setSelectedBooks(newState);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hadith Library
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn authentic hadiths from Prophet Muhammad (ﷺ) - Changes every day!
          </p>
        </motion.div>

        {/* Hadith of the Week */}
        {currentWeekHadith && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-4 border-amber-400 shadow-2xl bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardTitle className="text-2xl flex items-center gap-2 justify-center">
                  <Star className="w-6 h-6" />
                  Hadith of Today
                  <Star className="w-6 h-6" />
                </CardTitle>
                <p className="text-center text-amber-100 text-sm mt-2">Updates daily</p>
              </CardHeader>
              <CardContent className="p-8">
                {/* Arabic Text */}
                <div className="mb-6 text-center bg-white p-6 rounded-xl border-2 border-amber-200">
                  <p 
                    className="text-3xl md:text-4xl lg:text-5xl leading-loose text-gray-900 mb-2" 
                    style={{ 
                      fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Arabic Typesetting', serif",
                      lineHeight: "2.5",
                      direction: "rtl"
                    }}
                  >
                    {currentWeekHadith.arabic}
                  </p>
                </div>

                {/* English Translation */}
                <div className="mb-6 bg-white p-6 rounded-xl border-2 border-amber-200">
                  <p className="text-lg md:text-xl text-gray-800 leading-relaxed italic">
                    "{currentWeekHadith.english}"
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="bg-amber-600 text-white">{currentWeekHadith.reference}</Badge>
                    <Badge variant="outline" className="border-amber-600 text-amber-700">
                      Narrator: {currentWeekHadith.narrator}
                    </Badge>
                  </div>
                </div>

                {/* Kids Advice */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">💡 For Kids:</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {currentWeekHadith.kidsAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All 10 Hadiths Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            📖 Learn These 10 Beautiful Hadiths
          </h2>
          <div className="grid gap-6">
            {weeklyHadiths.map((hadith, index) => (
              <motion.div
                key={hadith.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all border-2 border-gray-200 hover:border-blue-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        {/* Arabic */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 mb-4">
                          <p 
                            className="text-2xl md:text-3xl lg:text-4xl leading-loose text-gray-900" 
                            style={{ 
                              fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Arabic Typesetting', serif",
                              lineHeight: "2.5",
                              direction: "rtl",
                              textAlign: "right"
                            }}
                          >
                            {hadith.arabic}
                          </p>
                        </div>

                        {/* English */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <p className="text-base md:text-lg text-gray-800 leading-relaxed italic">
                            "{hadith.english}"
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge className="bg-green-600">{hadith.reference}</Badge>
                            <Badge variant="outline">{hadith.narrator}</Badge>
                          </div>
                        </div>

                        {/* Kids Advice */}
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm md:text-base text-gray-700">
                            <strong className="text-blue-700">💡 Lesson:</strong> {hadith.kidsAdvice}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Search className="w-6 h-6" />
                Search More Hadiths
              </CardTitle>
              <p className="text-blue-100 text-sm mt-2">Search thousands of authentic hadiths</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter keyword or topic
                  </label>
                  <Input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="e.g., prayer, charity, kindness..."
                    className="text-base"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select Hadith Books
                    </label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                        Select All
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hadithBooks.map((book) => (
                      <div
                        key={book.value}
                        onClick={() => toggleBook(book.value)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedBooks[book.value]
                            ? `bg-gradient-to-r ${book.color} text-white border-transparent shadow-lg`
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedBooks[book.value] ? 'bg-white border-white' : 'border-gray-300'
                          }`}>
                            {selectedBooks[book.value] && (
                              <svg className="w-4 h-4 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <span className="font-semibold">{book.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
                  disabled={!searchKeyword.trim() || Object.values(selectedBooks).every(v => !v)}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Hadiths
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Powered by SearchTruth.com
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl">About Hadiths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                <strong>Hadiths</strong> are the sayings and actions of Prophet Muhammad (ﷺ). They teach us how to be good Muslims and follow Allah's path.
              </p>
              <p className="text-gray-700">
                The most authentic collections are <strong>Sahih Bukhari</strong> and <strong>Sahih Muslim</strong>, which have been carefully verified by Islamic scholars.
              </p>
              <p className="text-gray-700">
                Learning hadiths helps us understand the Quran better and know how to live like the Prophet (ﷺ) taught us.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
