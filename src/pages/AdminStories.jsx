import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, BookOpen, Search, Image as ImageIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminStories() {
  const [user, setUser] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    moral: "",
    image_url: "",
    audio_url: "",
    age_range: "5-12",
    category: "prophets"
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        navigate(createPageUrl("Home"));
        return;
      }

      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        alert("Access Denied: Admin privileges required");
        navigate(createPageUrl("Home"));
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate(createPageUrl("Home"));
    }
  };

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['admin-stories'],
    queryFn: async () => {
      return await base44.entities.Story.list('-created_date');
    },
    initialData: [],
  });

  const createStoryMutation = useMutation({
    mutationFn: async (storyData) => {
      return await base44.entities.Story.create(storyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      setShowForm(false);
      resetForm();
    }
  });

  const updateStoryMutation = useMutation({
    mutationFn: async ({ id, storyData }) => {
      return await base44.entities.Story.update(id, storyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
      setEditingStory(null);
      setShowForm(false);
      resetForm();
    }
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Story.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      moral: "",
      image_url: "",
      audio_url: "",
      age_range: "5-12",
      category: "prophets"
    });
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      moral: story.moral,
      image_url: story.image_url || "",
      audio_url: story.audio_url || "",
      age_range: story.age_range || "5-12",
      category: story.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      await deleteStoryMutation.mutateAsync(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingStory) {
      await updateStoryMutation.mutateAsync({
        id: editingStory.id,
        storyData: formData
      });
    } else {
      await createStoryMutation.mutateAsync(formData);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || story.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stories Management</h1>
              <p className="text-gray-600">Create and manage Islamic stories</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("AdminMedia")}>
              <Button variant="outline">
                <ImageIcon className="w-4 h-4 mr-2" />
                Media Library
              </Button>
            </Link>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingStory(null);
                resetForm();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Story
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="prophets">Prophets</SelectItem>
              <SelectItem value="sahabah">Sahabah</SelectItem>
              <SelectItem value="manners">Manners</SelectItem>
              <SelectItem value="kindness">Kindness</SelectItem>
              <SelectItem value="honesty">Honesty</SelectItem>
              <SelectItem value="gratitude">Gratitude</SelectItem>
              <SelectItem value="bedtime">Bedtime</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-6 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {editingStory ? "Edit Story" : "Create New Story"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowForm(false);
                        setEditingStory(null);
                        resetForm();
                      }}
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="e.g., The Story of Prophet Yusuf"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Category *</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prophets">Prophets</SelectItem>
                          <SelectItem value="sahabah">Sahabah</SelectItem>
                          <SelectItem value="manners">Manners</SelectItem>
                          <SelectItem value="kindness">Kindness</SelectItem>
                          <SelectItem value="honesty">Honesty</SelectItem>
                          <SelectItem value="gratitude">Gratitude</SelectItem>
                          <SelectItem value="bedtime">Bedtime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Age Range</label>
                      <Select
                        value={formData.age_range}
                        onValueChange={(value) => setFormData({ ...formData, age_range: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3-6">3-6 years</SelectItem>
                          <SelectItem value="5-12">5-12 years</SelectItem>
                          <SelectItem value="7-10">7-10 years</SelectItem>
                          <SelectItem value="11+">11+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Story Content * (Markdown supported)</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                      rows={12}
                      placeholder="Write your story here... You can use **bold**, *italic*, and # headings"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tip: Use markdown formatting for better text styling
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Moral/Lesson *</label>
                    <Textarea
                      value={formData.moral}
                      onChange={(e) => setFormData({ ...formData, moral: e.target.value })}
                      required
                      rows={3}
                      placeholder="What should children learn from this story?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Image URL (optional)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://... or upload via Media Library"
                      />
                      <Link to={createPageUrl("AdminMedia")} target="_blank">
                        <Button type="button" variant="outline">
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="mt-2 h-32 object-cover rounded-lg"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Audio URL (optional)
                    </label>
                    <Input
                      value={formData.audio_url}
                      onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                      placeholder="https://... (MP3 audio narration)"
                    />
                  </div>

                  <div className="flex gap-4 justify-end border-t pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingStory(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      {editingStory ? "Update Story" : "Create Story"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stories List */}
        {isLoading ? (
          <div className="text-center py-12">Loading stories...</div>
        ) : filteredStories.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              {stories.length === 0 ? "No stories created yet." : "No stories match your search."}
            </p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Create Your First Story
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  {story.image_url && (
                    <div className="h-48 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden">
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                    <Badge>{story.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {story.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>{story.age_range}</span>
                    {story.audio_url && <span>• 🔊 Audio</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(story)}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(story.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stories.length}</p>
              <p className="text-sm text-gray-600">Total Stories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {stories.filter(s => s.image_url).length}
              </p>
              <p className="text-sm text-gray-600">With Images</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stories.filter(s => s.audio_url).length}
              </p>
              <p className="text-sm text-gray-600">With Audio</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}