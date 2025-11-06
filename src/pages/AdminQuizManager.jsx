import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, Star, Calendar, TrendingUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getFirebase } from "@/api/firebase";

export default function AdminQuizManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "Quran",
    difficulty: "mixed",
    duration_minutes: 15,
    passing_score: 70,
    points_reward: 20,
    bonus_points: 10,
    is_active: true,
    is_featured: false,
    age_group: "all",
    icon: "📝",
    start_date: "",
    end_date: ""
  });

  const subjects = ["Quran", "Hadith", "Seerah", "Fiqh", "Prophets", "Sahabah", "Akhlaq", "History", "Arabic", "Beliefs", "Mixed"];

  const { data: quizzes = [] } = useQuery({
    queryKey: ['all-quizzes'],
    queryFn: () => base44.entities.Quiz.list('-created_date', 100),
    initialData: [],
  });

  const { data: allQuestions = [] } = useQuery({
    queryKey: ['all-quiz-questions'],
    queryFn: () => base44.entities.QuizQuestion.filter({ is_active: true }, '-date_added', 500),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Quiz.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quizzes'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quiz.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quizzes'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Quiz.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quizzes'] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      questions: selectedQuestions,
      week_number: formData.start_date ? getWeekNumber(new Date(formData.start_date)) : null
    };

    if (editingQuiz) {
      await updateMutation.mutateAsync({ id: editingQuiz.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      duration_minutes: quiz.duration_minutes,
      passing_score: quiz.passing_score,
      points_reward: quiz.points_reward,
      bonus_points: quiz.bonus_points,
      is_active: quiz.is_active,
      is_featured: quiz.is_featured,
      age_group: quiz.age_group || "all",
      icon: quiz.icon || "📝",
      start_date: quiz.start_date || "",
      end_date: quiz.end_date || ""
    });
    setSelectedQuestions(quiz.questions || []);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: "Quran",
      difficulty: "mixed",
      duration_minutes: 15,
      passing_score: 70,
      points_reward: 20,
      bonus_points: 10,
      is_active: true,
      is_featured: false,
      age_group: "all",
      icon: "📝",
      start_date: "",
      end_date: ""
    });
    setSelectedQuestions([]);
    setEditingQuiz(null);
    setShowForm(false);
    setAiTopic("");
    setAiCount(5);
    setAiLoading(false);
    setAiError("");
    setAiSuccess("");
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredQuestions = allQuestions.filter(q => 
    formData.subject === "Mixed" || q.category === formData.subject
  );

  const normalizeDifficulty = (d) => {
    const v = String(d || '').toLowerCase();
    if (['easy','medium','hard'].includes(v)) return v;
    if (v === 'mixed') return 'easy';
    return 'easy';
  };

  const generateWithAI = async () => {
    setAiError("");
    setAiSuccess("");
    if (!aiTopic.trim()) {
      setAiError("Enter a topic for AI generation");
      return;
    }
    setAiLoading(true);
    try {
      const { auth } = getFirebase();
      if (!auth?.currentUser) throw new Error("Please login to use AI agent");
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/quizAgent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topic: aiTopic,
          subject: formData.subject,
          difficulty: formData.difficulty,
          count: aiCount,
        }),
      });
      if (!res.ok) throw new Error(`Agent error: ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data.questions) ? data.questions : [];

      const createdIds = [];
      for (const q of list) {
        try {
          const options = Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0,4) : ['A','B','C','D'];
          const idx = Math.max(0, options.findIndex(opt => String(opt).trim() === String(q.answer || '').trim()));
          const payload = {
            category: q.category || formData.subject,
            difficulty: normalizeDifficulty(q.difficulty || formData.difficulty),
            question: q.question || `Question about ${aiTopic}`,
            options,
            correct_answer_index: idx >= 0 ? idx : 0,
            explanation: "",
            source: "AI",
            age_group: formData.age_group || "all",
            is_active: true,
          };
          const created = await base44.entities.QuizQuestion.create(payload);
          if (created?.id) createdIds.push(created.id);
        } catch (e) {
          // continue on errors per question
        }
      }
      if (createdIds.length) {
        setSelectedQuestions(prev => [...prev, ...createdIds]);
        queryClient.invalidateQueries({ queryKey: ['all-quiz-questions'] });
      }
      setAiSuccess(`Generated ${list.length} and added ${createdIds.length} questions.`);
    } catch (err) {
      setAiError(err?.message || 'Failed to generate with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const stats = {
    total: quizzes.length,
    active: quizzes.filter(q => q.is_active).length,
    featured: quizzes.filter(q => q.is_featured).length,
    totalAttempts: quizzes.reduce((sum, q) => sum + (q.total_attempts || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Manager</h1>
            <p className="text-gray-600">Create and manage weekly quizzes</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Create Quiz"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Quizzes</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Featured</p>
              <p className="text-3xl font-bold text-amber-600">{stats.featured}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalAttempts}</p>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-8 border-2 border-blue-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>AI Topic</Label>
                        <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., Ramadan, Salah, Wudu" />
                      </div>
                      <div>
                        <Label>AI Count</Label>
                        <Input type="number" value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value || '5'))} />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" className="bg-purple-600 hover:bg-purple-700" onClick={generateWithAI} disabled={aiLoading}>
                          {aiLoading ? 'Generating…' : 'Generate via AI'}
                        </Button>
                      </div>
                    </div>
                    {(aiError || aiSuccess) && (
                      <div className="text-sm">
                        {aiError && <div className="text-red-600">{aiError}</div>}
                        {aiSuccess && <div className="text-green-600">{aiSuccess}</div>}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Quiz Title</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Ramadan Champions Quiz"
                          required
                        />
                      </div>
                      <div>
                        <Label>Icon Emoji</Label>
                        <Input
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          placeholder="📝"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the quiz..."
                        rows={2}
                      />
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label>Subject</Label>
                        <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Duration (min)</Label>
                        <Input
                          type="number"
                          value={formData.duration_minutes}
                          onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={formData.points_reward}
                          onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Bonus</Label>
                        <Input
                          type="number"
                          value={formData.bonus_points}
                          onChange={(e) => setFormData({ ...formData, bonus_points: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                        />
                        <Label>Featured</Label>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Select Questions ({selectedQuestions.length} selected)</Label>
                      <div className="max-h-96 overflow-y-auto border rounded-lg p-4 space-y-2">
                        {filteredQuestions.map(question => (
                          <div
                            key={question.id}
                            onClick={() => toggleQuestionSelection(question.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedQuestions.includes(question.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedQuestions.includes(question.id)}
                                onChange={() => {}}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{question.question}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{question.category}</Badge>
                                  <Badge variant="outline" className="text-xs">{question.difficulty}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {editingQuiz ? "Update" : "Create"} Quiz
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quizzes List */}
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={quiz.is_featured ? "border-4 border-amber-400" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-4xl">{quiz.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">{quiz.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge>{quiz.subject}</Badge>
                        <Badge variant="outline">{quiz.questions?.length || 0} questions</Badge>
                        <Badge variant="outline">{quiz.duration_minutes} min</Badge>
                        <Badge variant="outline">{quiz.points_reward} pts</Badge>
                        {quiz.is_featured && <Badge className="bg-amber-500"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
                        {!quiz.is_active && <Badge variant="destructive">Inactive</Badge>}
                        {quiz.total_attempts > 0 && (
                          <Badge variant="outline">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {quiz.total_attempts} attempts
                          </Badge>
                        )}
                      </div>
                      {quiz.start_date && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {quiz.start_date} to {quiz.end_date}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => handleEdit(quiz)} variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(quiz.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
