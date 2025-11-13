import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { PenTool, Eraser, RotateCcw, CheckCircle, Eye } from 'lucide-react';

// Arabic words for writing practice
const writingPracticeWords = [
  { word: 'كتاب', transliteration: 'kitāb', meaning: 'book', difficulty: 'beginner' },
  { word: 'قلم', transliteration: 'qalam', meaning: 'pen', difficulty: 'beginner' },
  { word: 'مدرسة', transliteration: 'madrasah', meaning: 'school', difficulty: 'intermediate' },
  { word: 'طالب', transliteration: 'ṭālib', meaning: 'student', difficulty: 'intermediate' },
  { word: 'معلم', transliteration: 'muʿallim', meaning: 'teacher', difficulty: 'intermediate' },
  { word: 'مكتبة', transliteration: 'maktabah', meaning: 'library', difficulty: 'advanced' },
  { word: 'دراسة', transliteration: 'dirāsah', meaning: 'study', difficulty: 'advanced' },
  { word: 'تعليم', transliteration: 'taʿlīm', meaning: 'education', difficulty: 'advanced' }
];

// Letter tracing guides
const letterTracingGuides = [
  { letter: 'ب', steps: ['Start at the top dot', 'Draw downward curve', 'Add the dot underneath'] },
  { letter: 'ت', steps: ['Start at the top', 'Draw vertical line', 'Add two dots above'] },
  { letter: 'ث', steps: ['Start at the top', 'Draw vertical line', 'Add three dots above'] },
  { letter: 'ج', steps: ['Start at the top', 'Draw the curve', 'Add one dot in the middle'] },
  { letter: 'ح', steps: ['Start at the top', 'Draw the main shape', 'No dots needed'] },
  { letter: 'خ', steps: ['Start at the top', 'Draw the main shape', 'Add one dot above'] }
];

export default function ArabicWritingPractice() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [completedWords, setCompletedWords] = useState([]);
  const [currentTool, setCurrentTool] = useState('pen'); // 'pen' or 'eraser'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw guide lines
    drawGuidelines(ctx);
  }, []);

  const drawGuidelines = (ctx) => {
    const canvas = canvasRef.current;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Baseline
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    ctx.lineTo(canvas.width, canvas.height - 50);
    ctx.stroke();

    // Midline
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 100);
    ctx.lineTo(canvas.width, canvas.height - 100);
    ctx.stroke();

    // Top line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 150);
    ctx.lineTo(canvas.width, canvas.height - 150);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = currentTool === 'pen' ? 3 : 20;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentTool === 'pen' ? '#1f2937' : '#ffffff';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGuidelines(ctx);
    setStrokeCount(0);
  };

  const checkWord = () => {
    // Simple completion check - in a real app, this would use handwriting recognition
    const word = writingPracticeWords[currentWord];
    setCompletedWords([...completedWords, word.word]);
    
    if (currentWord < writingPracticeWords.length - 1) {
      setCurrentWord(currentWord + 1);
      clearCanvas();
    } else {
      alert('مبروك! لقد أكملت جميع الكلمات! 🎉');
    }
  };

  const nextWord = () => {
    if (currentWord < writingPracticeWords.length - 1) {
      setCurrentWord(currentWord + 1);
      clearCanvas();
    }
  };

  const previousWord = () => {
    if (currentWord > 0) {
      setCurrentWord(currentWord - 1);
      clearCanvas();
    }
  };

  const currentWordData = writingPracticeWords[currentWord];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">✍️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            تمرين الكتابة العربية
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            تعلم كتابة الكلمات العربية خطوة بخطوة مع أدوات التمارين التفاعلية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Writing Canvas */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                لوحة الكتابة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Word Display */}
              <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentWordData.word}</h2>
                <p className="text-lg text-gray-600 mb-1">{currentWordData.transliteration}</p>
                <p className="text-md text-gray-500">{currentWordData.meaning}</p>
                <Badge className={`mt-2 ${
                  currentWordData.difficulty === 'beginner' ? 'bg-green-500' :
                  currentWordData.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                } text-white`}>
                  {currentWordData.difficulty === 'beginner' ? 'مبتدئ' :
                   currentWordData.difficulty === 'intermediate' ? 'متوسط' : 'متقدم'}
                </Badge>
              </div>

              {/* Canvas */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              {/* Drawing Tools */}
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  onClick={() => setCurrentTool('pen')}
                  className={`${currentTool === 'pen' ? 'bg-blue-500' : 'bg-gray-400'} hover:bg-blue-600`}
                >
                  <PenTool className="w-4 h-4 mr-1" />
                  قلم
                </Button>
                <Button
                  onClick={() => setCurrentTool('eraser')}
                  className={`${currentTool === 'eraser' ? 'bg-orange-500' : 'bg-gray-400'} hover:bg-orange-600`}
                >
                  <Eraser className="w-4 h-4 mr-1" />
                  ممحاة
                </Button>
                <Button
                  onClick={clearCanvas}
                  variant="outline"
                  className="border-gray-300"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  مسح
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={previousWord}
                  disabled={currentWord === 0}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300"
                >
                  السابق
                </Button>
                
                <span className="text-gray-600">
                  {currentWord + 1} / {writingPracticeWords.length}
                </span>
                
                <Button
                  onClick={nextWord}
                  disabled={currentWord === writingPracticeWords.length - 1}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300"
                >
                  التالي
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Letter Guide */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <Eye className="w-5 h-5" />
                دليل الكتابة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">خطوات الكتابة</h3>
                  <Button
                    onClick={() => setShowGuide(!showGuide)}
                    variant="outline"
                    size="sm"
                  >
                    {showGuide ? 'إخفاء' : 'إظهار'} الدليل
                  </Button>
                </div>

                {showGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    {letterTracingGuides.slice(0, 3).map((guide, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-800">{guide.letter}</span>
                          <span className="text-sm text-gray-600">خطوات الكتابة:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                          {guide.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Progress */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">تقدمك</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>الكلمات المكتملة</span>
                      <span>{completedWords.length} / {writingPracticeWords.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completedWords.length / writingPracticeWords.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {completedWords.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">الكلمات المكتملة:</p>
                      <div className="flex flex-wrap gap-1">
                        {completedWords.map((word, index) => (
                          <Badge key={index} className="bg-green-500 text-white text-xs">
                            {word} ✓
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={checkWord}
                  className="w-full bg-green-500 hover:bg-green-600 mt-4"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  تحقق من الكلمة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}