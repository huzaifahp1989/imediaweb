import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const worksheets = [
  {
    id: "quran_tracing_1",
    title: "Surah Al-Fatiha Tracing",
    category: "Quran Tracing",
    description: "Trace and learn Surah Al-Fatiha in Arabic",
    level: "Beginner",
    pages: 3,
    fileUrl: "https://www.islamicfinder.org/islamic-content/",
    color: "from-green-500 to-teal-500",
    icon: "📖"
  },
  {
    id: "arabic_alphabet",
    title: "Arabic Alphabet Workbook",
    category: "Arabic Learning",
    description: "Learn all 28 Arabic letters with tracing",
    level: "Beginner",
    pages: 28,
    fileUrl: "https://www.arabicworksheets.com/",
    color: "from-blue-500 to-indigo-500",
    icon: "🔤"
  },
  {
    id: "99_names_coloring",
    title: "99 Names of Allah Coloring",
    category: "Coloring",
    description: "Color and memorize Allah's beautiful names",
    level: "All Ages",
    pages: 10,
    fileUrl: "https://www.islamiccoloring.com/",
    color: "from-purple-500 to-pink-500",
    icon: "🎨"
  },
  {
    id: "prophet_stories",
    title: "Stories of Prophets Activity Book",
    category: "Seerah",
    description: "Activities and worksheets about Prophet stories",
    level: "Ages 7-12",
    pages: 15,
    fileUrl: "https://www.islamicworksheets.net/",
    color: "from-amber-500 to-orange-500",
    icon: "⭐"
  },
  {
    id: "salah_guide",
    title: "How to Pray - Step by Step",
    category: "Fiqh",
    description: "Visual guide with pictures for each step of prayer",
    level: "All Ages",
    pages: 8,
    fileUrl: "https://www.islamicposter.com/salah-guide",
    color: "from-rose-500 to-pink-500",
    icon: "🕌"
  },
  {
    id: "wudu_worksheet",
    title: "Wudu Step-by-Step Worksheet",
    category: "Fiqh",
    description: "Learn the steps of ablution with pictures",
    level: "Ages 5-10",
    pages: 4,
    fileUrl: "https://www.muslimkidsactivities.com/",
    color: "from-cyan-500 to-blue-500",
    icon: "💧"
  },
  {
    id: "dua_coloring",
    title: "Daily Duas Coloring Book",
    category: "Duas",
    description: "Beautiful duas with coloring illustrations",
    level: "Ages 5-10",
    pages: 12,
    fileUrl: "https://www.islamickidsactivities.com/",
    color: "from-pink-500 to-purple-500",
    icon: "🤲"
  },
  {
    id: "hadith_matching",
    title: "Hadith Matching Game",
    category: "Hadith",
    description: "Match hadiths with their meanings",
    level: "Ages 8-12",
    pages: 6,
    fileUrl: "https://www.hadithforkids.com/",
    color: "from-indigo-500 to-purple-500",
    icon: "📜"
  },
  {
    id: "ramadan_activities",
    title: "Ramadan Activity Pack",
    category: "Special Occasions",
    description: "Fun activities for the blessed month",
    level: "All Ages",
    pages: 20,
    fileUrl: "https://www.ramadanworksheets.com/",
    color: "from-amber-400 to-yellow-500",
    icon: "🌙"
  },
  {
    id: "hijri_calendar",
    title: "Islamic Months Learning Sheet",
    category: "General Knowledge",
    description: "Learn the names of Islamic months",
    level: "Ages 7-12",
    pages: 4,
    fileUrl: "https://www.islamicmonths.com/",
    color: "from-gray-500 to-gray-700",
    icon: "📅"
  },
  {
    id: "arabic_numbers",
    title: "Arabic Numbers Worksheet",
    category: "Arabic Learning",
    description: "Learn to write numbers 1-20 in Arabic",
    level: "Beginner",
    pages: 5,
    fileUrl: "https://www.arabicnumbers.com/",
    color: "from-blue-400 to-cyan-500",
    icon: "🔢"
  },
  {
    id: "pillars_of_islam",
    title: "5 Pillars of Islam Worksheet",
    category: "Islamic Knowledge",
    description: "Learn about the 5 pillars with activities",
    level: "Ages 7-12",
    pages: 8,
    fileUrl: "https://www.islamicpillars.com/",
    color: "from-green-400 to-emerald-500",
    icon: "🕋"
  }
];

export default function Worksheets() {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (worksheet) => {
    setDownloading(worksheet.id);
    
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Downloaded: ${worksheet.title}`);
    toast.info("Note: This is a demo. Connect to actual worksheet files for production.");
    
    // Open resource link in new tab
    window.open(worksheet.fileUrl, '_blank');
    
    setDownloading(null);
  };

  const handlePrint = (worksheet) => {
    toast.info(`Opening ${worksheet.title} for printing...`);
    window.open(worksheet.fileUrl, '_blank');
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Printable Islamic Worksheets
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download and print Islamic worksheets for your children!
          </p>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <Card className="border-4 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-3">For Parents & Teachers</h2>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>All worksheets are designed for kids ages 5-12</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>Perfect for homeschooling, Islamic schools, or weekend classes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✅</span>
                  <span>Free to download and print!</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Worksheets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {worksheets.map((worksheet, index) => (
            <motion.div
              key={worksheet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-100">
                <CardHeader className={`bg-gradient-to-br ${worksheet.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">{worksheet.icon}</div>
                    <CardTitle className="text-xl">{worksheet.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-2">{worksheet.description}</p>
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <BookOpen className="w-4 h-4" />
                    <span>{worksheet.pages} pages • {worksheet.level}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(worksheet)}
                      disabled={downloading === worksheet.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      {downloading === worksheet.id ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Downloading...
                        </span>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handlePrint(worksheet)}
                      variant="outline"
                      size="sm"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Note Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-4 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                More Worksheets Coming Soon!
              </h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                We&apos;re constantly adding new Islamic worksheets and activities. Check back regularly for updates!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}