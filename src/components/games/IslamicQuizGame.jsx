
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, Sparkles, Brain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";
import PropTypes from 'prop-types'; // Import PropTypes

// Placeholder for createPageUrl if it's not globally available.
// In a real app, this would likely be imported from a router or utility.
const createPageUrl = (pageName) => {
  // Example: If 'Challenges' maps to '/challenges'
  switch (pageName) {
    case "Challenges":
      return "/challenges";
    default:
      return `/${pageName.toLowerCase()}`;
  }
};

const questionBank = {
  easy: [
    {
      id: "easy_1",
      category: "Quran",
      question: "What is the first Surah in the Quran?",
      options: ["Al-Baqarah", "Al-Fatiha", "An-Nas", "Al-Ikhlas"],
      correct: 1,
      explanation: "Al-Fatiha is the opening chapter of the Quran."
    },
    {
      id: "easy_2",
      category: "Quran",
      question: "How many Surahs are in the Quran?",
      options: ["100", "114", "120", "99"],
      correct: 1,
      explanation: "The Quran has 114 chapters (Surahs)."
    },
    {
      id: "easy_3",
      category: "Prophets",
      question: "Who was the last Prophet sent by Allah?",
      options: ["Prophet Musa", "Prophet Isa", "Prophet Muhammad ﷺ", "Prophet Ibrahim"],
      correct: 2,
      explanation: "Prophet Muhammad ﷺ is the final messenger."
    },
    {
      id: "easy_4",
      category: "Fiqh",
      question: "How many times a day do Muslims pray?",
      options: ["3", "4", "5", "6"],
      correct: 2,
      explanation: "Muslims pray five times daily."
    },
    {
      id: "easy_5",
      category: "Fiqh",
      question: "What must you do before praying?",
      options: ["Sleep", "Eat", "Wudu", "Run"],
      correct: 2,
      explanation: "Wudu (ablution) is required before prayer."
    },
    {
      id: "easy_6",
      category: "Fiqh",
      question: "In which month do Muslims fast?",
      options: ["Shawwal", "Ramadan", "Dhul Hijjah", "Rajab"],
      correct: 1,
      explanation: "Muslims fast during Ramadan."
    },
    {
      id: "easy_7",
      category: "Akhlaq",
      question: "What should you say before eating?",
      options: ["Alhamdulillah", "Bismillah", "Masha'Allah", "Subhanallah"],
      correct: 1,
      explanation: "We say 'Bismillah' before eating."
    },
    {
      id: "easy_8",
      category: "Akhlaq",
      question: "What is the Islamic greeting?",
      options: ["Hello", "As-salamu alaikum", "Good morning", "Hi"],
      correct: 1,
      explanation: "Muslims greet with 'As-salamu alaikum'."
    },
    {
      id: "easy_9",
      category: "History",
      question: "Where is the Kaaba located?",
      options: ["Madinah", "Jerusalem", "Makkah", "Egypt"],
      correct: 2,
      explanation: "The Kaaba is in Makkah, Saudi Arabia."
    },
    {
      id: "easy_10",
      category: "Arabic",
      question: "What does 'Alhamdulillah' mean?",
      options: ["God is Great", "All praise is for Allah", "Peace be upon you", "In the name of Allah"],
      correct: 1,
      explanation: "Alhamdulillah means 'All praise is for Allah'."
    },
    {
      id: "easy_11",
      category: "Prophets",
      question: "Which prophet was swallowed by a whale?",
      options: ["Prophet Musa", "Prophet Yunus", "Prophet Nuh", "Prophet Yusuf"],
      correct: 1,
      explanation: "Prophet Yunus (Jonah) was swallowed by a whale and prayed inside it."
    },
    {
      id: "easy_12",
      category: "Quran",
      question: "Which Surah is known as the 'Heart of the Quran'?",
      options: ["Al-Fatiha", "Yasin", "Al-Ikhlas", "Al-Mulk"],
      correct: 1,
      explanation: "Surah Yasin is called the heart of the Quran."
    },
    {
      id: "easy_13",
      category: "Beliefs",
      question: "How many angels are mentioned by name in the Quran?",
      options: ["2", "4", "6", "10"],
      correct: 0,
      explanation: "Two angels are mentioned by name: Jibreel and Mikail."
    },
    {
      id: "easy_14",
      category: "History",
      question: "What was the first masjid built in Islam?",
      options: ["Al-Aqsa", "Al-Haram", "Quba", "Nabawi"],
      correct: 2,
      explanation: "Masjid Quba was the first masjid in Islam."
    },
    {
      id: "easy_15",
      category: "Akhlaq",
      question: "What should you say after sneezing?",
      options: ["Masha'Allah", "Alhamdulillah", "Subhanallah", "Astaghfirullah"],
      correct: 1,
      explanation: "We say 'Alhamdulillah' after sneezing to thank Allah."
    }
  ],
  medium: [
    {
      id: "med_1",
      category: "Quran",
      question: "What is the longest Surah in the Quran?",
      options: ["Al-Fatiha", "Al-Baqarah", "Al-Imran", "An-Nisa"],
      correct: 1,
      explanation: "Surah Al-Baqarah has 286 verses."
    },
    {
      id: "med_2",
      category: "Quran",
      question: "In which Surah is the story of Prophet Yusuf mentioned?",
      options: ["Surah Yusuf", "Surah Maryam", "Surah Ibrahim", "Surah Musa"],
      correct: 0,
      explanation: "Surah Yusuf tells the beautiful story of Prophet Yusuf."
    },
    {
      id: "med_3",
      category: "Seerah",
      question: "What was the night journey of the Prophet ﷺ called?",
      options: ["Hijrah", "Isra and Mi'raj", "Umrah", "Hajj"],
      correct: 1,
      explanation: "Isra and Mi'raj was the miraculous night journey."
    },
    {
      id: "med_4",
      category: "Seerah",
      question: "Who was the first wife of Prophet Muhammad ﷺ?",
      options: ["Aisha", "Khadijah", "Hafsa", "Fatimah"],
      correct: 1,
      explanation: "Khadijah (RA) was the Prophet's first wife."
    },
    {
      id: "med_5",
      category: "Fiqh",
      question: "What is Zakat?",
      options: ["Prayer", "Charity", "Fasting", "Pilgrimage"],
      correct: 1,
      explanation: "Zakat is obligatory charity."
    },
    {
      id: "med_6",
      category: "Fiqh",
      question: "How many Rakats are in Fajr prayer?",
      options: ["2", "3", "4", "5"],
      correct: 0,
      explanation: "Fajr prayer has 2 Rakats."
    },
    {
      id: "med_7",
      category: "History",
      question: "Who was the first Caliph after Prophet Muhammad ﷺ?",
      options: ["Umar", "Uthman", "Ali", "Abu Bakr"],
      correct: 3,
      explanation: "Abu Bakr As-Siddiq (RA) was the first Caliph."
    },
    {
      id: "med_8",
      category: "Hadith",
      question: "The Prophet ﷺ said: 'The best of you are those who are best to their...'",
      options: ["Friends", "Families", "Neighbors", "Animals"],
      correct: 1,
      explanation: "The Prophet ﷺ emphasized treating family well."
    },
    {
      id: "med_9",
      category: "Islamic Calendar",
      question: "Which is the 9th month of the Islamic calendar?",
      options: ["Shawwal", "Ramadan", "Dhul Hijjah", "Muharram"],
      correct: 1,
      explanation: "Ramadan is the 9th month."
    },
    {
      id: "med_10",
      category: "Akhlaq",
      question: "What did the Prophet ﷺ say is the heaviest thing on the scale of deeds?",
      options: ["Prayer", "Charity", "Good character", "Fasting"],
      correct: 2,
      explanation: "Good character is the heaviest on the scale."
    },
    {
      id: "med_11",
      category: "Prophets",
      question: "Which prophet was given the Torah?",
      options: ["Prophet Ibrahim", "Prophet Musa", "Prophet Isa", "Prophet Dawud"],
      correct: 1,
      explanation: "Prophet Musa (Moses) was given the Torah."
    },
    {
      id: "med_12",
      category: "Beliefs",
      question: "What are the pillars of Iman (faith)?",
      options: ["5 pillars", "6 pillars", "7 pillars", "4 pillars"],
      correct: 1,
      explanation: "There are 6 pillars of Iman: belief in Allah, angels, books, prophets, Day of Judgment, and Qadr."
    },
    {
      id: "med_13",
      category: "Quran",
      question: "Which Surah was revealed entirely in one night?",
      options: ["Al-Ikhlas", "Al-Kawthar", "Al-Fatiha", "Al-Asr"],
      correct: 0,
      explanation: "Surah Al-Ikhlas was revealed in one night."
    },
    {
      id: "med_14",
      category: "History",
      question: "In which city was Prophet Muhammad ﷺ born?",
      options: ["Madinah", "Makkah", "Taif", "Jerusalem"],
      correct: 1,
      explanation: "Prophet Muhammad ﷺ was born in Makkah."
    },
    {
      id: "med_15",
      category: "Fiqh",
      question: "What is the difference between Fard and Sunnah?",
      options: ["Fard is obligatory, Sunnah is recommended", "They are the same", "Sunnah is obligatory, Fard is recommended", "Both are optional"],
      correct: 0,
      explanation: "Fard actions are obligatory, while Sunnah actions are highly recommended."
    }
  ],
  hard: [
    {
      id: "hard_1",
      category: "Quran",
      question: "How many prophets are mentioned by name in the Quran?",
      options: ["20", "25", "30", "40"],
      correct: 1,
      explanation: "The Quran mentions 25 prophets by name."
    },
    {
      id: "hard_2",
      category: "Quran",
      question: "What is the shortest Surah in the Quran?",
      options: ["Al-Ikhlas", "Al-Kawthar", "An-Nasr", "Al-Asr"],
      correct: 1,
      explanation: "Surah Al-Kawthar has only 3 verses."
    },
    {
      id: "hard_3",
      category: "Seerah",
      question: "What was the name of the cave where the Quran was first revealed?",
      options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Badr"],
      correct: 1,
      explanation: "The first revelation came in the Cave of Hira."
    },
    {
      id: "hard_4",
      category: "History",
      question: "How many Muslims fought in the Battle of Badr?",
      options: ["100", "313", "500", "1000"],
      correct: 1,
      explanation: "Only 313 Muslims fought in the Battle of Badr."
    },
    {
      id: "hard_5",
      category: "Fiqh",
      question: "What is the meaning of 'Tawhid'?",
      options: ["Prayer", "Oneness of Allah", "Charity", "Fasting"],
      correct: 1,
      explanation: "Tawhid is the oneness of Allah."
    },
    {
      id: "hard_6",
      category: "Hadith",
      question: "According to hadith, what are the three things that continue after death?",
      options: ["Wealth, family, house", "Charity, knowledge, righteous children", "Prayer, fasting, Hajj", "Gold, silver, land"],
      correct: 1,
      explanation: "Charity, beneficial knowledge, and righteous children continue after death."
    },
    {
      id: "hard_7",
      category: "Beliefs",
      question: "Which angel blows the trumpet on the Day of Judgment?",
      options: ["Jibreel", "Mikail", "Israfil", "Azrael"],
      correct: 2,
      explanation: "Angel Israfil will blow the trumpet."
    },
    {
      id: "hard_8",
      category: "History",
      question: "Who was known as 'Sayfu-llah' (Sword of Allah)?",
      options: ["Abu Bakr", "Umar", "Khalid ibn Walid", "Ali"],
      correct: 2,
      explanation: "Khalid ibn Walid (RA) was called Sword of Allah."
    },
    {
      id: "hard_9",
      category: "Fiqh",
      question: "Worship on Laylatul Qadr is better than how many months?",
      options: ["100", "500", "1000", "10000"],
      correct: 2,
      explanation: "Laylatul Qadr is better than a thousand months."
    },
    {
      id: "hard_10",
      category: "History",
      question: "What was the first masjid built in Islam?",
      options: ["Masjid al-Haram", "Masjid an-Nabawi", "Masjid Quba", "Masjid al-Aqsa"],
      correct: 2,
      explanation: "Masjid Quba was the first masjid in Islam."
    },
    {
      id: "hard_11",
      category: "Quran",
      question: "Which Surah does not begin with Bismillah?",
      options: ["Surah Al-Fatiha", "Surah At-Tawbah", "Surah Al-Ikhlas", "Surah An-Nas"],
      correct: 1,
      explanation: "Surah At-Tawbah (Chapter 9) is the only Surah that doesn't begin with Bismillah."
    },
    {
      id: "hard_12",
      category: "Prophets",
      question: "Which prophet could speak to animals and understand their language?",
      options: ["Prophet Dawud", "Prophet Sulaiman", "Prophet Musa", "Prophet Isa"],
      correct: 1,
      explanation: "Prophet Sulaiman (Solomon) was given the ability to understand and speak to animals."
    },
    {
      id: "hard_13",
      category: "History",
      question: "How many years did Prophet Muhammad ﷺ receive revelation?",
      options: ["10 years", "15 years", "23 years", "30 years"],
      correct: 2,
      explanation: "The Prophet ﷺ received revelation for 23 years (13 in Makkah, 10 in Madinah)."
    },
    {
      id: "hard_14",
      category: "Beliefs",
      question: "What is the name of the bridge over Hell that everyone must cross?",
      options: ["Sirat", "Mizan", "Araf", "Barzakh"],
      correct: 0,
      explanation: "As-Sirat is the bridge that everyone must cross on the Day of Judgment."
    },
    {
      id: "hard_15",
      category: "Hadith",
      question: "What did the Prophet ﷺ say is the key to Paradise?",
      options: ["Fasting", "Prayer", "Charity", "Good character"],
      correct: 1,
      explanation: "The Prophet ﷺ said: 'Prayer is the key to Paradise.'"
    },
    {
      id: "hard_16",
      category: "Quran",
      question: "Which Surah contains two Bismillahs?",
      options: ["Surah Al-Baqarah", "Surah An-Naml", "Surah Al-Fatiha", "Surah Yasin"],
      correct: 1,
      explanation: "Surah An-Naml (The Ant) contains Bismillah at the beginning and in verse 30 as part of Prophet Sulaiman's letter."
    },
    {
      id: "hard_17",
      category: "History",
      question: "What was the Treaty of Hudaybiyyah mainly about?",
      options: ["Trade agreement", "Ten-year peace treaty", "Alliance against enemies", "Division of land"],
      correct: 1,
      explanation: "The Treaty of Hudaybiyyah was a pivotal peace treaty between Muslims and Quraysh that lasted 10 years."
    },
    {
      id: "hard_18",
      category: "Fiqh",
      question: "What is the minimum nisab (threshold) for Zakat on gold?",
      options: ["50 grams", "612 grams", "85 grams", "100 grams"],
      correct: 2,
      explanation: "The nisab for gold is 85 grams (or 7.5 tolas), and 2.5% must be given as Zakat."
    },
    {
      id: "hard_19",
      category: "Prophets",
      question: "Which prophet is mentioned most in the Quran?",
      options: ["Prophet Muhammad ﷺ", "Prophet Ibrahim", "Prophet Musa", "Prophet Isa"],
      correct: 2,
      explanation: "Prophet Musa (Moses) is mentioned approximately 136 times in the Quran, more than any other prophet."
    },
    {
      id: "hard_20",
      category: "Beliefs",
      question: "What is the name of the book that records good deeds?",
      options: ["Sijjin", "Illiyyin", "Lawh al-Mahfuz", "Mushaf"],
      correct: 1,
      explanation: "Illiyyin is the book where the records of the righteous are kept, while Sijjin records the deeds of the wicked."
    },
    {
      id: "hard_21",
      category: "Quran",
      question: "How many times is the word 'Jannah' (Paradise) mentioned in the Quran?",
      options: ["77 times", "147 times", "66 times", "99 times"],
      correct: 1,
      explanation: "The word 'Jannah' is mentioned 147 times in the Quran, emphasizing Allah's promise to the believers."
    },
    {
      id: "hard_22",
      category: "History",
      question: "Who was the companion known as 'Al-Farooq' (the one who distinguishes)?",
      options: ["Abu Bakr", "Umar ibn Al-Khattab", "Uthman ibn Affan", "Ali ibn Abi Talib"],
      correct: 1,
      explanation: "Umar ibn Al-Khattab was given the title 'Al-Farooq' because he distinguished between truth and falsehood."
    },
    {
      id: "hard_23",
      category: "Seerah",
      question: "How many children did Prophet Muhammad ﷺ have?",
      options: ["5", "7", "9", "11"],
      correct: 1,
      explanation: "The Prophet ﷺ had 7 children: 3 sons (Qasim, Abdullah, Ibrahim) and 4 daughters (Zainab, Ruqayyah, Umm Kulthum, Fatimah)."
    },
    {
      id: "hard_24",
      category: "Fiqh",
      question: "What is the Arabic term for the pre-dawn meal during Ramadan?",
      options: ["Iftar", "Suhoor", "Taraweeh", "Qiyam"],
      correct: 1,
      explanation: "Suhoor is the pre-dawn meal eaten before beginning the fast, while Iftar is the meal to break the fast."
    },
    {
      id: "hard_25",
      category: "Beliefs",
      question: "What are the two types of revelation (Wahy) given to prophets?",
      options: ["Direct and Indirect", "Wahy Matlu and Wahy Ghair Matlu", "Open and Hidden", "Written and Spoken"],
      correct: 1,
      explanation: "Wahy Matlu (recited revelation - Quran) and Wahy Ghair Matlu (non-recited revelation - Sunnah) are the two types."
    }
  ],
  expert: [
    {
      id: "expert_1",
      category: "Quran",
      question: "Which Surah contains the verse known as 'Ayat al-Kursi' (The Throne Verse)?",
      options: ["Surah Al-Baqarah", "Surah Al-Imran", "Surah An-Nisa", "Surah Al-Fatiha"],
      correct: 0,
      explanation: "Ayat al-Kursi is verse 255 of Surah Al-Baqarah and is considered one of the most powerful verses in the Quran."
    },
    {
      id: "expert_2",
      category: "History",
      question: "During which Hijri year did the Battle of Khandaq (Trench) occur?",
      options: ["3 AH", "5 AH", "7 AH", "9 AH"],
      correct: 1,
      explanation: "The Battle of Khandaq occurred in 5 AH (627 CE) when the Muslims dug a trench to defend Madinah from the confederate forces."
    },
    {
      id: "expert_3",
      category: "Fiqh",
      question: "What is the minimum duration for I'tikaf to be valid?",
      options: ["One day", "One night", "Any amount of time with intention", "Three days"],
      correct: 2,
      explanation: "According to many scholars, I'tikaf can be for any duration with proper intention, though longer periods (especially last 10 days of Ramadan) are more meritorious."
    },
    {
      id: "expert_4",
      category: "Quran",
      question: "How many verses of prostration (Sajdah) are in the Quran?",
      options: ["11", "14", "15", "17"],
      correct: 2,
      explanation: "There are 15 places of prostration (Sajdah Tilawah) in the Quran according to the majority of scholars."
    },
    {
      id: "expert_5",
      category: "Beliefs",
      question: "What is the Arabic term for the resurrection on the Day of Judgment?",
      options: ["Qiyamah", "Ba'ath", "Hashr", "Mizan"],
      correct: 1,
      explanation: "Ba'ath specifically refers to the resurrection of all people from their graves, while Qiyamah refers to the Day of Judgment itself."
    },
    {
      id: "expert_6",
      category: "Hadith",
      question: "Who compiled Sahih Muslim?",
      options: ["Imam Bukhari", "Imam Muslim ibn al-Hajjaj", "Imam Ahmad ibn Hanbal", "Imam Abu Dawud"],
      correct: 1,
      explanation: "Imam Muslim ibn al-Hajjaj al-Naysaburi compiled Sahih Muslim, one of the six major hadith collections (Kutub al-Sittah)."
    },
    {
      id: "expert_7",
      category: "Prophets",
      question: "Which prophet was given the Zabur (Psalms)?",
      options: ["Prophet Musa", "Prophet Isa", "Prophet Dawud", "Prophet Sulaiman"],
      correct: 2,
      explanation: "Prophet Dawud (David) was given the Zabur (Psalms), one of the four major revealed books."
    },
    {
      id: "expert_8",
      category: "History",
      question: "Who was the first martyr (Shaheed) in Islam?",
      options: ["Hamza ibn Abdul-Muttalib", "Sumayyah bint Khayyat", "Mus'ab ibn Umayr", "Yasir ibn Amir"],
      correct: 1,
      explanation: "Sumayyah bint Khayyat was the first martyr in Islam, killed for refusing to renounce her faith during the early persecution in Makkah."
    },
    {
      id: "expert_9",
      category: "Fiqh",
      question: "What is the Arabic term for the consensus of Islamic scholars?",
      options: ["Qiyas", "Ijma", "Ijtihad", "Istihsan"],
      correct: 1,
      explanation: "Ijma refers to the consensus of qualified Islamic scholars on a particular matter and is considered a source of Islamic law."
    },
    {
      id: "expert_10",
      category: "Quran",
      question: "Which Surah is named after a metal?",
      options: ["Surah Al-Hadid", "Surah An-Nahl", "Surah Al-Hijr", "Surah Al-Qamar"],
      correct: 0,
      explanation: "Surah Al-Hadid (Chapter 57) is named after iron (Hadid), which is mentioned in verse 25 as something sent down by Allah with great strength."
    }
  ]
};

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function IslamicQuizGame({ onComplete, challengeId }) {
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0); // This will accumulate raw points (2 per correct answer)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0); // Tracks how many questions were answered correctly
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [user, setUser] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const difficulties = [
    { id: "easy", name: "Easy", icon: "🌱", color: "from-green-500 to-green-600", count: 5 },
    { id: "medium", name: "Medium", icon: "⚡", color: "from-yellow-500 to-orange-500", count: 5 },
    { id: "hard", name: "Hard", icon: "🔥", color: "from-red-500 to-red-600", count: 5 },
    { id: "expert", name: "Expert", icon: "💎", color: "from-purple-600 to-indigo-700", count: 5 }
  ];

  useEffect(() => {
    loadUser();
    if (challengeId) {
      loadChallenge();
    }
  }, [challengeId]);

  useEffect(() => {
    if (difficulty && user) { // Ensure user is loaded to fetch user-specific game progress
      loadQuestionsAvoidingRepeats();
    } else if (difficulty && !user && !isChallengeMode) {
      // If not in challenge mode and no user, load questions without repetition logic
      const availableQuestions = questionBank[difficulty];
      const shuffled = shuffleArray([...availableQuestions]);
      const diffConfig = difficulties.find(d => d.id === difficulty);
      const selected = shuffled.slice(0, diffConfig.count);
      setQuestions(selected);
      setUsedQuestionIds(selected.map(q => q.id));
    }
  }, [difficulty, user, isChallengeMode]); // Add user to dependency array

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      console.log("User not authenticated or error loading user:", error);
    }
  };

  const loadChallenge = async () => {
    try {
      const challenges = await base44.entities.Challenge.filter({ id: challengeId });
      if (challenges.length > 0) {
        const loadedChallenge = challenges[0];
        setChallenge(loadedChallenge);
        setIsChallengeMode(true);
        // Set difficulty from the challenge if available
        if (loadedChallenge.difficulty) {
          setDifficulty(loadedChallenge.difficulty);
        } else {
          console.error("Challenge does not specify difficulty.");
        }
      }
    } catch (error) {
      console.error("Error loading challenge:", error);
    }
  };

  const loadQuestionsAvoidingRepeats = async () => {
    if (!user) {
      // Should not happen if useEffect dependencies are correct, but as a safeguard.
      console.warn("Attempted to load questions avoiding repeats without a user.");
      return;
    }

    let previouslyUsed = [];
    try {
      const progress = await base44.entities.UserGameProgress.filter({ 
        user_id: user.id, 
        game_type: "islamic_quiz" 
      });
      if (progress.length > 0) {
        previouslyUsed = progress[0].completed_questions || [];
      }
    } catch (error) {
      console.log("No previous progress found for user or error fetching progress:", error);
    }

    const availableQuestions = questionBank[difficulty];
    // Filter out previously used questions
    let unusedQuestions = availableQuestions.filter(q => !previouslyUsed.includes(q.id));
    
    // If we have fewer than `diffConfig.count` unused questions, reset by using all available questions for this difficulty
    const diffConfig = difficulties.find(d => d.id === difficulty);
    const numQuestionsNeeded = diffConfig.count;

    let questionsToSelectFrom;
    if (unusedQuestions.length < numQuestionsNeeded) {
        console.log(`Not enough new questions for difficulty ${difficulty}. Resetting questions for this round.`);
        questionsToSelectFrom = availableQuestions; // Use all questions for this difficulty
    } else {
        questionsToSelectFrom = unusedQuestions;
    }
    
    const shuffled = shuffleArray([...questionsToSelectFrom]);
    const selected = shuffled.slice(0, numQuestionsNeeded);
    
    setQuestions(selected);
    setUsedQuestionIds(selected.map(q => q.id));
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(prevScore => prevScore + 2); // Raw points for display in current game progress
      setCorrectAnswersCount(prev => prev + 1); // Track count of correct answers
    }

    setTimeout(() => {
      setShowExplanation(true);
    }, 1000);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
    } else {
      completeGame();
    }
  };

  const checkDailyCompletionBonus = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const todaysScores = await base44.entities.GameScore.filter({
        user_id: userId,
        // Assuming created_date field in GameScore is stored in a format compatible with string comparison for the day
        created_date: { _gte: `${today}T00:00:00.000Z`, _lte: `${today}T23:59:59.999Z` }
        // The outline implies `created_date: today` works, but a range is safer for date comparison.
        // If 'created_date' is a string, and `base44` supports filtering by string prefix, `created_date: today` works.
        // For robustness, I'm using _gte and _lte for a full day range.
      });
      
      // Get unique game types played today, excluding the daily bonus itself
      const uniqueGames = [...new Set(todaysScores.map(s => s.game_type))].filter(gt => gt !== 'daily_completion_bonus');
      const totalGames = 13; // Total number of different games (as per outline)
      
      if (uniqueGames.length >= totalGames) {
        // Check if bonus already given today
        const existingBonus = todaysScores.find(s => s.game_type === 'daily_completion_bonus');
        
        if (!existingBonus) {
          await base44.entities.GameScore.create({
            user_id: userId,
            game_type: 'daily_completion_bonus',
            score: 10,
            bonus_points: 10,
            completed: true
          });

          // Also add these 10 points to the user's total points immediately
          const userAfterBonus = await base44.auth.me(); // Fetch latest user data
          const newTotalPointsForUserWithBonus = Math.min((userAfterBonus.points || 0) + 10, 1500);
          await base44.auth.updateMe({ points: newTotalPointsForUserWithBonus });
          console.log("Daily completion bonus awarded!");
        }
      }
    } catch (error) {
      console.log("Error checking daily bonus:", error);
    }
  };

  const completeGame = async () => {
    setGameCompleted(true);
    setStatusMessage("");
    setErrorMessage("");
    // Always award 10 points regardless of performance
    const finalAwardedPoints = 10;
    if (user) {
      try {
        await awardPointsForGame(user, "islamic_quiz", { fallbackScore: finalAwardedPoints });
        setStatusMessage("Points awarded successfully! Your profile and leaderboard will update shortly.");
        // Update user progress with used questions
        const existingProgress = await base44.entities.UserGameProgress.filter({ 
          user_id: user.id, 
          game_type: "islamic_quiz" 
        });
        
        if (existingProgress.length > 0) {
          const currentCompleted = existingProgress[0].completed_questions || [];
          const updatedCompleted = [...new Set([...currentCompleted, ...usedQuestionIds])];
          
          const allQuestionIds = Object.values(questionBank).flat().map(q => q.id);
          const finalCompleted = updatedCompleted.length >= allQuestionIds.length ? [] : updatedCompleted;
          
          await base44.entities.UserGameProgress.update(existingProgress[0].id, {
            completed_questions: finalCompleted,
            total_games_played: (existingProgress[0].total_games_played || 0) + 1,
            best_score: Math.max(existingProgress[0].best_score || 0, finalAwardedPoints) // Use finalAwardedPoints
          });
        } else {
          await base44.entities.UserGameProgress.create({
            user_id: user.id,
            game_type: "islamic_quiz",
            completed_questions: usedQuestionIds,
            total_games_played: 1,
            best_score: finalAwardedPoints // Use finalAwardedPoints
          });
        }
        
        // If in challenge mode, update challenge score
        if (isChallengeMode && challenge) {
          const isChallenger = challenge.challenger_id === user.id;
          const updateData = isChallenger 
            ? { challenger_score: finalAwardedPoints }
            : { opponent_score: finalAwardedPoints };

          const otherPlayerScoreValue = isChallenger ? challenge.opponent_score : challenge.challenger_score;
          const hasOtherPlayerPlayed = (otherPlayerScoreValue !== null && otherPlayerScoreValue !== undefined);

          if (hasOtherPlayerPlayed) {
            const finalChallengerScore = isChallenger ? finalAwardedPoints : challenge.challenger_score;
            const finalOpponentScore = isChallenger ? challenge.opponent_score : finalAwardedPoints;
            
            let winnerId = null;
            if (finalChallengerScore > finalOpponentScore) {
              winnerId = challenge.challenger_id;
            } else if (finalOpponentScore > finalChallengerScore) {
              winnerId = challenge.opponent_id;
            }
            
            updateData.status = "completed";
            if (winnerId) updateData.winner_id = winnerId;
          }

          await base44.entities.Challenge.update(challenge.id, updateData);
        }

        // Check for daily completion bonus
        await checkDailyCompletionBonus(user.id);
        
        // Set the component's score state to the final score for display
        setScore(finalAwardedPoints);
      } catch (error) {
        setErrorMessage("Failed to award points or save progress. Please check your permissions or try again later.");
        console.error("Error saving score or user progress:", error);
      }
    }
    
    if (onComplete) {
      onComplete(finalAwardedPoints);
    }
  };

  if (!difficulty && !isChallengeMode) { // Only show difficulty selection if not in challenge mode and difficulty not set
    return (
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
          <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
            <Brain className="w-8 h-8" />
            Choose Your Level
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {difficulties.map((diff, index) => (
              <motion.button
                key={diff.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setDifficulty(diff.id)}
                className={`p-8 rounded-2xl bg-gradient-to-br ${diff.color} text-white shadow-xl hover:shadow-2xl transition-all`}
              >
                <div className="text-6xl mb-4">{diff.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{diff.name}</h3>
                <p className="text-sm opacity-90">{diff.count} questions</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameCompleted) {
    // 'score' state at this point holds the final awarded 10 points
    // 'correctAnswersCount' holds the actual count of correctly answered questions
    const percentage = Math.round((correctAnswersCount / questions.length) * 100);

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-amber-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Masha'Allah! 🎉
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
              <p className="text-5xl font-bold text-blue-600 mb-2">10 points</p>
              <p className="text-lg text-gray-700">
                You got {correctAnswersCount} out of {questions.length} correct!
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{percentage}%</p>
              
              <div className="mt-4 p-3 bg-green-100 rounded-lg border-2 border-green-400">
                <p className="text-sm font-bold text-green-900 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 fill-green-500" />
                  Fair Points: Every game awards 10 points!
                </p>
              </div>
              
              {isChallengeMode && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
                  <p className="text-sm font-semibold text-amber-900">
                    ⚔️ Challenge score saved! Check the Challenges page to see results.
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                if (isChallengeMode) {
                  window.location.href = createPageUrl("Challenges");
                } else {
                  setDifficulty(null);
                  setCurrentQuestion(0);
                  setScore(0);
                  setCorrectAnswersCount(0); // Reset correct answers count
                  setGameCompleted(false);
                  setUsedQuestionIds([]); // Reset used question IDs for a new game
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {isChallengeMode ? "View Challenge Results" : "Play Again"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // If in challenge mode, and questions are not yet loaded (difficulty not set by challenge yet), show loading.
  if (isChallengeMode && (!difficulty || questions.length === 0)) {
    return <div className="text-center py-12">Loading Challenge...</div>;
  }
  
  if (questions.length === 0) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl">Islamic Quiz</CardTitle>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
            <Star className="w-5 h-5" />
            <span className="font-bold">{score} pts</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <Badge className="bg-white/20">{question.category}</Badge>
          </div>
          <Progress value={progress} className="bg-white/20" />
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        {!showExplanation ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8">{question.question}</h3>
              
              <div className="grid gap-4">
                {question.options.map((option, index) => {
                  const isCorrect = index === question.correct;
                  const isSelected = index === selectedAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => !showResult && handleAnswer(index)}
                      disabled={showResult}
                      className={`h-auto py-4 px-6 text-lg justify-start ${
                        showCorrect
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : showWrong
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-white hover:bg-blue-50 text-gray-900 border-2"
                      }`}
                      variant={showResult ? "default" : "outline"}
                    >
                      <span className="flex-1 text-left">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-6 h-6 ml-2" />}
                      {showWrong && <XCircle className="w-6 h-6 ml-2" />}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-6">
              {selectedAnswer === question.correct ? "🎉" : "📚"}
            </div>
            <h3 className="text-2xl font-bold text-blue-600 mb-4">
              {selectedAnswer === question.correct ? "Correct!" : "Learn from this:"}
            </h3>
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <p className="text-lg text-gray-700">{question.explanation}</p>
            </div>
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

IslamicQuizGame.propTypes = {
  onComplete: PropTypes.func,
  challengeId: PropTypes.string
};

