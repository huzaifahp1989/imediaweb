import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Trophy, RotateCcw, ChevronRight, Star, Target, Zap, BookOpen } from 'lucide-react';

// Advanced Arabic Quiz Categories
const quizCategories = [
  {
    id: 'grammar',
    title: 'القواعد النحوية',
    icon: Brain,
    color: 'from-blue-500 to-cyan-500',
    description: 'اختبر معرفتك بالقواعد النحوية العربية',
    difficulty: 'advanced'
  },
  {
    id: 'morphology',
    title: 'الصرف',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    description: 'افهم أنماط الكلمات وجذورها',
    difficulty: 'advanced'
  },
  {
    id: 'vocabulary',
    title: 'المفردات',
    icon: Star,
    color: 'from-amber-500 to-orange-500',
    description: 'وسع مفرداتك اللغوية',
    difficulty: 'intermediate'
  },
  {
    id: 'reading',
    title: 'القراءة',
    icon: BookOpen,
    color: 'from-green-500 to-teal-500',
    description: 'اختبر فهمك للنصوص',
    difficulty: 'advanced'
  }
];

// Challenging Arabic Questions by Category
const challengingQuestions = {
  grammar: [
    {
      id: 1,
      question: 'في جملة "ذهب الولدُ إلى المدرسةِ" ما هو إعراب "الولدُ"؟',
      options: ['فاعل مرفوع', 'مبتدأ مرفوع', 'مفعول به منصوب', 'خبر مرفوع'],
      correct: 0,
      explanation: '"الولدُ" هو فاعل مرفوع وعلامة رفعه الضمة الظاهرة.',
      difficulty: 'intermediate'
    },
    {
      id: 2,
      question: 'ما نوع الجملة في: "إن الطالبَ مجتهدٌ"؟',
      options: ['جملة فعلية', 'جملة اسمية', 'جملة شرطية', 'جملة ناقصة'],
      correct: 1,
      explanation: 'هذه جملة اسمية لأنها تبدأ بالإبتداء "إن" وتتكون من مبتدأ وخبر.',
      difficulty: 'advanced'
    },
    {
      id: 3,
      question: 'ما هو حرف الجر في قوله تعالى: "ومن يتق الله يجعل له مخرجا"؟',
      options: ['من', 'يتق', 'يُجعل', 'له'],
      correct: 0,
      explanation: '"من" هنا حرف جر وما بعده اسم منصوب بالفتحة.',
      difficulty: 'advanced'
    }
  ],
  morphology: [
    {
      id: 1,
      question: 'ما هو وزن الفعل "يُكَرِّمُ"؟',
      options: ['يفعل', 'يفاعل', 'يفعّل', 'يفعيل'],
      correct: 2,
      explanation: 'وزن "يُكَرِّمُ" هو "يفعّل" وهو باب التفعيل.',
      difficulty: 'intermediate'
    },
    {
      id: 2,
      question: 'ما الجذر الثلاثي لكلمة "مُعلِّم"؟',
      options: ['علم', 'عليم', 'عالم', 'تعليم'],
      correct: 0,
      explanation: 'الجذر الثلاثي هو "علم" و"مُعلِّم" مشتق منه.',
      difficulty: 'beginner'
    },
    {
      id: 3,
      question: 'ما نوع الكلمة في: "الكتابة"؟',
      options: ['فعل', 'اسم', 'حرف', 'صفة'],
      correct: 1,
      explanation: '"الكتابة" اسم مجرور وعلامة جره الكسرة.',
      difficulty: 'intermediate'
    }
  ],
  vocabulary: [
    {
      id: 1,
      question: 'ما معنى كلمة "سَفِيه"؟',
      options: ['حكيم', 'جاهل', 'ذكي', 'غبي'],
      correct: 3,
      explanation: '"سَفِيه" تعني الغبي أو قليل العقل.',
      difficulty: 'intermediate'
    },
    {
      id: 2,
      question: 'ما مضاد كلمة "قَريب"؟',
      options: ['بعيد', 'قريب', 'وسط', 'أقرب'],
      correct: 0,
      explanation: 'مضاد "قريب" هو "بعيد".',
      difficulty: 'beginner'
    },
    {
      id: 3,
      question: 'ما مرادف كلمة "جَمِيل"؟',
      options: ['قبيح', 'حسن', 'رديء', 'سيئ'],
      correct: 1,
      explanation: '"حسن" هو مرادف لـ"جميل".',
      difficulty: 'beginner'
    }
  ],
  reading: [
    {
      id: 1,
      question: 'في النص: "العلم نور والجهل ظلام" ما هو الموضوع؟',
      options: ['العلم والجهل', 'النور والظلام', 'الحكمة', 'الفهم'],
      correct: 0,
      explanation: 'الموضوع الأساسي هو العلم والجهل وعلاقتهما.',
      difficulty: 'intermediate'
    },
    {
      id: 2,
      question: 'ما المقصود بـ"نور" في قوله تعالى: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ"؟',
      options: ['الضوء فقط', 'الهدى والعقيدة', 'الشمس', 'القمر'],
      correct: 1,
      explanation: '"النور" هنا يُراد به الهدى والعقيدة الصحيحة.',
      difficulty: 'advanced'
    },
    {
      id: 3,
      question: 'ما نوع الكلام في: "إن الصلاة تنهى عن الفحشاء والمنكر"؟',
      options: ['خبر', 'أمر', 'نهي', 'دعاء'],
      correct: 0,
      explanation: 'هذا خبر من الله تعالى عن أثر الصلاة.',
      difficulty: 'advanced'
    }
  ]
};

// Timer hook
function useTimer(initialTime = 30) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setIsActive(true);
  };

  const resetTimer = (time = initialTime) => {
    setTimeLeft(time);
    setIsActive(false);
  };

  return { timeLeft, isActive, startTimer, resetTimer };
}

export default function ArabicQuizChallenge() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('mixed');
  
  const { timeLeft, isActive, startTimer, resetTimer } = useTimer(45);

  const getCurrentQuestions = () => {
    if (!selectedCategory) return [];
    
    let questions = challengingQuestions[selectedCategory.id] || [];
    
    if (difficulty !== 'mixed') {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    
    return questions;
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestionData = currentQuestions[currentQuestion];

  const startQuiz = (category) => {
    setSelectedCategory(category);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnsweredQuestions([]);
    setStreak(0);
    resetTimer(45);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestionData.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
    } else {
      setStreak(0);
    }
    
    setAnsweredQuestions([...answeredQuestions, {
      ...currentQuestionData,
      userAnswer: answerIndex,
      isCorrect: isCorrect
    }]);

    setTimeout(() => {
      if (currentQuestion < currentQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        resetTimer(45);
        startTimer();
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnsweredQuestions([]);
    setStreak(0);
    resetTimer(45);
  };

  const getScoreColor = () => {
    const percentage = (score / currentQuestions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = (score / currentQuestions.length) * 100;
    if (percentage >= 90) return 'ممتاز! أنت خبير في اللغة العربية! 🏆';
    if (percentage >= 80) return 'رائع! أداء مميز جداً! ⭐';
    if (percentage >= 70) return 'جيد جداً! استمر في التعلم! 👍';
    if (percentage >= 60) return 'جيد! هناك مجال للتحسين! 📚';
    return 'استمر في الممارسة! التعلم عملية مستمرة! 💪';
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4">🧠</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              التحديات العربية
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              اختبر معرفتك باللغة العربية من خلال تحديات صعبة وممتعة
            </p>
          </motion.div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">اختر مستوى الصعوبة</h2>
            <div className="flex justify-center gap-4">
              {['mixed', 'beginner', 'intermediate', 'advanced'].map((level) => (
                <Button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`${
                    difficulty === level
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  } text-white`}
                >
                  {level === 'mixed' ? 'مختلط' :
                   level === 'beginner' ? 'مبتدئ' :
                   level === 'intermediate' ? 'متوسط' : 'متقدم'}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quizCategories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className={`bg-gradient-to-r ${category.color} text-white`}>
                    <div className="flex items-center justify-between">
                      <category.icon className="w-8 h-8" />
                      <Badge className="bg-white text-gray-800">
                        {category.difficulty === 'beginner' ? 'سهل' :
                         category.difficulty === 'intermediate' ? 'متوسط' : 'صعب'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-2">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <Button
                      onClick={() => startQuiz(category)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      ابدأ التحدي
                      <ChevronRight className="w-4 h-4 mr-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-6">🏆</div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              تهانينا!
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
                  <div className="text-gray-600">الإجابات الصحيحة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{currentQuestions.length}</div>
                  <div className="text-gray-600">الإجمالي</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{bestStreak}</div>
                  <div className="text-gray-600">أفضل سلسلة</div>
                </div>
              </div>
              
              <div className={`text-2xl font-bold mb-4 ${getScoreColor()}`}>
                {Math.round((score / currentQuestions.length) * 100)}%
              </div>
              <p className="text-lg text-gray-700 mb-6">{getScoreMessage()}</p>
              
              <Progress value={(score / currentQuestions.length) * 100} className="h-3 mb-8" />
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={resetQuiz}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                تحدٍ جديد
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.title}</h1>
            <p className="text-gray-600">{selectedCategory.description}</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{timeLeft}</div>
              <div className="text-sm text-gray-600">ثانية</div>
            </div>
            <Badge className="bg-purple-500 text-white">
              <Zap className="w-4 h-4 mr-1" />
              {streak}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>السؤال {currentQuestion + 1} من {currentQuestions.length}</span>
            <span>النقاط: {score}</span>
          </div>
          <Progress value={((currentQuestion + 1) / currentQuestions.length) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg mb-6">
              <CardHeader className={`bg-gradient-to-r ${selectedCategory.color} text-white`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">السؤال {currentQuestion + 1}</CardTitle>
                  <Badge className="bg-white text-gray-800">
                    {currentQuestionData.difficulty === 'beginner' ? 'سهل' :
                     currentQuestionData.difficulty === 'intermediate' ? 'متوسط' : 'صعب'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-right">
                  {currentQuestionData.question}
                </h2>
                
                <div className="space-y-3">
                  {currentQuestionData.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                      whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 text-right rounded-lg border-2 transition-all duration-200 ${
                        selectedAnswer === null
                          ? 'bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300'
                          : selectedAnswer === index
                          ? index === currentQuestionData.correct
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-red-100 border-red-500 text-red-800'
                          : index === currentQuestionData.correct
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        <span className="text-sm font-bold">
                          {index === 0 ? 'أ' : index === 1 ? 'ب' : index === 2 ? 'ج' : 'د'}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-lg ${
                      selectedAnswer === currentQuestionData.correct
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {selectedAnswer === currentQuestionData.correct ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <Brain className="w-5 h-5" />
                      )}
                      <p className="font-semibold">
                        {selectedAnswer === currentQuestionData.correct ? 'إجابة صحيحة!' : 'إجابة خاطئة!'}
                      </p>
                    </div>
                    <p className="text-sm">{currentQuestionData.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}