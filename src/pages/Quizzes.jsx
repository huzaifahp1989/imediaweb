import React, { useState, useEffect } from "react";
// import { base44 } from "@/api/base44Client";
import { awardPointsForGame } from "@/api/points";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Target, Star, CheckCircle2, XCircle, Award, Brain, BookOpen, Users, TrendingUp, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Quizzes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    loadUser();
  }, []);

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

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const allQuizzes = await base44.entities.Quiz.filter({ is_active: true }, '-created_date', 100);
      
      // Filter by date availability
      const now = new Date();
      return allQuizzes.filter(quiz => {
        const startDate = quiz.start_date ? new Date(quiz.start_date) : null;
        const endDate = quiz.end_date ? new Date(quiz.end_date) : null;
        
        if (startDate && now < startDate) return false;
        if (endDate && now > endDate) return false;
        
        return true;
      });
    },
    initialData: [],
  });

  const { data: userAttempts = [] } = useQuery({
    queryKey: ['user-quiz-attempts', user?.id],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user,
    initialData: [],
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['quiz-questions', selectedQuiz?.id],
    queryFn: async () => {
      if (!selectedQuiz) return [];
      
      const questionIds = selectedQuiz.questions || [];
      const loadedQuestions = await Promise.all(
        questionIds.map(async (id) => {
          try {
            const q = await base44.entities.QuizQuestion.filter({ id });
            return q[0];
          } catch (e) {
            return null;
          }
        })
      );
      
      return loadedQuestions.filter(q => q !== null);
    },
    enabled: !!selectedQuiz,
    initialData: [],
  });

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResult(false);
    setQuizComplete(false);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer_index;
    
    setUserAnswers([...userAnswers, {
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      is_correct: isCorrect
    }]);
    
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const correctCount = userAnswers.filter(a => a.is_correct).length + (selectedAnswer === questions[currentQuestionIndex]?.correct_answer_index ? 1 : 0);
    const totalQuestions = questions.length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= (selectedQuiz.passing_score || 70);
    
    let pointsEarned = passed ? (selectedQuiz.points_reward || 20) : 0;
    if (scorePercentage === 100) {
      pointsEarned += (selectedQuiz.bonus_points || 10);
    }
    
    const results = {
      score: scorePercentage,
      correct_answers: correctCount,
      total_questions: totalQuestions,
      time_taken: timeTaken,
      points_earned: pointsEarned,
      passed: passed
    };
    
    setQuizResults(results);
    setQuizComplete(true);
    
    if (user) {
      try {
        await base44.entities.QuizAttempt.create({
          user_id: user.id,
          quiz_id: selectedQuiz.id,
          score: scorePercentage,
          points_earned: pointsEarned,
          correct_answers: correctCount,
          total_questions: totalQuestions,
          time_taken_seconds: timeTaken,
          answers: [...userAnswers, {
            question_id: questions[currentQuestionIndex]?.id,
            selected_answer: selectedAnswer,
            is_correct: selectedAnswer === questions[currentQuestionIndex]?.correct_answer_index
          }],
          passed: passed,
          completed_at: new Date().toISOString()
        });
        
        await base44.entities.Quiz.update(selectedQuiz.id, {
          total_attempts: (selectedQuiz.total_attempts || 0) + 1
        });
        // Award points via unified Firebase-backed pipeline
        try {
          await awardPointsForGame(user, 'quiz', {
            isPerfect: scorePercentage === 100,
            fallbackScore: pointsEarned,
            metadata: {
              quiz_id: selectedQuiz.id,
              score_percentage: scorePercentage,
              correct_answers: correctCount,
              total_questions: totalQuestions,
              time_taken_seconds: timeTaken,
              passed,
            }
          });
        } catch (e) {
          console.warn('awardPointsForGame failed:', e?.message || e);
        }
      } catch (error) {
        console.error("Error saving quiz attempt:", error);
      }
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setUserAnswers([]);
    setQuizComplete(false);
    setQuizResults(null);
  };

  const getUserBestScore = (quizId) => {
    const attempts = userAttempts.filter(a => a.quiz_id === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score));
  };

  const subjects = ["all", "Quran", "Hadith", "Seerah", "Fiqh", "Prophets", "Sahabah", "Akhlaq", "History", "Mixed"];
  
  const filteredQuizzes = filterSubject === "all" 
    ? quizzes 
    : quizzes.filter(q => q.subject === filterSubject);

  const featuredQuizzes = quizzes.filter(q => q.is_featured);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 animate-bounce text-blue-600" />
          <p className="text-gray-600 font-medium">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  // Quiz taking view
  if (selectedQuiz && !quizComplete) {
    if (questions.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">Loading quiz questions...</p>
              <Button onClick={resetQuiz}>Back to Quizzes</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl">{selectedQuiz.title}</CardTitle>
                <Badge className="bg-white/20 text-white">
                  <Clock className="w-4 h-4 mr-1" />
                  Question {currentQuestionIndex + 1}/{questions.length}
                </Badge>
              </div>
              <Progress value={progress} className="bg-white/20" />
            </CardHeader>
            <CardContent className="p-8">
              {!showResult ? (
                <div className="space-y-6">
                  <div>
                    <Badge className="mb-4">{currentQuestion.category}</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      {currentQuestion.question}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedAnswer === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            selectedAnswer === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1 text-gray-900">{option}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-lg py-6"
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-6">
                    {selectedAnswer === currentQuestion.correct_answer_index ? '🎉' : '📚'}
                  </div>
                  <h3 className={`text-3xl font-bold mb-4 ${
                    selectedAnswer === currentQuestion.correct_answer_index ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedAnswer === currentQuestion.correct_answer_index ? 'Correct!' : 'Not Quite!'}
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    {selectedAnswer !== currentQuestion.correct_answer_index && (
                      <p className="text-lg mb-3">
                        <strong>Correct Answer:</strong> {currentQuestion.options[currentQuestion.correct_answer_index]}
                      </p>
                    )}
                    <p className="text-gray-700">
                      <strong>Explanation:</strong> {currentQuestion.explanation}
                    </p>
                    {currentQuestion.source && (
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Source:</strong> {currentQuestion.source}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleNextQuestion}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results view
  if (quizComplete && quizResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="shadow-2xl border-4 border-blue-300">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-6">
                  {quizResults.passed ? '🏆' : '📖'}
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {quizResults.passed ? 'Congratulations!' : 'Keep Learning!'}
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-4xl font-bold text-blue-600">{quizResults.score}%</p>
                    <p className="text-sm text-gray-600">Score</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                    <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-4xl font-bold text-purple-600">{quizResults.points_earned}</p>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex justify-around text-center">
                    <div>
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-600" />
                      <p className="text-2xl font-bold text-gray-900">{quizResults.correct_answers}</p>
                      <p className="text-xs text-gray-600">Correct</p>
                    </div>
                    <div>
                      <XCircle className="w-6 h-6 mx-auto mb-1 text-red-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {quizResults.total_questions - quizResults.correct_answers}
                      </p>
                      <p className="text-xs text-gray-600">Wrong</p>
                    </div>
                    <div>
                      <Clock className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.floor(quizResults.time_taken / 60)}:{(quizResults.time_taken % 60).toString().padStart(2, '0')}
                      </p>
                      <p className="text-xs text-gray-600">Time</p>
                    </div>
                  </div>
                </div>

                {quizResults.score === 100 && (
                  <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 rounded-xl p-4 mb-6">
                    <p className="text-amber-900 font-bold">
                      ⭐ Perfect Score! +{selectedQuiz.bonus_points} Bonus Points!
                    </p>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <Button onClick={resetQuiz} variant="outline" size="lg">
                    Back to Quizzes
                  </Button>
                  <Button onClick={() => startQuiz(selectedQuiz)} className="bg-gradient-to-r from-blue-500 to-purple-500" size="lg">
                    Retry Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz selection view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Islamic Quizzes</h1>
          <p className="text-xl text-gray-600">Test your knowledge on various Islamic topics</p>
        </motion.div>

        {/* Subject Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {subjects.map((subject) => (
            <Button
              key={subject}
              onClick={() => setFilterSubject(subject)}
              variant={filterSubject === subject ? "default" : "outline"}
              className={filterSubject === subject ? "bg-blue-600" : ""}
            >
              {subject === "all" ? "All Subjects" : subject}
            </Button>
          ))}
        </div>

        {/* Featured Quizzes */}
        {featuredQuizzes.length > 0 && filterSubject === "all" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              Featured This Week
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-4 border-amber-400 hover:shadow-2xl transition-all cursor-pointer bg-gradient-to-br from-amber-50 to-yellow-50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{quiz.icon}</div>
                          <div>
                            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-amber-500">Featured</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge>{quiz.subject}</Badge>
                        <Badge variant="outline">{quiz.questions?.length || 0} Questions</Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {quiz.duration_minutes} min
                        </Badge>
                        <Badge variant="outline">
                          <Award className="w-3 h-3 mr-1" />
                          {quiz.points_reward} pts
                        </Badge>
                      </div>
                      {user && getUserBestScore(quiz.id) !== null && (
                        <div className="bg-blue-100 rounded-lg p-2 mb-4">
                          <p className="text-sm text-blue-900">
                            <strong>Your Best:</strong> {getUserBestScore(quiz.id)}%
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() => startQuiz(quiz)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
                        size="lg"
                      >
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Quizzes */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {filterSubject === "all" ? "All Quizzes" : `${filterSubject} Quizzes`}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl">{quiz.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{quiz.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{quiz.subject}</Badge>
                    <Badge variant="outline">{quiz.questions?.length || 0} Qs</Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {quiz.duration_minutes}m
                    </Badge>
                  </div>
                  {user && getUserBestScore(quiz.id) !== null && (
                    <div className="bg-green-100 rounded-lg p-2 mb-4">
                      <p className="text-xs text-green-900">
                        Best: {getUserBestScore(quiz.id)}%
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => startQuiz(quiz)}
                    className="w-full bg-blue-600"
                  >
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No quizzes available in this category yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
