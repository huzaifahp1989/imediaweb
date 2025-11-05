import React, { useState } from "react";
// import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, CheckCircle, Search, Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AdminQuestions() {
  // Email-only mode: disable admin panel and show CTA
  const subject = encodeURIComponent("Admin Access Request - Quiz Questions");
  const body = encodeURIComponent("Hi, I'd like admin access to manage quiz questions on Islam Kids Zone. My name is ____ and my contact details are ____.");

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-4">
              The Quiz Questions panel is disabled in this email-only mode. Please request admin access.
            </p>
            <Button
              onClick={() => {
                window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Request Admin Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  
  const [formData, setFormData] = useState({
    category: "Quran",
    difficulty: "easy",
    question: "",
    options: ["", "", "", ""],
    correct_answer_index: 0,
    explanation: "",
    source: "",
    age_group: "all",
    is_active: true
  });

  const categories = ["Quran", "Hadith", "Seerah", "Fiqh", "Prophets", "Sahabah", "Akhlaq", "History", "Arabic", "Beliefs"];
  const difficulties = ["easy", "medium", "hard"];
  const ageGroups = ["5-8", "9-12", "13+", "all"];

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: () => base44.entities.QuizQuestion.list('-date_added', 500),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.QuizQuestion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.QuizQuestion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.QuizQuestion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      date_added: new Date().toISOString().split('T')[0]
    };

    if (editingQuestion) {
      await updateMutation.mutateAsync({ id: editingQuestion.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      category: question.category,
      difficulty: question.difficulty,
      question: question.question,
      options: question.options,
      correct_answer_index: question.correct_answer_index,
      explanation: question.explanation,
      source: question.source || "",
      age_group: question.age_group || "all",
      is_active: question.is_active ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "Quran",
      difficulty: "easy",
      question: "",
      options: ["", "", "", ""],
      correct_answer_index: 0,
      explanation: "",
      source: "",
      age_group: "all",
      is_active: true
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || q.category === filterCategory;
    const matchesDifficulty = filterDifficulty === "all" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const stats = {
    total: questions.length,
    active: questions.filter(q => q.is_active).length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat] = questions.filter(q => q.category === cat).length;
      return acc;
    }, {}),
    byDifficulty: difficulties.reduce((acc, diff) => {
      acc[diff] = questions.filter(q => q.difficulty === diff).length;
      return acc;
    }, {})
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Questions Manager</h1>
            <p className="text-gray-600">Manage questions for Islamic Knowledge Quiz</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Add New Question"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Easy</p>
                <p className="text-3xl font-bold text-green-500">{stats.byDifficulty.easy || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Hard</p>
                <p className="text-3xl font-bold text-red-500">{stats.byDifficulty.hard || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-8 border-2 border-blue-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Difficulty</Label>
                        <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {difficulties.map(diff => (
                              <SelectItem key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Age Group</Label>
                        <Select value={formData.age_group} onValueChange={(value) => setFormData({ ...formData, age_group: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ageGroups.map(age => (
                              <SelectItem key={age} value={age}>{age}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Question</Label>
                      <Textarea
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        placeholder="Enter your question..."
                        required
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Answer Options</Label>
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Badge className={formData.correct_answer_index === index ? "bg-green-500" : "bg-gray-400"}>
                            {index + 1}
                          </Badge>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            required
                          />
                          <Button
                            type="button"
                            variant={formData.correct_answer_index === index ? "default" : "outline"}
                            onClick={() => setFormData({ ...formData, correct_answer_index: index })}
                            className="whitespace-nowrap"
                          >
                            {formData.correct_answer_index === index ? <CheckCircle className="w-4 h-4 mr-1" /> : null}
                            Correct
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Explanation</Label>
                      <Textarea
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        placeholder="Explain the correct answer..."
                        required
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Source (Optional)</Label>
                      <Input
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        placeholder="e.g., Quran 2:255, Sahih Bukhari 1234"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label>Active (Show in quiz)</Label>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {editingQuestion ? "Update" : "Create"} Question
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

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search questions..."
                />
              </div>
              <div>
                <Label className="mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Difficulty
                </Label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {difficulties.map(diff => (
                      <SelectItem key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={!question.is_active ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>{question.category}</Badge>
                        <Badge variant="outline" className={
                          question.difficulty === "easy" ? "bg-green-100" :
                          question.difficulty === "medium" ? "bg-yellow-100" : "bg-red-100"
                        }>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.age_group}</Badge>
                        {!question.is_active && <Badge variant="destructive">Inactive</Badge>}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{question.question}</h3>
                      <div className="space-y-1 mb-3">
                        {question.options.map((option, idx) => (
                          <div key={idx} className={`text-sm ${idx === question.correct_answer_index ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                            {idx === question.correct_answer_index && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {idx + 1}. {option}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                      {question.source && (
                        <p className="text-xs text-gray-500 mt-2">Source: {question.source}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleEdit(question)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(question.id)}
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

        {filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No questions found. Add some questions to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
