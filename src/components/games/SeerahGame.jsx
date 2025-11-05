
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, Star, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PropTypes from 'prop-types';

const seerahQuestions = [
  // Birth and Early Life
  {
    id: "seerah_1",
    category: "Early Life",
    question: "In which year was Prophet Muhammad ﷺ born?",
    options: ["570 CE (Year of the Elephant)", "600 CE", "550 CE", "580 CE"],
    correct: 0,
    explanation: "Prophet Muhammad ﷺ was born in the Year of the Elephant (570 CE), the year when Abraha attempted to destroy the Kaaba."
  },
  {
    id: "seerah_2",
    category: "Early Life",
    question: "What was the Prophet's ﷺ father's name?",
    options: ["Abu Talib", "Abdullah", "Abdul Muttalib", "Abu Lahab"],
    correct: 1,
    explanation: "His father was Abdullah ibn Abdul Muttalib, who passed away before the Prophet ﷺ was born."
  },
  {
    id: "seerah_3",
    category: "Early Life",
    question: "Who nursed Prophet Muhammad ﷺ as a baby?",
    options: ["Khadijah", "Halimah Sa'diyah", "Aminah", "Fatimah"],
    correct: 1,
    explanation: "Halimah Sa'diyah was the wet nurse who took care of Prophet Muhammad ﷺ in the desert."
  },
  {
    id: "seerah_4",
    category: "Early Life",
    question: "At what age did Prophet Muhammad ﷺ lose his mother?",
    options: ["2 years", "4 years", "6 years", "8 years"],
    correct: 2,
    explanation: "Prophet Muhammad ﷺ was 6 years old when his mother Aminah passed away."
  },
  {
    id: "seerah_5",
    category: "Early Life",
    question: "Who raised the Prophet ﷺ after his mother passed away?",
    options: ["Abu Bakr", "His grandfather Abdul Muttalib, then his uncle Abu Talib", "His aunt", "Khadijah"],
    correct: 1,
    explanation: "First his grandfather Abdul Muttalib raised him, then after his grandfather's death, his uncle Abu Talib took care of him."
  },
  
  // Pre-Prophethood
  {
    id: "seerah_6",
    category: "Pre-Prophethood",
    question: "What was the Prophet ﷺ known as before prophethood?",
    options: ["Al-Amin (The Trustworthy)", "Al-Malik (The King)", "Al-Hakim (The Wise)", "Al-Qawi (The Strong)"],
    correct: 0,
    explanation: "He was called Al-Amin (The Trustworthy) and As-Sadiq (The Truthful) because of his honesty."
  },
  {
    id: "seerah_7",
    category: "Pre-Prophethood",
    question: "At what age did Prophet Muhammad ﷺ marry Khadijah?",
    options: ["20 years", "25 years", "30 years", "35 years"],
    correct: 1,
    explanation: "The Prophet ﷺ was 25 years old when he married Khadijah, who was 40."
  },
  {
    id: "seerah_8",
    category: "Pre-Prophethood",
    question: "What was the Prophet's ﷺ profession before prophethood?",
    options: ["Teacher", "Merchant/Trader", "Soldier", "Farmer"],
    correct: 1,
    explanation: "He worked as a merchant and trader, managing Khadijah's trade business."
  },
  
  // Beginning of Prophethood
  {
    id: "seerah_9",
    category: "Revelation",
    question: "At what age did the Prophet ﷺ receive his first revelation?",
    options: ["30 years", "35 years", "40 years", "45 years"],
    correct: 2,
    explanation: "Prophet Muhammad ﷺ received his first revelation at age 40 in the Cave of Hira."
  },
  {
    id: "seerah_10",
    category: "Revelation",
    question: "Which angel brought the revelation to the Prophet ﷺ?",
    options: ["Mikail", "Israfil", "Jibreel (Gabriel)", "Azrael"],
    correct: 2,
    explanation: "Angel Jibreel (Gabriel) brought the revelation from Allah."
  },
  {
    id: "seerah_11",
    category: "Revelation",
    question: "What were the first words revealed to the Prophet ﷺ?",
    options: ["Bismillah", "Iqra (Read)", "Qul", "Alhamdulillah"],
    correct: 1,
    explanation: "The first word was 'Iqra' (Read/Recite) from Surah Al-Alaq."
  },
  {
    id: "seerah_12",
    category: "Revelation",
    question: "Who was the first adult woman to accept Islam?",
    options: ["Aisha", "Fatimah", "Khadijah", "Hafsa"],
    correct: 2,
    explanation: "Khadijah (RA), the Prophet's wife, was the first woman to accept Islam."
  },
  {
    id: "seerah_13",
    category: "Revelation",
    question: "Who was the first adult man to accept Islam?",
    options: ["Umar", "Uthman", "Ali", "Abu Bakr"],
    correct: 3,
    explanation: "Abu Bakr (RA) was the first adult man to accept Islam."
  },
  {
    id: "seerah_14",
    category: "Revelation",
    question: "Who was the first child to accept Islam?",
    options: ["Hassan", "Hussain", "Ali", "Zaid"],
    correct: 2,
    explanation: "Ali ibn Abi Talib (RA) was the first child to accept Islam."
  },
  
  // Persecution in Makkah
  {
    id: "seerah_15",
    category: "Makkah Period",
    question: "How long did the Prophet ﷺ call people to Islam secretly?",
    options: ["1 year", "3 years", "5 years", "7 years"],
    correct: 1,
    explanation: "For the first 3 years, the Prophet ﷺ called people to Islam in secret."
  },
  {
    id: "seerah_16",
    category: "Makkah Period",
    question: "Who was the Prophet's uncle that opposed Islam?",
    options: ["Abu Talib", "Abbas", "Abu Lahab", "Hamza"],
    correct: 2,
    explanation: "Abu Lahab was the Prophet's uncle who fiercely opposed Islam. There's even a Surah about him."
  },
  {
    id: "seerah_17",
    category: "Makkah Period",
    question: "Which companion was tortured by being laid on hot sand?",
    options: ["Abu Bakr", "Bilal", "Uthman", "Talha"],
    correct: 1,
    explanation: "Bilal (RA) was tortured severely, including being laid on hot sand with a rock on his chest."
  },
  {
    id: "seerah_18",
    category: "Makkah Period",
    question: "To which country did Muslims migrate to escape persecution?",
    options: ["Yemen", "Abyssinia (Ethiopia)", "Syria", "Iraq"],
    correct: 1,
    explanation: "Muslims migrated to Abyssinia (Ethiopia) where the Christian king protected them."
  },
  {
    id: "seerah_19",
    category: "Makkah Period",
    question: "How many years did the boycott of Banu Hashim last?",
    options: ["1 year", "2 years", "3 years", "5 years"],
    correct: 2,
    explanation: "The Quraysh boycotted Banu Hashim for 3 years, during which Muslims faced severe hardship."
  },
  {
    id: "seerah_20",
    category: "Makkah Period",
    question: "What is the 'Year of Sorrow' in the Prophet's ﷺ life?",
    options: ["Year he left Makkah", "Year Khadijah and Abu Talib died", "Year of the boycott", "Year of Battle of Uhud"],
    correct: 1,
    explanation: "The Year of Sorrow was when both his wife Khadijah and uncle Abu Talib passed away in the same year."
  },
  
  // Isra and Mi'raj
  {
    id: "seerah_21",
    category: "Miracles",
    question: "What was the night journey of the Prophet ﷺ called?",
    options: ["Hijrah", "Isra and Mi'raj", "Umrah", "Hajj"],
    correct: 1,
    explanation: "Isra and Mi'raj was the miraculous night journey to Jerusalem and ascension to the heavens."
  },
  {
    id: "seerah_22",
    category: "Miracles",
    question: "From which masjid did the Isra begin?",
    options: ["Masjid Nabawi", "Masjid al-Haram", "Masjid al-Aqsa", "Masjid Quba"],
    correct: 1,
    explanation: "The journey began from Masjid al-Haram in Makkah."
  },
  {
    id: "seerah_23",
    category: "Miracles",
    question: "What was the name of the animal the Prophet ﷺ rode during Isra?",
    options: ["Horse", "Camel", "Buraq", "Donkey"],
    correct: 2,
    explanation: "The Prophet ﷺ rode on Buraq, a special creature faster than lightning."
  },
  {
    id: "seerah_24",
    category: "Miracles",
    question: "During Mi'raj, what was made obligatory for Muslims?",
    options: ["Fasting", "Zakat", "Five daily prayers", "Hajj"],
    correct: 2,
    explanation: "The five daily prayers were made obligatory during the Mi'raj."
  },
  {
    id: "seerah_25",
    category: "Miracles",
    question: "Originally, how many prayers were obligatory before being reduced to five?",
    options: ["10", "25", "50", "100"],
    correct: 2,
    explanation: "Originally 50 prayers were prescribed, but were reduced to 5 with the reward of 50."
  },
  
  // Hijrah (Migration)
  {
    id: "seerah_26",
    category: "Hijrah",
    question: "What is the journey from Makkah to Madinah called?",
    options: ["Hijrah", "Umrah", "Hajj", "Isra"],
    correct: 0,
    explanation: "The Hijrah (migration) from Makkah to Madinah marks the beginning of the Islamic calendar."
  },
  {
    id: "seerah_27",
    category: "Hijrah",
    question: "Who accompanied the Prophet ﷺ during the Hijrah?",
    options: ["Umar", "Ali", "Abu Bakr", "Uthman"],
    correct: 2,
    explanation: "Abu Bakr (RA) accompanied the Prophet ﷺ during the migration to Madinah."
  },
  {
    id: "seerah_28",
    category: "Hijrah",
    question: "In which cave did the Prophet ﷺ and Abu Bakr hide during Hijrah?",
    options: ["Cave of Hira", "Cave of Thawr", "Cave of Uhud", "Cave of Badr"],
    correct: 1,
    explanation: "They hid in the Cave of Thawr for three days."
  },
  {
    id: "seerah_29",
    category: "Hijrah",
    question: "What miracle happened at the cave to protect them?",
    options: ["Rain fell", "A spider made a web and a bird made a nest", "An earthquake", "Thunder and lightning"],
    correct: 1,
    explanation: "A spider spun a web and a bird laid eggs at the entrance, making it look undisturbed."
  },
  {
    id: "seerah_30",
    category: "Hijrah",
    question: "Who slept in the Prophet's ﷺ bed the night of Hijrah?",
    options: ["Abu Bakr", "Ali", "Uthman", "Umar"],
    correct: 1,
    explanation: "Ali (RA) slept in the Prophet's bed to trick the assassins waiting outside."
  },
  
  // Madinah Period
  {
    id: "seerah_31",
    category: "Madinah",
    question: "What was the first thing the Prophet ﷺ built in Madinah?",
    options: ["A house", "A marketplace", "A masjid (Masjid Nabawi)", "A school"],
    correct: 2,
    explanation: "The Prophet ﷺ first built Masjid an-Nabawi (the Prophet's Mosque)."
  },
  {
    id: "seerah_32",
    category: "Madinah",
    question: "What did the Prophet ﷺ establish to unite Muhajirin and Ansar?",
    options: ["A treaty", "Brotherhood bonds", "A council", "An army"],
    correct: 1,
    explanation: "He established brotherhood (mu'akhah) between the Muhajirin (migrants) and Ansar (helpers)."
  },
  {
    id: "seerah_33",
    category: "Madinah",
    question: "What document did the Prophet ﷺ create for peace between Muslims, Jews, and others?",
    options: ["Quran", "Constitution of Madinah", "Treaty of Hudaybiyyah", "Covenant"],
    correct: 1,
    explanation: "The Constitution of Madinah established rights and duties for all communities."
  },
  
  // Battles
  {
    id: "seerah_34",
    category: "Battles",
    question: "What was the first battle in Islamic history?",
    options: ["Battle of Uhud", "Battle of Badr", "Battle of Khandaq", "Battle of Hunayn"],
    correct: 1,
    explanation: "The Battle of Badr (624 CE) was the first major battle."
  },
  {
    id: "seerah_35",
    category: "Battles",
    question: "How many Muslims fought in the Battle of Badr?",
    options: ["100", "313", "500", "1000"],
    correct: 1,
    explanation: "Only 313 Muslims fought against 1000 Quraysh soldiers."
  },
  {
    id: "seerah_36",
    category: "Battles",
    question: "In which battle did the Prophet ﷺ get injured?",
    options: ["Battle of Badr", "Battle of Uhud", "Battle of Khandaq", "Battle of Khaybar"],
    correct: 1,
    explanation: "The Prophet ﷺ was injured in the Battle of Uhud when archers left their posts."
  },
  {
    id: "seerah_37",
    category: "Battles",
    question: "What was the Battle of the Trench also called?",
    options: ["Battle of Uhud", "Battle of Khandaq", "Battle of Badr", "Battle of Hunayn"],
    correct: 1,
    explanation: "The Battle of the Trench is also called Battle of Khandaq or Battle of Ahzab."
  },
  {
    id: "seerah_38",
    category: "Battles",
    question: "Who suggested digging a trench around Madinah?",
    options: ["Abu Bakr", "Umar", "Salman al-Farsi", "Ali"],
    correct: 2,
    explanation: "Salman al-Farsi (RA) suggested the Persian military tactic of digging a trench."
  },
  {
    id: "seerah_39",
    category: "Battles",
    question: "Which companion was called 'The Sword of Allah'?",
    options: ["Abu Bakr", "Umar", "Khalid ibn Walid", "Ali"],
    correct: 2,
    explanation: "Khalid ibn Walid (RA) was given the title 'Sayfu-llah' (Sword of Allah)."
  },
  {
    id: "seerah_40",
    category: "Battles",
    question: "Who killed Musaylimah the false prophet?",
    options: ["Khalid ibn Walid", "Wahshi", "Abu Bakr", "Umar"],
    correct: 1,
    explanation: "Wahshi, the same man who killed Hamza, killed Musaylimah in the Battle of Yamama."
  },
  
  // Treaty of Hudaybiyyah
  {
    id: "seerah_41",
    category: "Treaties",
    question: "In which year was the Treaty of Hudaybiyyah signed?",
    options: ["5 AH", "6 AH", "7 AH", "8 AH"],
    correct: 1,
    explanation: "The Treaty of Hudaybiyyah was signed in 6 AH (628 CE)."
  },
  {
    id: "seerah_42",
    category: "Treaties",
    question: "How many years of peace did the Treaty of Hudaybiyyah establish?",
    options: ["5 years", "10 years", "15 years", "20 years"],
    correct: 1,
    explanation: "The treaty established 10 years of peace between Muslims and Quraysh."
  },
  {
    id: "seerah_43",
    category: "Treaties",
    question: "What did Allah call the Treaty of Hudaybiyyah?",
    options: ["A defeat", "A clear victory (Fath Mubeen)", "A test", "A challenge"],
    correct: 1,
    explanation: "Allah called it 'Fath Mubeen' (a clear victory) in Surah Al-Fath."
  },
  
  // Conquest of Makkah
  {
    id: "seerah_44",
    category: "Conquest",
    question: "In which year did the conquest of Makkah happen?",
    options: ["6 AH", "8 AH", "9 AH", "10 AH"],
    correct: 1,
    explanation: "The Prophet ﷺ peacefully conquered Makkah in 8 AH (630 CE)."
  },
  {
    id: "seerah_45",
    category: "Conquest",
    question: "How did the Prophet ﷺ enter Makkah?",
    options: ["Fighting", "Peacefully with head bowed in humility", "On horseback proudly", "In secret"],
    correct: 1,
    explanation: "He entered peacefully with his head bowed in humility to Allah."
  },
  {
    id: "seerah_46",
    category: "Conquest",
    question: "What did the Prophet ﷺ do when he entered Makkah victorious?",
    options: ["Punished his enemies", "Forgave everyone", "Left immediately", "Built a palace"],
    correct: 1,
    explanation: "He forgave all his former enemies, showing the mercy of Islam."
  },
  {
    id: "seerah_47",
    category: "Conquest",
    question: "How many people did the Prophet ﷺ have executed after conquering Makkah?",
    options: ["None", "Only a few who committed war crimes", "Hundreds", "Thousands"],
    correct: 1,
    explanation: "He pardoned almost everyone, executing only a few who had committed serious crimes."
  },
  {
    id: "seerah_48",
    category: "Conquest",
    question: "What did the Prophet ﷺ do with the idols in the Kaaba?",
    options: ["Left them", "Destroyed them", "Hid them", "Sold them"],
    correct: 1,
    explanation: "He destroyed all 360 idols, reciting 'Truth has come and falsehood has vanished.'"
  },
  
  // Farewell Pilgrimage
  {
    id: "seerah_49",
    category: "Farewell",
    question: "What was the Prophet's ﷺ last sermon called?",
    options: ["First Sermon", "Farewell Sermon", "Final Message", "Last Speech"],
    correct: 1,
    explanation: "The Farewell Sermon (Khutbah al-Wada) was delivered during the Prophet's last Hajj."
  },
  {
    id: "seerah_50",
    category: "Farewell",
    question: "Where was the Farewell Sermon delivered?",
    options: ["Mount Hira", "Mount Arafat", "Mount Uhud", "Mount Safa"],
    correct: 1,
    explanation: "It was delivered on the plains of Mount Arafat during Hajj."
  },
  {
    id: "seerah_51",
    category: "Farewell",
    question: "How many people attended the Farewell Pilgrimage?",
    options: ["1,000", "10,000", "100,000", "1,000,000"],
    correct: 2,
    explanation: "Over 100,000 Muslims attended the Prophet's Farewell Pilgrimage."
  },
  {
    id: "seerah_52",
    category: "Farewell",
    question: "Which verse was revealed during the Farewell Sermon, marking completion of Islam?",
    options: ["First verse of Quran", "'Today I have perfected your religion'", "Last verse of Quran", "Verse about prayer"],
    correct: 1,
    explanation: "'Today I have perfected your religion for you' (Quran 5:3) was revealed."
  },
  {
    id: "seerah_53",
    category: "Farewell",
    question: "In which year did the Prophet ﷺ pass away?",
    options: ["9 AH", "10 AH", "11 AH", "12 AH"],
    correct: 2,
    explanation: "The Prophet ﷺ passed away in 11 AH (632 CE)."
  },
  {
    id: "seerah_54",
    category: "Farewell",
    question: "How old was the Prophet ﷺ when he passed away?",
    options: ["60 years", "61 years", "63 years", "65 years"],
    correct: 2,
    explanation: "Prophet Muhammad ﷺ was 63 years old when he passed away."
  },
  {
    id: "seerah_55",
    category: "Farewell",
    question: "In whose lap did the Prophet ﷺ pass away?",
    options: ["Khadijah", "Aisha", "Fatimah", "Hafsa"],
    correct: 1,
    explanation: "The Prophet ﷺ passed away with his head in Aisha's lap."
  },
  
  // Character and Teachings
  {
    id: "seerah_56",
    category: "Character",
    question: "What did Aisha (RA) say when asked about the Prophet's ﷺ character?",
    options: ["He was kind", "He was wise", "His character was the Quran", "He was perfect"],
    correct: 2,
    explanation: "Aisha (RA) said 'His character was the Quran' - he embodied Quranic teachings."
  },
  {
    id: "seerah_57",
    category: "Character",
    question: "How did the Prophet ﷺ treat children?",
    options: ["Ignored them", "Was strict with them", "Played with them and showed kindness", "Only taught them"],
    correct: 2,
    explanation: "He would play with children, carry them, and shorten prayers if he heard a baby crying."
  },
  {
    id: "seerah_58",
    category: "Character",
    question: "What was the Prophet's ﷺ attitude toward enemies?",
    options: ["Revenge", "Hatred", "Forgiveness and mercy", "Avoidance"],
    correct: 2,
    explanation: "He showed forgiveness and mercy, even to those who hurt him."
  },
  {
    id: "seerah_59",
    category: "Character",
    question: "How did the Prophet ﷺ help with household chores?",
    options: ["Never helped", "Only commanded others", "He helped with cooking, cleaning, and mending clothes", "Considered it beneath him"],
    correct: 2,
    explanation: "He helped with all household tasks, mended his own clothes, and milked goats."
  },
  {
    id: "seerah_60",
    category: "Character",
    question: "What did the Prophet ﷺ say about smiling?",
    options: ["It's weakness", "It's forbidden", "Smiling at your brother is charity", "Only smile sometimes"],
    correct: 2,
    explanation: "The Prophet ﷺ said: 'Your smile for your brother is a charity.'"
  }
];

export default function SeerahGame({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState([]);

  useEffect(() => {
    const initGame = async () => {
      await loadUser();
      shuffleQuestions();
    };
    initGame();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    } catch (error) {
      console.log("User not authenticated", error);
    }
  };

  const shuffleQuestions = async () => {
    let previouslyUsed = [];
    if (user && user.id) {
      try {
        const progress = await base44.entities.UserGameProgress.filter({
          user_id: user.id,
          game_type: "seerah"
        });
        if (progress.length > 0) {
          previouslyUsed = progress[0].completed_questions || [];
        }
      } catch (error) {
        console.log("No previous progress found or error loading progress:", error);
      }
    }

    let unusedQuestions = seerahQuestions.filter(q => !previouslyUsed.includes(q.id));

    // If not enough unused questions for a full game (15 questions), reset completed questions for the user
    if (unusedQuestions.length < 15) {
      console.log("Not enough unused questions for a full game. Resetting completed questions for this user.");
      unusedQuestions = [...seerahQuestions]; // Reset to all questions

      if (user && user.id) {
        try {
          const existingProgress = await base44.entities.UserGameProgress.filter({
            user_id: user.id,
            game_type: "seerah"
          });
          if (existingProgress.length > 0) {
            await base44.entities.UserGameProgress.update(existingProgress[0].id, {
              completed_questions: [] // Clear for a fresh start
            });
          }
        } catch (error) {
          console.error("Error clearing UserGameProgress completed_questions:", error);
        }
      }
    }

    const shuffled = [...unusedQuestions].sort(() => Math.random() - 0.5).slice(0, 15); // Now 15 questions per game
    setQuestions(shuffled);
    setUsedQuestionIds(shuffled.map(q => q.id)); // Store IDs for saving upon completion
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 10);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameOver(true);
      
      if (user) {
        try {
          // Always award 10 points regardless of score
          const finalScore = 10;
          
          await base44.entities.GameScore.create({
            user_id: user.id,
            game_type: "seerah_quiz",
            score: finalScore,
            completed: true
          });
          
          // Cap total points at 1500
          const newTotalPoints = Math.min((user.points || 0) + finalScore, 1500);
          
          await base44.auth.updateMe({
            points: newTotalPoints
          });
        } catch (error) {
          console.error("Error saving score:", error);
        }
      }
    }
  };

  const resetGame = () => {
    shuffleQuestions();
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setGameOver(false);
  };

  if (questions.length === 0) {
    return <div className="text-center py-12">Loading questions...</div>;
  }

  if (gameOver) {
    const correctAnswers = score / 10;
    const percentage = (correctAnswers / questions.length) * 100;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Card className="max-w-md mx-auto border-2 border-purple-400 shadow-2xl">
          <CardContent className="pt-12 pb-8">
            <Trophy className="w-24 h-24 mx-auto mb-6 text-purple-500" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {percentage >= 80 ? "Masha'Allah! Excellent! 🎉" : percentage >= 60 ? "Well Done! 👍" : "Keep Learning! 📚"}
            </h2>
            <p className="text-xl text-gray-600 mb-4">You Earned</p>
            <p className="text-5xl font-bold text-purple-600 mb-6">10 points</p>
            <p className="text-gray-600 mb-2">You got {correctAnswers} out of {questions.length} correct!</p>
            <p className="text-2xl font-bold text-purple-600 mb-6">{Math.round(percentage)}%</p>
            
            <div className="bg-purple-100 rounded-lg p-3 mb-6 border-2 border-purple-400">
              <p className="text-sm font-bold text-purple-900">
                ✨ Fair Points: Every game awards 10 points!
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
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

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex justify-between items-center mb-4">
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Seerah Quiz
          </CardTitle>
          <Badge className="bg-white/30 backdrop-blur-sm text-white text-lg px-4 py-2">
            Score: {score}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 bg-white/30" />
        <p className="text-sm text-blue-100 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </CardHeader>

      <CardContent className="p-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  selectedAnswer === null
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    : index === question.correct
                    ? "bg-green-500 text-white"
                    : selectedAnswer === index
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer !== null && (
                    index === question.correct ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : selectedAnswer === index ? (
                      <XCircle className="w-6 h-6" />
                    ) : null
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200"
              >
                <p className="text-sm font-semibold text-blue-900 mb-2">📚 Did you know?</p>
                <p className="text-sm text-blue-800">{question.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedAnswer !== null && (
            <Button
              onClick={handleNext}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}

SeerahGame.propTypes = {
  onComplete: PropTypes.func
};
