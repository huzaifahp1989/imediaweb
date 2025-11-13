import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, Brain, Trophy, Volume2, Eye, Hand, Edit3, Target, Zap, Globe } from 'lucide-react';
import ArabicWritingPractice from './ArabicWritingPractice';
import ArabicQuizChallenge from './ArabicQuizChallenge';
import EnglishArabicVocabulary from './EnglishArabicVocabulary';

// Arabic Alphabet with proper forms
const arabicAlphabet = [
  { letter: 'ا', name: 'Alif', isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا', sound: 'ā' },
  { letter: 'ب', name: 'Bā', isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب', sound: 'b' },
  { letter: 'ت', name: 'Tā', isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت', sound: 't' },
  { letter: 'ث', name: 'Thā', isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث', sound: 'th' },
  { letter: 'ج', name: 'Jīm', isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج', sound: 'j' },
  { letter: 'ح', name: 'Ḥā', isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح', sound: 'ḥ' },
  { letter: 'خ', name: 'Khā', isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ', sound: 'kh' },
  { letter: 'د', name: 'Dāl', isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد', sound: 'd' },
  { letter: 'ذ', name: 'Dhāl', isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ', sound: 'dh' },
  { letter: 'ر', name: 'Rā', isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر', sound: 'r' },
  { letter: 'ز', name: 'Zāy', isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز', sound: 'z' },
  { letter: 'س', name: 'Sīn', isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس', sound: 's' },
  { letter: 'ش', name: 'Shīn', isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش', sound: 'sh' },
  { letter: 'ص', name: 'Ṣād', isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص', sound: 'ṣ' },
  { letter: 'ض', name: 'Ḍād', isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض', sound: 'ḍ' },
  { letter: 'ط', name: 'Ṭā', isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط', sound: 'ṭ' },
  { letter: 'ظ', name: 'Ẓā', isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ', sound: 'ẓ' },
  { letter: 'ع', name: 'ʿAyn', isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع', sound: 'ʿ' },
  { letter: 'غ', name: 'Ghayn', isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ', sound: 'gh' },
  { letter: 'ف', name: 'Fā', isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف', sound: 'f' },
  { letter: 'ق', name: 'Qāf', isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق', sound: 'q' },
  { letter: 'ك', name: 'Kāf', isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك', sound: 'k' },
  { letter: 'ل', name: 'Lām', isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل', sound: 'l' },
  { letter: 'م', name: 'Mīm', isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم', sound: 'm' },
  { letter: 'ن', name: 'Nūn', isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن', sound: 'n' },
  { letter: 'ه', name: 'Hā', isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه', sound: 'h' },
  { letter: 'و', name: 'Wāw', isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو', sound: 'w/ū' },
  { letter: 'ي', name: 'Yā', isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي', sound: 'y/ī' }
];

// Arabic Grammar Lessons
const nahwLessons = [
  {
    id: 1,
    title: 'الإسم (The Noun)',
    description: 'Learn about Arabic nouns and their types',
    content: 'الإسم هو كلمة تدل على شيء معين وتُعرّف بالتنوين. مثل: ولدٌ، بيتٌ، كتابٌ',
    examples: ['ولدٌ (boy)', 'بيتٌ (house)', 'كتابٌ (book)', 'مدرسةٌ (school)'],
    difficulty: 'beginner'
  },
  {
    id: 2,
    title: 'الفعل (The Verb)',
    description: 'Understanding Arabic verbs and their patterns',
    content: 'الفعل هو كلمة تدل على حدث في زمن معين. يتغير حسب الزمن والفاعل.',
    examples: ['كتب (he wrote)', 'يكتب (he writes)', 'تكتب (she writes)', 'نكتب (we write)'],
    difficulty: 'intermediate'
  },
  {
    id: 3,
    title: 'الحرف (The Particle)',
    description: 'Learn about Arabic particles and prepositions',
    content: 'الحرف هو كلمة لا تدل على معنى تام ولكنها تدخل على الكلام لتغير معناه.',
    examples: ['في (in)', 'من (from)', 'إلى (to)', 'على (on)', 'بـ (with/by)'],
    difficulty: 'beginner'
  },
  {
    id: 4,
    title: 'الإعراب (Declension)',
    description: 'Understanding case endings in Arabic grammar',
    content: 'الإعراب هو تغير أواخر الكلمات بحسب موقعها في الجملة.',
    examples: ['الولدُ (subject)', 'الولدَ (object)', 'الولدِ (possessive)'],
    difficulty: 'advanced'
  }
];

const sarfLessons = [
  {
    id: 1,
    title: 'الأوزان الصرفية (Morphological Patterns)',
    description: 'Learn Arabic verb patterns and forms',
    content: 'الأوزان الصرفية هي أنماط خاصة لتصريف الأفعال في اللغة العربية.',
    examples: ['فعل (faʿala)', 'يفعل (yafʿalu)', 'فاعل (fāʿil)', 'مفعول (mafʿūl)'],
    difficulty: 'intermediate'
  },
  {
    id: 2,
    title: 'الجذور الثلاثية (Trilateral Roots)',
    description: 'Understanding the three-letter root system',
    content: 'معظم الكلمات العربية تُبنى على جذور ثلاثية.',
    examples: ['كتب (k-t-b): write', 'قرأ (q-r-ʾ): read', 'درس (d-r-s): study'],
    difficulty: 'intermediate'
  },
  {
    id: 3,
    title: 'التصريفات (Conjugations)',
    description: 'Learn how to conjugate Arabic verbs',
    content: 'تصريف الأفعال حسب الزمن والفاعل والعدد والجنس.',
    examples: ['كتبتُ (I wrote)', 'كتبتَ (you wrote)', 'كتبنا (we wrote)'],
    difficulty: 'advanced'
  }
];

// Challenging Arabic Quiz Questions
const challengingQuizQuestions = [
  {
    id: 1,
    question: 'ما هو إعراب كلمة "الولدُ" في جملة: "الولدُ يقرأ الكتابَ"؟',
    options: ['مبتدأ مرفوع', 'فاعل مرفوع', 'مفعول به منصوب', 'خبر مرفوع'],
    correct: 0,
    explanation: '"الولدُ" هو المبتدأ المرفوع وعلامة رفعه الضمة الظاهرة على آخره.',
    difficulty: 'advanced'
  },
  {
    id: 2,
    question: 'ما هو وزن الفعل "يُكَرِّمُ"؟',
    options: ['يفعل', 'يفاعل', 'يفعّل', 'يفعيل'],
    correct: 2,
    explanation: 'وزن "يُكَرِّمُ" هو "يفعّل" وهو باب التفعيل.',
    difficulty: 'intermediate'
  },
  {
    id: 3,
    question: 'اختر الكلمة التي تنتهي بالتاء المربوطة:',
    options: ['مُعلِّم', 'مُعلِّمة', 'مُعلِّمون', 'مُعلِّمات'],
    correct: 1,
    explanation: '"مُعلِّمة" تنتهي بالتاء المربوطة لأنها مؤنث.',
    difficulty: 'beginner'
  },
  {
    id: 4,
    question: 'ما هو الجذر الثلاثي لكلمة "مكتوب"؟',
    options: ['كتب', 'كتوب', 'كتاب', 'كتيب'],
    correct: 0,
    explanation: 'الجذر الثلاثي لـ"مكتوب" هو "كتب".',
    difficulty: 'intermediate'
  },
  {
    id: 5,
    question: 'في أي موقع تُستخدم "الباء" للجر؟',
    options: ['البداية فقط', 'النهاية فقط', 'في كل المواقع', 'في بعض الحالات الخاصة'],
    correct: 3,
    explanation: 'الباء تُستخدم للجر في حالات معينة مثل "ذهبتُ إلى المدرسة".',
    difficulty: 'advanced'
  }
];

// Letter joining exercises
const letterJoiningExercises = [
  {
    id: 1,
    instruction: 'اكتب الحرف "ب" في جميع أشكاله',
    letters: ['ب', 'بـ', 'ـبـ', 'ـب'],
    example: 'بيت ← ب + ي + ت',
    difficulty: 'beginner'
  },
  {
    id: 2,
    instruction: 'اكتب كلمة "كتاب" بالحروف المتصلة',
    answer: 'كتاب',
    breakdown: 'كـ + ـتـ + ـاب',
    difficulty: 'intermediate'
  },
  {
    id: 3,
    instruction: 'اكتب كلمة "مدرسة" بالحروف المتصلة',
    answer: 'مدرسة',
    breakdown: 'مـ + ـد + ـر + ـسـ + ـة',
    difficulty: 'advanced'
  }
];

export default function ArabicLearning() {
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
  };

  const handleQuizAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === challengingQuizQuestions[currentQuiz].correct;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuiz < challengingQuizQuestions.length - 1) {
        setCurrentQuiz(currentQuiz + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            تعلم اللغة العربية
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            تعلم العربية من الألف إلى الياء مع القواعد والتصريفات والتحديات الممتعة
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full bg-white rounded-lg p-1 gap-2 sm:gap-1 overflow-x-auto no-scrollbar flex flex-nowrap">
            <TabsTrigger value="alphabet" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white flex-none text-sm px-3 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              الأحرف
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white flex-none text-sm px-3 py-2">
              <Globe className="w-4 h-4 mr-2" />
              المفردات
            </TabsTrigger>
            <TabsTrigger value="grammar" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex-none text-sm px-3 py-2">
              <Brain className="w-4 h-4 mr-2" />
              القواعد
            </TabsTrigger>
            <TabsTrigger value="joining" className="data-[state=active]:bg-green-500 data-[state=active]:text-white flex-none text-sm px-3 py-2">
              <PenTool className="w-4 h-4 mr-2" />
              الربط
            </TabsTrigger>
            <TabsTrigger value="writing" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white flex-none text-sm px-3 py-2">
              <Edit3 className="w-4 h-4 mr-2" />
              الكتابة
            </TabsTrigger>
            <TabsTrigger value="quiz" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white flex-none text-sm px-3 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              التحديات
            </TabsTrigger>
          </TabsList>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <EnglishArabicVocabulary />
          </TabsContent>

          {/* Alphabet Tab */}
          <TabsContent value="alphabet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Alphabet Grid */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    الأحرف العربية
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                    {arabicAlphabet.map((letterObj, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLetterClick(letterObj)}
                        className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 rounded-lg flex flex-col items-center justify-center p-1 sm:p-2 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <span className="text-xl sm:text-2xl font-bold text-gray-800">{letterObj.letter}</span>
                        <span className="text-[11px] sm:text-xs text-gray-600 mt-1">{letterObj.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Letter Details */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    تفاصيل الحرف
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {selectedLetter ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-5xl sm:text-6xl font-bold text-gray-800">{selectedLetter.letter}</span>
                        <h3 className="text-lg sm:text-xl font-semibold mt-2">{selectedLetter.name}</h3>
                        <Badge className="mt-2 bg-blue-500">النطق: {selectedLetter.sound}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">منفصل</p>
                          <p className="text-2xl font-bold">{selectedLetter.isolated}</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">أول الكلمة</p>
                          <p className="text-2xl font-bold">{selectedLetter.initial}</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">وسط الكلمة</p>
                          <p className="text-2xl font-bold">{selectedLetter.medial}</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">آخر الكلمة</p>
                          <p className="text-2xl font-bold">{selectedLetter.final}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Hand className="w-12 h-12 mx-auto mb-3" />
                      <p>اختر حرفًا من الأعلى لترى تفاصيله</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grammar Tab */}
          <TabsContent value="grammar" className="space-y-6">
            <div className="space-y-6">
              {/* Nahw Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    النحو (Arabic Syntax)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {nahwLessons.map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                          <Badge className={`${
                            lesson.difficulty === 'beginner' ? 'bg-green-500' :
                            lesson.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}>
                            {lesson.difficulty === 'beginner' ? 'مبتدئ' :
                             lesson.difficulty === 'intermediate' ? 'متوسط' : 'متقدم'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{lesson.description}</p>
                        <p className="text-gray-800 mb-3">{lesson.content}</p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800 mb-2">أمثلة:</p>
                          <div className="flex flex-wrap gap-2">
                            {lesson.examples.map((example, index) => (
                              <Badge key={index} variant="outline" className="text-blue-700">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sarf Section */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    الصرف (Morphology)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {sarfLessons.map((lesson) => (
                      <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{lesson.title}</h3>
                          <Badge className={`${
                            lesson.difficulty === 'beginner' ? 'bg-green-500' :
                            lesson.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}>
                            {lesson.difficulty === 'beginner' ? 'مبتدئ' :
                             lesson.difficulty === 'intermediate' ? 'متوسط' : 'متقدم'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{lesson.description}</p>
                        <p className="text-gray-800 mb-3">{lesson.content}</p>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-purple-800 mb-2">أمثلة:</p>
                          <div className="flex flex-wrap gap-2">
                            {lesson.examples.map((example, index) => (
                              <Badge key={index} variant="outline" className="text-purple-700">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Joining Tab */}
          <TabsContent value="joining" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="text-xl flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  ربط الحروف (Letter Joining)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {letterJoiningExercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{exercise.instruction}</h3>
                        <Badge className={`${
                          exercise.difficulty === 'beginner' ? 'bg-green-500' :
                          exercise.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                        } text-white`}>
                          {exercise.difficulty === 'beginner' ? 'مبتدئ' :
                           exercise.difficulty === 'intermediate' ? 'متوسط' : 'متقدم'}
                        </Badge>
                      </div>
                      
                      {exercise.letters && (
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {exercise.letters.map((letter, index) => (
                            <div key={index} className="text-center p-3 bg-green-50 rounded-lg">
                              <span className="text-2xl font-bold text-green-800">{letter}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {exercise.answer && (
                        <div className="bg-green-50 p-4 rounded-lg mb-3">
                          <p className="text-lg font-bold text-green-800 text-center mb-2">{exercise.answer}</p>
                          <p className="text-sm text-green-600 text-center">{exercise.breakdown}</p>
                        </div>
                      )}
                      
                      {exercise.example && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">{exercise.example}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vocabulary Tab */}
          <TabsContent value="vocabulary" className="space-y-6">
            <EnglishArabicVocabulary />
          </TabsContent>

          {/* Writing Practice Tab */}
          <TabsContent value="writing" className="space-y-6">
            <ArabicWritingPractice />
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <ArabicQuizChallenge />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
