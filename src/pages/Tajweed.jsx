import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Volume2, CheckCircle2, XCircle, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedAudioPlayer from "../components/EnhancedAudioPlayer";

const tajweedRules = [
  {
    id: "noon_sakinah_idgham",
    category: "Noon Sakinah & Tanween",
    title: "Idgham (Merging)",
    kidExplanation: "Idgham means merging or blending. When noon sakinah (نْ) or tanween (ـً ـٍ ـٌ) comes before these 6 letters: ي ن م و ل ر - you merge them together smoothly!",
    arabicExample: "مِّن رَّبِّهِمْ",
    exampleTranslation: "from their Lord",
    surahReference: "Al-Baqarah 2:5",
    ruleHighlight: "The noon in 'min' merges with the 'raa' in 'rabbihim'",
    whyThisShowsRule: "Notice how the noon sound blends smoothly into the 'r' sound without a pause.",
    quiz: [
      {
        question: "Which letters cause Idgham?",
        options: ["ي ن م و ل ر", "ق ك", "ب", "ص ض ط ظ"],
        correct: 0
      },
      {
        question: "What does Idgham mean?",
        options: ["Hiding", "Merging/Blending", "Showing clearly", "Changing"],
        correct: 1
      },
      {
        question: "In 'مِّن رَّبِّهِمْ', which rule applies?",
        options: ["Ikhfa", "Idgham", "Iqlab", "Izhar"],
        correct: 1
      }
    ]
  },
  {
    id: "noon_sakinah_ikhfa",
    category: "Noon Sakinah & Tanween",
    title: "Ikhfa (Hiding)",
    kidExplanation: "Ikhfa means hiding. When noon sakinah or tanween comes before 15 specific letters, you hide the noon sound a little bit - it's between showing and merging!",
    arabicExample: "مَن يَعْمَلْ",
    exampleTranslation: "whoever does",
    surahReference: "Az-Zalzalah 99:7",
    ruleHighlight: "The noon in 'man' is hidden before the 'ya' in 'ya'mal'",
    whyThisShowsRule: "The noon sound is softened and hidden with a slight nasal sound (ghunnah).",
    quiz: [
      {
        question: "How many letters cause Ikhfa?",
        options: ["4", "6", "15", "28"],
        correct: 2
      },
      {
        question: "What does Ikhfa mean?",
        options: ["Merging", "Hiding", "Showing", "Changing"],
        correct: 1
      },
      {
        question: "Is there ghunnah (nasal sound) in Ikhfa?",
        options: ["Yes", "No", "Sometimes", "Never"],
        correct: 0
      }
    ]
  },
  {
    id: "noon_sakinah_iqlab",
    category: "Noon Sakinah & Tanween",
    title: "Iqlab (Changing)",
    kidExplanation: "Iqlab means changing. When noon sakinah or tanween comes before the letter 'ب' (baa), you change the noon sound to 'م' (meem) sound!",
    arabicExample: "مِنۢ بَعْدِ",
    exampleTranslation: "after",
    surahReference: "Al-Baqarah 2:27",
    ruleHighlight: "The noon in 'min' changes to a meem sound before 'ba'd'",
    whyThisShowsRule: "The noon completely transforms into a meem sound when followed by baa.",
    quiz: [
      {
        question: "Which letter causes Iqlab?",
        options: ["ب only", "م only", "ن only", "ب and م"],
        correct: 0
      },
      {
        question: "What sound does noon change to?",
        options: ["Baa", "Meem", "Noon", "Laam"],
        correct: 1
      },
      {
        question: "Is there ghunnah in Iqlab?",
        options: ["Yes", "No"],
        correct: 0
      }
    ]
  },
  {
    id: "noon_sakinah_izhar",
    category: "Noon Sakinah & Tanween",
    title: "Izhar (Clear Pronunciation)",
    kidExplanation: "Izhar means to show clearly. When noon sakinah or tanween comes before the 6 throat letters (ء ه ع ح غ خ), you pronounce the noon very clearly!",
    arabicExample: "مَنْ ءَامَنَ",
    exampleTranslation: "whoever believes",
    surahReference: "Al-Baqarah 2:62",
    ruleHighlight: "The noon in 'man' is pronounced clearly before the hamza (ء) in 'aamana'",
    whyThisShowsRule: "The noon sound is fully pronounced without any hiding or merging.",
    quiz: [
      {
        question: "How many throat letters cause Izhar?",
        options: ["4", "5", "6", "7"],
        correct: 2
      },
      {
        question: "What does Izhar mean?",
        options: ["Hiding", "Merging", "Showing clearly", "Changing"],
        correct: 2
      },
      {
        question: "Is there ghunnah in Izhar?",
        options: ["Yes", "No"],
        correct: 1
      }
    ]
  },
  {
    id: "meem_sakinah_idgham_shafawi",
    category: "Meem Sakinah",
    title: "Idgham Shafawi (Lip Merging)",
    kidExplanation: "When meem sakinah (مْ) comes before another meem (م), you merge them together! It's called 'shafawi' because you use your lips to pronounce it.",
    arabicExample: "لَهُم مَّا",
    exampleTranslation: "for them is what",
    surahReference: "Al-Baqarah 2:25",
    ruleHighlight: "The meem in 'lahum' merges with the meem in 'ma'",
    whyThisShowsRule: "Two meems come together and are pronounced as one long meem with ghunnah.",
    quiz: [
      {
        question: "When does Idgham Shafawi happen?",
        options: ["Meem before meem", "Meem before baa", "Meem before noon", "Meem before any letter"],
        correct: 0
      },
      {
        question: "Is there ghunnah in Idgham Shafawi?",
        options: ["Yes", "No"],
        correct: 0
      },
      {
        question: "Why is it called 'shafawi'?",
        options: ["It's hidden", "Uses the lips", "Uses the throat", "It's merged"],
        correct: 1
      }
    ]
  },
  {
    id: "meem_sakinah_ikhfa_shafawi",
    category: "Meem Sakinah",
    title: "Ikhfa Shafawi (Lip Hiding)",
    kidExplanation: "When meem sakinah (مْ) comes before 'ب' (baa), you hide the meem sound slightly! Close your lips and make a soft nasal sound.",
    arabicExample: "تَرْمِيهِم بِحِجَارَةٍ",
    exampleTranslation: "striking them with stones",
    surahReference: "Al-Feel 105:4",
    ruleHighlight: "The meem in 'tarmeehim' is hidden before the baa in 'bihijarah'",
    whyThisShowsRule: "The meem is softened and pronounced with the lips closed, creating a nasal sound.",
    quiz: [
      {
        question: "Which letter causes Ikhfa Shafawi?",
        options: ["م", "ب", "ن", "All letters"],
        correct: 1
      },
      {
        question: "How do you pronounce Ikhfa Shafawi?",
        options: ["Clearly", "Hidden with ghunnah", "Merged", "Changed"],
        correct: 1
      },
      {
        question: "What does 'shafawi' mean?",
        options: ["Throat", "Lip", "Tongue", "Nose"],
        correct: 1
      }
    ]
  },
  {
    id: "qalqalah",
    category: "Qalqalah",
    title: "Qalqalah (Echoing Sound)",
    kidExplanation: "Qalqalah means a bouncing or echoing sound! When these 5 letters have sukoon (ْ), they bounce: ق ط ب ج د. Remember: 'Qutb Jad'!",
    arabicExample: "أَحَدٌ",
    exampleTranslation: "One (Allah is One)",
    surahReference: "Al-Ikhlas 112:1",
    ruleHighlight: "The 'dal' (د) at the end has qalqalah",
    whyThisShowsRule: "The letter 'd' bounces when you stop on it, creating an echoing sound.",
    quiz: [
      {
        question: "Which letters have qalqalah?",
        options: ["ق ط ب ج د", "ا ب ت ث", "ص ض ط ظ", "ك ل م ن"],
        correct: 0
      },
      {
        question: "What does qalqalah mean?",
        options: ["Merging", "Bouncing/Echoing", "Hiding", "Stretching"],
        correct: 1
      },
      {
        question: "How do you remember qalqalah letters?",
        options: ["Qutb Jad", "Noon Wa Laam", "Meem Baa", "Raa Laam"],
        correct: 0
      }
    ]
  },
  {
    id: "madd_tabee'ee",
    category: "Madd (Elongation)",
    title: "Madd Tabee'ee (Natural Elongation)",
    kidExplanation: "Madd means to stretch or lengthen. Natural madd happens when you see alif (ا), waw (و), or ya (ي) - you stretch the sound for 2 counts!",
    arabicExample: "قَالَ",
    exampleTranslation: "he said",
    surahReference: "Al-Baqarah 2:30",
    ruleHighlight: "The alif after 'qaf' creates natural madd",
    whyThisShowsRule: "The alif stretches the 'a' sound for 2 counts: qaaala.",
    quiz: [
      {
        question: "Which letters create madd?",
        options: ["ا و ي", "ب ت ث", "ق ك", "م ن"],
        correct: 0
      },
      {
        question: "How long is natural madd?",
        options: ["1 count", "2 counts", "4 counts", "6 counts"],
        correct: 1
      },
      {
        question: "What does madd mean?",
        options: ["Hiding", "Bouncing", "Stretching/Lengthening", "Merging"],
        correct: 2
      }
    ]
  },
  {
    id: "laam_shamsiyyah",
    category: "Laam Rules",
    title: "Laam Shamsiyyah (Sun Letters)",
    kidExplanation: "When 'ال' (al) comes before 14 'sun letters', the laam is hidden and the next letter is doubled! Like: الشَّمْس (ash-shams) not (al-shams).",
    arabicExample: "الرَّحْمَـٰنِ",
    exampleTranslation: "The Most Merciful",
    surahReference: "Al-Fatihah 1:3",
    ruleHighlight: "The laam in 'ال' is hidden before 'ر', making it 'ar-Rahman' not 'al-Rahman'",
    whyThisShowsRule: "The 'r' is a sun letter, so the laam is assimilated into it.",
    quiz: [
      {
        question: "How many sun letters are there?",
        options: ["12", "13", "14", "15"],
        correct: 2
      },
      {
        question: "What happens to the laam before sun letters?",
        options: ["It's pronounced clearly", "It's hidden", "It's changed", "It's bounced"],
        correct: 1
      },
      {
        question: "Is 'ر' a sun letter?",
        options: ["Yes", "No"],
        correct: 0
      }
    ]
  },
  {
    id: "laam_qamariyyah",
    category: "Laam Rules",
    title: "Laam Qamariyyah (Moon Letters)",
    kidExplanation: "When 'ال' (al) comes before 14 'moon letters', you pronounce the laam clearly! Like: الْقَمَر (al-qamar).",
    arabicExample: "الْعَالَمِينَ",
    exampleTranslation: "the worlds",
    surahReference: "Al-Fatihah 1:2",
    ruleHighlight: "The laam in 'ال' is pronounced clearly before 'ع', making it 'al-'aalameen'",
    whyThisShowsRule: "The 'ayn' is a moon letter, so the laam is pronounced fully.",
    quiz: [
      {
        question: "How many moon letters are there?",
        options: ["12", "13", "14", "15"],
        correct: 2
      },
      {
        question: "What happens to the laam before moon letters?",
        options: ["It's hidden", "It's pronounced clearly", "It's merged", "It's changed"],
        correct: 1
      },
      {
        question: "Is 'ع' a moon letter?",
        options: ["Yes", "No"],
        correct: 0
      }
    ]
  },
  {
    id: "raa_tafkheem",
    category: "Raa Rules",
    title: "Raa Tafkheem (Heavy R)",
    kidExplanation: "Sometimes the letter 'ر' (raa) is pronounced heavy (with a full mouth). This happens when raa has fatha (َ), damma (ُ), or comes after these vowels!",
    arabicExample: "رَبِّ",
    exampleTranslation: "Lord",
    surahReference: "Al-Fatihah 1:2",
    ruleHighlight: "The raa has fatha, so it's pronounced heavy: 'Rabb'",
    whyThisShowsRule: "The fatha makes the raa sound thick and full.",
    quiz: [
      {
        question: "When is raa heavy?",
        options: ["With kasra always", "With fatha or damma", "Never", "With sukoon always"],
        correct: 1
      },
      {
        question: "What does tafkheem mean?",
        options: ["Light", "Heavy/Thick", "Hidden", "Merged"],
        correct: 1
      },
      {
        question: "In 'رَبِّ', is the raa heavy or light?",
        options: ["Heavy", "Light"],
        correct: 0
      }
    ]
  },
  {
    id: "raa_tarqeeq",
    category: "Raa Rules",
    title: "Raa Tarqeeq (Light R)",
    kidExplanation: "Sometimes the letter 'ر' (raa) is pronounced light (with an empty mouth). This happens when raa has kasra (ِ) or comes after kasra!",
    arabicExample: "رِزْقًا",
    exampleTranslation: "provision",
    surahReference: "Al-Baqarah 2:22",
    ruleHighlight: "The raa has kasra, so it's pronounced light: 'rizqan'",
    whyThisShowsRule: "The kasra makes the raa sound thin and light.",
    quiz: [
      {
        question: "When is raa light?",
        options: ["With fatha", "With kasra", "Never", "Always"],
        correct: 1
      },
      {
        question: "What does tarqeeq mean?",
        options: ["Heavy", "Light/Thin", "Hidden", "Bouncing"],
        correct: 1
      },
      {
        question: "In 'رِزْقًا', is the raa heavy or light?",
        options: ["Heavy", "Light"],
        correct: 1
      }
    ]
  }
];

export default function Tajweed() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRule, setSelectedRule] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const [showTransliteration, setShowTransliteration] = useState(false);

  const categories = ["All", "Noon Sakinah & Tanween", "Meem Sakinah", "Qalqalah", "Madd (Elongation)", "Laam Rules", "Raa Rules"];

  const filteredRules = selectedCategory === "All" 
    ? tajweedRules 
    : tajweedRules.filter(rule => rule.category === selectedCategory);

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionIndex]: answerIndex
    });
  };

  const calculateQuizScore = () => {
    if (!selectedRule?.quiz) return 0;
    let correct = 0;
    selectedRule.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) correct++;
    });
    return correct;
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  return (
    <div className="min-h-screen py-8 md:py-12 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Learn Tajweed
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Learn to recite the Quran beautifully with proper pronunciation rules
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedRule(null);
              }}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              className={selectedCategory === cat ? "bg-teal-600" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Rule Detail View */}
        {selectedRule ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedRule(null);
                resetQuiz();
                setHighlightedWord(-1);
              }}
              className="mb-4"
            >
              ← Back to Rules
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-xl md:text-2xl">{selectedRule.title}</CardTitle>
                      <Badge className="bg-white/20 text-white">
                        {selectedRule.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 md:p-6">
                    {/* Kid-Friendly Explanation */}
                    <div className="bg-blue-50 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        💡 What is {selectedRule.title}?
                      </h4>
                      <p className="text-gray-800 leading-relaxed text-base">
                        {selectedRule.kidExplanation}
                      </p>
                    </div>

                    {/* Quranic Example */}
                    <div className="bg-amber-50 rounded-lg p-6 mb-6 border-r-4 border-amber-500">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-amber-900">📿 Quran Example:</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTransliteration(!showTransliteration)}
                        >
                          {showTransliteration ? "Hide" : "Show"} Transliteration
                        </Button>
                      </div>
                      
                      <div className="text-3xl md:text-4xl text-right mb-3 leading-relaxed" dir="rtl">
                        {selectedRule.arabicExample}
                      </div>
                      
                      <p className="text-gray-700 mb-2 italic">
                        {selectedRule.exampleTranslation}
                      </p>
                      
                      <Badge variant="outline" className="mb-4">
                        {selectedRule.surahReference}
                      </Badge>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Why this shows the rule:</strong> {selectedRule.whyThisShowsRule}
                        </p>
                      </div>

                      <div className="bg-teal-50 rounded-lg p-4">
                        <p className="text-sm text-teal-900">
                          <strong>🎯 Focus:</strong> {selectedRule.ruleHighlight}
                        </p>
                      </div>
                    </div>

                    {/* Audio Player Section */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        🎧 Listen & Practice
                      </h4>
                      <div className="bg-purple-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-purple-900">
                          Note: Audio recitation coming soon. For now, practice with your teacher or use online Quran recitation resources!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quiz Sidebar - 1 column */}
              <div className="space-y-6">
                <Card className="shadow-xl sticky top-24">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Test Your Knowledge
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    {!showQuizResults ? (
                      <div className="space-y-4">
                        {selectedRule.quiz.map((question, qIndex) => (
                          <div key={qIndex} className="bg-gray-50 rounded-lg p-4">
                            <p className="font-semibold mb-3 text-sm">
                              {qIndex + 1}. {question.question}
                            </p>
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <Button
                                  key={oIndex}
                                  onClick={() => handleQuizAnswer(qIndex, oIndex)}
                                  variant={quizAnswers[qIndex] === oIndex ? "default" : "outline"}
                                  className="w-full justify-start text-left h-auto py-2 text-xs"
                                  size="sm"
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          onClick={() => setShowQuizResults(true)}
                          disabled={Object.keys(quizAnswers).length !== selectedRule.quiz.length}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Check Answers
                        </Button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <div className="text-center mb-4">
                          <div className="text-5xl mb-3">
                            {calculateQuizScore() === selectedRule.quiz.length ? "🎉" : "💪"}
                          </div>
                          <h3 className="text-xl font-bold mb-2">
                            Score: {calculateQuizScore()} / {selectedRule.quiz.length}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {calculateQuizScore() === selectedRule.quiz.length
                              ? "Masha'Allah! Perfect score!"
                              : "Good try! Review and try again."}
                          </p>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {selectedRule.quiz.map((question, qIndex) => {
                            const isCorrect = quizAnswers[qIndex] === question.correct;
                            return (
                              <div key={qIndex} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                                <div className="flex items-start gap-2">
                                  {isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className="text-xs">
                                    <p className="font-semibold mb-1">{question.question}</p>
                                    <p className="text-gray-600">
                                      Correct: {question.options[question.correct]}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <Button
                          onClick={resetQuiz}
                          className="w-full"
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Rules Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredRules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => {
                    setSelectedRule(rule);
                    resetQuiz();
                  }}>
                    <CardHeader className="pb-3">
                      <Badge className="mb-2 w-fit text-xs">{rule.category}</Badge>
                      <CardTitle className="text-lg md:text-xl group-hover:text-teal-600 transition-colors leading-tight">
                        {rule.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="bg-amber-50 rounded-lg p-3 mb-3">
                        <p className="text-2xl md:text-3xl text-right" dir="rtl">
                          {rule.arabicExample}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {rule.kidExplanation}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {rule.quiz.length} Quiz Questions
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Learn →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}