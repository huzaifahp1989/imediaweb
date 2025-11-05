import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Save, X, ArrowLeft, GitBranch, Play, CheckCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminStoryBuilder() {
  const [user, setUser] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNodeIndex, setEditingNodeIndex] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    moral: "",
    image_url: "",
    category: "manners",
    age_range: "7-12",
    is_interactive: true,
    starting_node: "start",
    story_nodes: []
  });

  const [nodeForm, setNodeForm] = useState({
    id: "",
    content: "",
    character: "",
    image_url: "",
    is_ending: false,
    ending_type: "good",
    choices: []
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
    queryKey: ['admin-interactive-stories'],
    queryFn: async () => {
      const allStories = await base44.entities.Story.list('-created_date');
      return allStories.filter(s => s.is_interactive);
    },
    initialData: [],
  });

  const createStoryMutation = useMutation({
    mutationFn: async (storyData) => {
      return await base44.entities.Story.create(storyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-interactive-stories'] });
      setShowForm(false);
      resetForm();
    }
  });

  const updateStoryMutation = useMutation({
    mutationFn: async ({ id, storyData }) => {
      return await base44.entities.Story.update(id, storyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-interactive-stories'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-interactive-stories'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      moral: "",
      image_url: "",
      category: "manners",
      age_range: "7-12",
      is_interactive: true,
      starting_node: "start",
      story_nodes: []
    });
    setEditingNodeIndex(null);
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      description: story.description || "",
      moral: story.moral,
      image_url: story.image_url || "",
      category: story.category,
      age_range: story.age_range || "7-12",
      is_interactive: true,
      starting_node: story.starting_node || "start",
      story_nodes: story.story_nodes || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this interactive story?")) {
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

  const addNode = () => {
    const newNode = {
      id: `node_${Date.now()}`,
      content: "",
      character: "",
      image_url: "",
      is_ending: false,
      ending_type: "good",
      choices: []
    };
    setFormData({
      ...formData,
      story_nodes: [...formData.story_nodes, newNode]
    });
  };

  const updateNode = (index, field, value) => {
    const newNodes = [...formData.story_nodes];
    newNodes[index] = { ...newNodes[index], [field]: value };
    setFormData({ ...formData, story_nodes: newNodes });
  };

  const deleteNode = (index) => {
    if (window.confirm("Delete this story node?")) {
      const newNodes = formData.story_nodes.filter((_, i) => i !== index);
      setFormData({ ...formData, story_nodes: newNodes });
    }
  };

  const addChoice = (nodeIndex) => {
    const newNodes = [...formData.story_nodes];
    if (!newNodes[nodeIndex].choices) {
      newNodes[nodeIndex].choices = [];
    }
    newNodes[nodeIndex].choices.push({
      text: "",
      next_node: "",
      points: 5
    });
    setFormData({ ...formData, story_nodes: newNodes });
  };

  const updateChoice = (nodeIndex, choiceIndex, field, value) => {
    const newNodes = [...formData.story_nodes];
    newNodes[nodeIndex].choices[choiceIndex] = {
      ...newNodes[nodeIndex].choices[choiceIndex],
      [field]: value
    };
    setFormData({ ...formData, story_nodes: newNodes });
  };

  const deleteChoice = (nodeIndex, choiceIndex) => {
    const newNodes = [...formData.story_nodes];
    newNodes[nodeIndex].choices = newNodes[nodeIndex].choices.filter((_, i) => i !== choiceIndex);
    setFormData({ ...formData, story_nodes: newNodes });
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Interactive Story Builder</h1>
              <p className="text-gray-600">Create branching narrative stories</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingStory(null);
              resetForm();
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Interactive Story
          </Button>
        </div>

        {/* Story List */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Card key={story.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                    <Badge className="bg-purple-100 text-purple-800">
                      <GitBranch className="w-3 h-3 mr-1" />
                      {story.story_nodes?.length || 0} nodes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {story.description}
                  </p>
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
                      className="text-red-600 border-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Story Builder Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingStory ? "Edit Interactive Story" : "Create New Interactive Story"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="prophets">Prophets</option>
                      <option value="sahabah">Sahabah</option>
                      <option value="manners">Manners</option>
                      <option value="kindness">Kindness</option>
                      <option value="honesty">Honesty</option>
                      <option value="gratitude">Gratitude</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the story"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Moral/Lesson *</label>
                  <Textarea
                    value={formData.moral}
                    onChange={(e) => setFormData({ ...formData, moral: e.target.value })}
                    required
                    rows={2}
                  />
                </div>

                {/* Story Nodes */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Story Nodes</h3>
                    <Button type="button" onClick={addNode} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Node
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.story_nodes.map((node, nodeIndex) => (
                      <Card key={nodeIndex} className="border-2 border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <Badge className="mb-2">Node {nodeIndex + 1}</Badge>
                              <p className="text-xs text-gray-500">ID: {node.id}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNode(nodeIndex)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-semibold mb-1">Character Name</label>
                              <Input
                                value={node.character}
                                onChange={(e) => updateNode(nodeIndex, 'character', e.target.value)}
                                placeholder="e.g., Ahmad (You)"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold mb-1">Content *</label>
                              <Textarea
                                value={node.content}
                                onChange={(e) => updateNode(nodeIndex, 'content', e.target.value)}
                                rows={4}
                                placeholder="Story content (Markdown supported)"
                              />
                            </div>

                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={node.is_ending}
                                  onChange={(e) => updateNode(nodeIndex, 'is_ending', e.target.checked)}
                                />
                                <span className="text-sm font-semibold">Is Ending Node</span>
                              </label>

                              {node.is_ending && (
                                <select
                                  value={node.ending_type}
                                  onChange={(e) => updateNode(nodeIndex, 'ending_type', e.target.value)}
                                  className="border rounded px-2 py-1 text-sm"
                                >
                                  <option value="excellent">Excellent</option>
                                  <option value="great">Great</option>
                                  <option value="good">Good</option>
                                  <option value="bad">Bad</option>
                                </select>
                              )}
                            </div>

                            {/* Choices */}
                            {!node.is_ending && (
                              <div className="border-t pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-sm font-semibold">Choices</label>
                                  <Button
                                    type="button"
                                    onClick={() => addChoice(nodeIndex)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Choice
                                  </Button>
                                </div>

                                {node.choices?.map((choice, choiceIndex) => (
                                  <div key={choiceIndex} className="bg-gray-50 p-3 rounded mb-2">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-xs font-bold">Choice {choiceIndex + 1}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteChoice(nodeIndex, choiceIndex)}
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <Input
                                      value={choice.text}
                                      onChange={(e) => updateChoice(nodeIndex, choiceIndex, 'text', e.target.value)}
                                      placeholder="Choice text"
                                      className="mb-2"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input
                                        value={choice.next_node}
                                        onChange={(e) => updateChoice(nodeIndex, choiceIndex, 'next_node', e.target.value)}
                                        placeholder="Next node ID"
                                      />
                                      <Input
                                        type="number"
                                        value={choice.points}
                                        onChange={(e) => updateChoice(nodeIndex, choiceIndex, 'points', parseInt(e.target.value))}
                                        placeholder="Points"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 justify-end border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    <Save className="w-4 h-4 mr-2" />
                    {editingStory ? "Update Story" : "Create Story"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}