import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Eye, EyeOff, Shuffle, ChevronRight, ChevronLeft, Star, BookOpen, Globe, Headphones } from 'lucide-react';

// Comprehensive English to Arabic vocabulary data
const vocabularyCategories = {
  basics: {
    title: 'Basic Words',
    icon: '🏠',
    words: [
      { english: 'Hello', arabic: 'مرحباً', transliteration: 'marḥaban', pronunciation: 'mar-ha-ban' },
      { english: 'Goodbye', arabic: 'وداعاً', transliteration: 'wadāʿan', pronunciation: 'wa-da-an' },
      { english: 'Please', arabic: 'من فضلك', transliteration: 'min faḍlik', pronunciation: 'min fad-lik' },
      { english: 'Thank you', arabic: 'شكراً', transliteration: 'shukran', pronunciation: 'shuk-ran' },
      { english: 'Yes', arabic: 'نعم', transliteration: 'naʿam', pronunciation: 'na-am' },
      { english: 'No', arabic: 'لا', transliteration: 'lā', pronunciation: 'la' },
      { english: 'Water', arabic: 'ماء', transliteration: 'māʾ', pronunciation: 'ma' },
      { english: 'Food', arabic: 'طعام', transliteration: 'ṭaʿām', pronunciation: 'ta-am' }
    ]
  },
  numbers: {
    title: 'Numbers',
    icon: '🔢',
    words: [
      { english: 'One', arabic: 'واحد', transliteration: 'wāḥid', pronunciation: 'wa-hid' },
      { english: 'Two', arabic: 'اثنان', transliteration: 'ithnān', pronunciation: 'ith-nan' },
      { english: 'Three', arabic: 'ثلاثة', transliteration: 'thalāthah', pronunciation: 'tha-la-tha' },
      { english: 'Four', arabic: 'أربعة', transliteration: 'arbaʿah', pronunciation: 'ar-ba-a' },
      { english: 'Five', arabic: 'خمسة', transliteration: 'khamsah', pronunciation: 'kham-sa' },
      { english: 'Six', arabic: 'ستة', transliteration: 'sittah', pronunciation: 'sit-ta' },
      { english: 'Seven', arabic: 'سبعة', transliteration: 'sabʿah', pronunciation: 'sab-a' },
      { english: 'Eight', arabic: 'ثمانية', transliteration: 'thamāniyah', pronunciation: 'tha-ma-ni-ya' }
    ]
  },
  family: {
    title: 'Family',
    icon: '👨‍👩‍👧‍👦',
    words: [
      { english: 'Father', arabic: 'أب', transliteration: 'ab', pronunciation: 'ab' },
      { english: 'Mother', arabic: 'أم', transliteration: 'umm', pronunciation: 'umm' },
      { english: 'Brother', arabic: 'أخ', transliteration: 'akh', pronunciation: 'akh' },
      { english: 'Sister', arabic: 'أخت', transliteration: 'ukht', pronunciation: 'ukht' },
      { english: 'Son', arabic: 'ابن', transliteration: 'ibn', pronunciation: 'ibn' },
      { english: 'Daughter', arabic: 'ابنة', transliteration: 'ibnah', pronunciation: 'ib-na' },
      { english: 'Grandfather', arabic: 'جد', transliteration: 'jad', pronunciation: 'jad' },
      { english: 'Grandmother', arabic: 'جدة', transliteration: 'jadah', pronunciation: 'ja-da' }
    ]
  },
  colors: {
    title: 'Colors',
    icon: '🎨',
    words: [
      { english: 'Red', arabic: 'أحمر', transliteration: 'aḥmar', pronunciation: 'ah-mar' },
      { english: 'Blue', arabic: 'أزرق', transliteration: 'azraq', pronunciation: 'az-raq' },
      { english: 'Green', arabic: 'أخضر', transliteration: 'akhḍar', pronunciation: 'akh-dar' },
      { english: 'Yellow', arabic: 'أصفر', transliteration: 'aṣfar', pronunciation: 'as-far' },
      { english: 'Black', arabic: 'أسود', transliteration: 'aswad', pronunciation: 'as-wad' },
      { english: 'White', arabic: 'أبيض', transliteration: 'abyaḍ', pronunciation: 'ab-yaḍ' },
      { english: 'Brown', arabic: 'بني', transliteration: 'banī', pronunciation: 'ba-ni' },
      { english: 'Pink', arabic: 'وردي', transliteration: 'wardī', pronunciation: 'war-di' }
    ]
  },
  animals: {
    title: 'Animals',
    icon: '🦁',
    words: [
      { english: 'Cat', arabic: 'قطة', transliteration: 'qiṭṭah', pronunciation: 'qit-ta' },
      { english: 'Dog', arabic: 'كلب', transliteration: 'kalb', pronunciation: 'kalb' },
      { english: 'Bird', arabic: 'طائر', transliteration: 'ṭāʾir', pronunciation: 'ta-ir' },
      { english: 'Horse', arabic: 'حصان', transliteration: 'ḥiṣān', pronunciation: 'ḥi-ṣan' },
      { english: 'Camel', arabic: 'جمل', transliteration: 'jamal', pronunciation: 'ja-mal' },
      { english: 'Lion', arabic: 'أسد', transliteration: 'asad', pronunciation: 'as-ad' },
      { english: 'Elephant', arabic: 'فيل', transliteration: 'fīl', pronunciation: 'fīl' },
      { english: 'Fish', arabic: 'سمكة', transliteration: 'samakah', pronunciation: 'sam-ka' }
    ]
  },
  food: {
    title: 'Food & Drinks',
    icon: '🍽️',
    words: [
      { english: 'Bread', arabic: 'خبز', transliteration: 'khubz', pronunciation: 'khubz' },
      { english: 'Milk', arabic: 'حليب', transliteration: 'ḥalīb', pronunciation: 'ḥa-līb' },
      { english: 'Rice', arabic: 'أرز', transliteration: 'aruzz', pronunciation: 'ar-ruz' },
      { english: 'Meat', arabic: 'لحم', transliteration: 'laḥm', pronunciation: 'laḥm' },
      { english: 'Fruit', arabic: 'فاكهة', transliteration: 'fākihah', pronunciation: 'fa-ki-ha' },
      { english: 'Vegetable', arabic: 'خضار', transliteration: 'khuḍār', pronunciation: 'khu-ḍar' },
      { english: 'Coffee', arabic: 'قهوة', transliteration: 'qahwah', pronunciation: 'qa-hwa' },
      { english: 'Tea', arabic: 'شاي', transliteration: 'shāy', pronunciation: 'shāy' }
    ]
  }
};

// Learning modes
const LEARNING_MODES = {
  FLASHCARD: 'flashcard',
  QUIZ: 'quiz',
  MATCHING: 'matching',
  LISTENING: 'listening'
};

export default function EnglishArabicVocabulary() {
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [learningMode, setLearningMode] = useState(LEARNING_MODES.FLASHCARD);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [languageMode, setLanguageMode] = useState('english-arabic'); // 'english-arabic' or 'arabic-english'

  const currentCategory = vocabularyCategories[selectedCategory];
  const currentWord = currentCategory.words[currentWordIndex];

  useEffect(() => {
    // Shuffle words when category changes
    const words = [...currentCategory.words];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    setShuffledWords(words);
    setCurrentWordIndex(0);
    setShowTranslation(false);
  }, [selectedCategory]);

  const nextWord = () => {
    if (currentWordIndex < currentCategory.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowTranslation(false);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setShowTranslation(false);
    }
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const shuffleWords = () => {
    const words = [...currentCategory.words];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    setShuffledWords(words);
    setCurrentWordIndex(0);
    setShowTranslation(false);
  };

  const toggleFavorite = (word) => {
    const isFavorite = favorites.some(fav => fav.english === word.english);
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.english !== word.english));
    } else {
      setFavorites([...favorites, word]);
    }
  };

  const isFavorite = (word) => {
    return favorites.some(fav => fav.english === word.english);
  };

  const playPronunciation = () => {
    // Simple pronunciation guide - in a real app, you'd use Web Speech API or audio files
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1000);
    
    // Web Speech API for pronunciation (if available)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.arabic);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const renderFlashcardMode = () => {
    const isEnglishToArabic = languageMode === 'english-arabic';
    
    return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / currentCategory.words.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <motion.div
        key={currentWordIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:shadow-xl transition-shadow"
        onClick={toggleTranslation}
      >
        <div className="mb-4">
          <span className="text-3xl sm:text-4xl">{currentCategory.icon}</span>
        </div>
        
        <div className="mb-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
            {isEnglishToArabic ? currentWord.english : currentWord.arabic}
          </h3>
          {!isEnglishToArabic && (
            <div className="text-base sm:text-lg text-gray-600 mb-2 break-words">
              {currentWord.transliteration}
            </div>
          )}
          <div className="text-sm text-gray-500 mb-4">
            {currentCategory.title} - {isEnglishToArabic ? 'English to Arabic' : 'Arabic to English'}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showTranslation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="border-t pt-4">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2 break-words">
                  {isEnglishToArabic ? currentWord.arabic : currentWord.english}
                </div>
                {isEnglishToArabic && (
                  <div className="text-base sm:text-lg text-gray-600 mb-2 break-words">
                    {currentWord.transliteration}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  [{currentWord.pronunciation}]
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showTranslation && (
          <div className="text-gray-400 text-sm">
            {isEnglishToArabic ? 'Click to reveal Arabic translation' : 'Click to reveal English translation'}
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <Button
          onClick={previousWord}
          disabled={currentWordIndex === 0}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
          <Button
            onClick={playPronunciation}
            disabled={!showTranslation}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Headphones className="w-4 h-4" />
            Pronounce
          </Button>
          
          <Button
            onClick={() => toggleFavorite(currentWord)}
            className={`flex items-center gap-2 w-full sm:w-auto ${
              isFavorite(currentWord) ? 'bg-yellow-500 hover:bg-yellow-600' : ''
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite(currentWord) ? 'fill-current' : ''}`} />
            {isFavorite(currentWord) ? 'Favorited' : 'Favorite'}
          </Button>
          
          <Button
            onClick={shuffleWords}
            className="hidden sm:flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </Button>
        </div>

        <Button
          onClick={nextWord}
          disabled={currentWordIndex === currentCategory.words.length - 1}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Word Counter */}
      <div className="text-center text-gray-500">
        {currentWordIndex + 1} / {currentCategory.words.length}
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-3 sm:py-8 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl sm:text-6xl mb-4">🌍</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {languageMode === 'english-arabic' ? 'English to Arabic Vocabulary' : 'Arabic to English Vocabulary'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {languageMode === 'english-arabic' 
              ? 'Learn essential Arabic vocabulary with pronunciation guides and interactive flashcards'
              : 'Practice translating Arabic words to English with interactive learning tools'
            }
          </p>
        </motion.div>

        {/* Language Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg p-1 shadow-md flex w-full max-w-md">
            <Button
              onClick={() => setLanguageMode('english-arabic')}
              className={`flex-1 px-3 py-2 rounded-md transition-all ${
                languageMode === 'english-arabic'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              English → Arabic
            </Button>
            <Button
              onClick={() => setLanguageMode('arabic-english')}
              className={`flex-1 px-3 py-2 rounded-md transition-all ${
                languageMode === 'arabic-english'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Arabic → English
            </Button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Choose a Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {Object.entries(vocabularyCategories).map(([key, category]) => (
              <Button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`p-3 sm:p-4 rounded-lg transition-all ${
                  selectedCategory === key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-1">{category.icon}</div>
                  <div className="text-xs sm:text-sm font-medium">{category.title}</div>
                  <div className="text-[11px] sm:text-xs opacity-75">{category.words.length} words</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Learning Mode Selection */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(LEARNING_MODES).map(([key, mode]) => (
              <Button
                key={mode}
                onClick={() => setLearningMode(mode)}
                className={`px-3 py-2 rounded-lg text-sm sm:text-base ${
                  learningMode === mode
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                {mode === LEARNING_MODES.FLASHCARD && <BookOpen className="w-4 h-4 mr-2" />}
                {mode === LEARNING_MODES.QUIZ && <Globe className="w-4 h-4 mr-2" />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              {currentCategory.title} Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {renderFlashcardMode()}
          </CardContent>
        </Card>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  {languageMode === 'english-arabic' ? 'English to Arabic Favorites' : 'Arabic to English Favorites'} ({favorites.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {favorites.map((word, index) => (
                    <div key={index} className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                      <div className="font-bold text-gray-800">
                        {languageMode === 'english-arabic' ? word.english : word.arabic}
                      </div>
                      <div className="text-base sm:text-lg text-blue-600">
                        {languageMode === 'english-arabic' ? word.arabic : word.english}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{word.transliteration}</div>
                      <div className="text-[11px] sm:text-xs text-gray-500">[{word.pronunciation}]</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
