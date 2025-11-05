import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, Sparkles, RotateCcw, Lightbulb } from "lucide-react";
// import { base44 } from "@/api/base44Client";
import PropTypes from 'prop-types';

const wordBank = {
  easy: {
    prophets: [
      { word: "ADAM", hint: "The first prophet", topic: "First human" },
      { word: "NUH", hint: "Built the ark", topic: "Prophet of the flood" },
      { word: "MUSA", hint: "Spoke to Allah", topic: "Prophet with staff" },
      { word: "ISA", hint: "Born without father", topic: "Miracle birth" },
      { word: "YUSUF", hint: "Had prophetic dreams", topic: "Handsome prophet" },
    ],
    quran: [
      { word: "FATIHA", hint: "Opening chapter", topic: "First Surah" },
      { word: "AYAH", hint: "Quranic verse", topic: "Verse" },
      { word: "SURAH", hint: "Chapter of Quran", topic: "Chapter" },
      { word: "JANNAH", hint: "Paradise", topic: "Heaven" },
      { word: "IMAN", hint: "Faith", topic: "Belief" },
    ],
    salah: [
      { word: "FAJR", hint: "Dawn prayer", topic: "Morning prayer" },
      { word: "RUKU", hint: "Bowing position", topic: "Bow" },
      { word: "SUJUD", hint: "Prostration", topic: "Prostrate" },
      { word: "WUDU", hint: "Ablution", topic: "Washing" },
      { word: "QIBLA", hint: "Direction of prayer", topic: "To Kaaba" },
    ],
    general: [
      { word: "ALLAH", hint: "The One God", topic: "God" },
      { word: "ISLAM", hint: "Religion of peace", topic: "Our religion" },
      { word: "MUSLIM", hint: "Follower of Islam", topic: "Believer" },
      { word: "KAABA", hint: "House of Allah", topic: "Sacred house" },
      { word: "MAKKAH", hint: "Holy city", topic: "Sacred city" },
    ]
  },
  medium: {
    prophets: [
      { word: "IBRAHIM", hint: "Father of prophets", topic: "Built the Kaaba" },
      { word: "MUHAMMAD", hint: "Final prophet", topic: "Last messenger" },
      { word: "SULAIMAN", hint: "Talked to animals", topic: "King prophet" },
      { word: "DAWUD", hint: "Beautiful voice", topic: "Zabur revealed" },
      { word: "YUNUS", hint: "Swallowed by whale", topic: "In the whale" },
    ],
    quran: [
      { word: "BAQARAH", hint: "Longest Surah", topic: "The Cow" },
      { word: "YASIN", hint: "Heart of Quran", topic: "Special Surah" },
      { word: "TAWHID", hint: "Oneness of Allah", topic: "Monotheism" },
      { word: "HIJAB", hint: "Modest covering", topic: "Islamic dress" },
      { word: "RAMADAN", hint: "Month of fasting", topic: "Holy month" },
    ],
    salah: [
      { word: "MAGHRIB", hint: "Sunset prayer", topic: "Evening prayer" },
      { word: "TAKBIR", hint: "Allahu Akbar", topic: "Allah is Great" },
      { word: "TASHAHHUD", hint: "Sitting testimony", topic: "Shahada in prayer" },
      { word: "TAHAJJUD", hint: "Night prayer", topic: "Late night prayer" },
      { word: "KHUSHU", hint: "Concentration", topic: "Focus in prayer" },
    ],
    general: [
      { word: "MADINAH", hint: "City of Prophet", topic: "Illuminated city" },
      { word: "SADAQAH", hint: "Charity", topic: "Voluntary giving" },
      { word: "SHAHADAH", hint: "Testimony of faith", topic: "Declaration" },
      { word: "SUNNAH", hint: "Prophet's way", topic: "His example" },
      { word: "HADITH", hint: "Prophet's sayings", topic: "His words" },
    ]
  },
  hard: {
    prophets: [
      { word: "ISMAIL", hint: "Son of Ibrahim", topic: "Sacrificed son" },
      { word: "ZAKARIYA", hint: "Father of Yahya", topic: "Old age miracle" },
      { word: "IDRIS", hint: "First to write", topic: "Raised to heaven" },
      { word: "AYYUB", hint: "Patient prophet", topic: "Tested greatly" },
      { word: "HARUN", hint: "Brother of Musa", topic: "Assistant prophet" },
    ],
    quran: [
      { word: "IKHLAS", hint: "Surah of sincerity", topic: "Pure faith" },
      { word: "MUTASHABIHAT", hint: "Ambiguous verses", topic: "Unclear verses" },
      { word: "MUHKAMAT", hint: "Clear verses", topic: "Precise verses" },
      { word: "TANZIL", hint: "Revelation", topic: "Sent down" },
      { word: "TARTIL", hint: "Slow recitation", topic: "Clear reading" },
    ],
    salah: [
      { word: "ISTIKHARAH", hint: "Seeking guidance", topic: "Consultation prayer" },
      { word: "JANAZAH", hint: "Funeral prayer", topic: "Death prayer" },
      { word: "QIYAM", hint: "Standing position", topic: "Stand in prayer" },
      { word: "SALAM", hint: "End of prayer", topic: "Peace greeting" },
      { word: "WITR", hint: "Odd numbered prayer", topic: "Night prayer" },
    ],
    general: [
      { word: "TASBIH", hint: "SubhanAllah", topic: "Glorification" },
      { word: "ISTIGHFAR", hint: "Seeking forgiveness", topic: "Repentance" },
      { word: "BARAKAH", hint: "Divine blessing", topic: "Blessing" },
      { word: "TAQWA", hint: "God consciousness", topic: "Piety" },
      { word: "UMMAH", hint: "Muslim community", topic: "Community" },
    ]
  }
};

const topics = [
  { id: "prophets", name: "Prophets", icon: "✨", color: "from-blue-500 to-cyan-500" },
  { id: "quran", name: "Quran", icon: "📖", color: "from-green-500 to-teal-500" },
  { id: "salah", name: "Salah", icon: "🕌", color: "from-purple-500 to-pink-500" },
  { id: "general", name: "General", icon: "🌟", color: "from-amber-500 to-orange-500" }
];

const difficulties = [
  { id: "easy", name: "Easy", icon: "🌱", color: "from-green-400 to-green-600" },
  { id: "medium", name: "Medium", icon: "⚡", color: "from-yellow-400 to-orange-500" },
  { id: "hard", name: "Hard", icon: "🔥", color: "from-red-400 to-red-600" }
];

const shuffleWord = (word) => {
  const letters = word.split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join('');
};

export default function WordScrambleGame({ onComplete }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [user, setUser] = useState(null);
  const [words, setWords] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (selectedTopic && selectedDifficulty) {
      const topicWords = wordBank[selectedDifficulty]?.[selectedTopic];
      if (topicWords && topicWords.length > 0) {
        setWords(topicWords);
        setCurrentWordIndex(0);
        setTotalQuestions(topicWords.length);
        scrambleCurrentWord(topicWords[0]);
      }
    }
  }, [selectedTopic, selectedDifficulty]);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  const scrambleCurrentWord = (wordObj) => {
    if (!wordObj || !wordObj.word) return;
    
    let scrambled = shuffleWord(wordObj.word);
    let attempts = 0;
    while (scrambled === wordObj.word && attempts < 10) {
      scrambled = shuffleWord(wordObj.word);
      attempts++;
    }
    setScrambledWord(scrambled);
    setUserAnswer("");
    setShowResult(false);
    setShowHint(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!words[currentWordIndex]) return;
    
    const currentWord = words[currentWordIndex];
    const correct = userAnswer.toUpperCase() === currentWord.word;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      const points = selectedDifficulty === "easy" ? 5 : selectedDifficulty === "medium" ? 10 : 15;
      setScore(score + points);
    }
  };

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      scrambleCurrentWord(words[nextIndex]);
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    setGameComplete(true);
    
    const finalScore = 10;
    
    if (user && onComplete) {
      onComplete(finalScore);
    }
  };

  const resetGame = () => {
    setSelectedTopic(null);
    setSelectedDifficulty(null);
    setCurrentWordIndex(0);
    setScore(0);
    setGameComplete(false);
    setWords([]);
    setScrambledWord("");
    setUserAnswer("");
    setShowResult(false);
  };

  const reshuffleWord = () => {
    if (words[currentWordIndex]) {
      scrambleCurrentWord(words[currentWordIndex]);
    }
  };

  // Topic selection screen
  if (!selectedTopic) {
    return (
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-3xl text-center">Choose a Topic</CardTitle>
          <p className="text-center text-blue-100 mt-2">Unscramble Islamic words</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic, index) => (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-8 rounded-2xl bg-gradient-to-br ${topic.color} text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105`}
              >
                <div className="text-6xl mb-4">{topic.icon}</div>
                <h3 className="text-2xl font-bold">{topic.name}</h3>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Difficulty selection screen
  if (!selectedDifficulty) {
    return (
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="text-3xl text-center">Choose Difficulty</CardTitle>
          <p className="text-center text-purple-100 mt-2">
            Topic: {topics.find(t => t.id === selectedTopic)?.name}
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {difficulties.map((diff, index) => (
              <motion.button
                key={diff.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`p-8 rounded-2xl bg-gradient-to-br ${diff.color} text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105`}
              >
                <div className="text-6xl mb-4">{diff.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{diff.name}</h3>
                <p className="text-sm opacity-90">
                  {diff.id === "easy" ? "3-4 letters" : diff.id === "medium" ? "5-7 letters" : "8+ letters"}
                </p>
              </motion.button>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button onClick={() => setSelectedTopic(null)} variant="outline">
              Change Topic
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Game complete screen
  if (gameComplete) {
    const correctAnswers = Math.round((score / totalQuestions) / (selectedDifficulty === "easy" ? 5 : selectedDifficulty === "medium" ? 10 : 15));
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto shadow-2xl border-2 border-green-400">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Masha'Allah! 🎉
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <p className="text-5xl font-bold text-blue-600 mb-2">10 points</p>
              <p className="text-lg text-gray-700">
                You got {correctAnswers} out of {totalQuestions} correct!
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{percentage}%</p>
              
              <div className="mt-4 p-3 bg-green-100 rounded-lg border-2 border-green-400">
                <p className="text-sm font-bold text-green-900">
                  ✨ Fair Points: Every game awards 10 points!
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-blue-500 to-purple-500">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(10)} variant="outline">
                  Back to Games
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Loading screen - MUST come before we try to access words[currentWordIndex]
  if (!words || words.length === 0 || !words[currentWordIndex]) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4 animate-bounce">🔤</div>
          <p className="text-gray-600">Loading word...</p>
        </CardContent>
      </Card>
    );
  }

  // Main game screen - only render if currentWord exists
  const currentWord = words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / totalQuestions) * 100;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl">Word Scramble</CardTitle>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Star className="w-5 h-5" />
            <span className="font-bold">{score} pts</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentWordIndex + 1} of {totalQuestions}</span>
            <Badge className="bg-white/20">
              {topics.find(t => t.id === selectedTopic)?.name} - {selectedDifficulty}
            </Badge>
          </div>
          <Progress value={progress} className="bg-white/20" />
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {!showResult ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Topic: {currentWord.topic}</p>
              <h3 className="text-sm text-gray-500 mb-4">Unscramble this word:</h3>
              
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {scrambledWord.split('').map((letter, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>

              <div className="mb-4">
                <Button
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  size="sm"
                  className="mb-2"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {showHint ? "Hide" : "Show"} Hint
                </Button>
                <AnimatePresence>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-amber-600 text-sm italic"
                    >
                      💡 {currentWord.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                onClick={reshuffleWord}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reshuffle Letters
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-center">
                  Your Answer:
                </label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                  placeholder="Type your answer..."
                  className="text-center text-xl font-bold uppercase"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                size="lg"
                disabled={!userAnswer.trim()}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Check Answer
              </Button>
            </form>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-6">
              {isCorrect ? "🎉" : "📚"}
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: isCorrect ? "#10B981" : "#EF4444" }}>
              {isCorrect ? "Correct!" : "Not Quite!"}
            </h3>
            <div className={`rounded-xl p-6 mb-6 ${isCorrect ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}>
              {!isCorrect && (
                <p className="text-lg mb-2">
                  The correct answer is: <span className="font-bold text-blue-600">{currentWord.word}</span>
                </p>
              )}
              <p className="text-gray-700">
                <strong>Meaning:</strong> {currentWord.hint}
              </p>
            </div>
            <Button
              onClick={handleNext}
              size="lg"
              className={isCorrect ? "bg-gradient-to-r from-green-500 to-teal-500" : "bg-gradient-to-r from-amber-500 to-orange-500"}
            >
              {currentWordIndex < totalQuestions - 1 ? "Next Word" : "See Results"}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

WordScrambleGame.propTypes = {
  onComplete: PropTypes.func
};