import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Upload, 
  Music, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Plus,
  Headphones,
  Image as ImageIcon,
  Loader2,
  Play,
  Pause
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminAudioContent() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAudio, setEditingAudio] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ audio: false, image: false });
  
  const audioFileRef = useRef(null);
  const imageFileRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    mp3_url: "",
    youtube_id: "",
    cover_image: "",
    description: "",
    transcript: "",
    moral_lesson: "",
    duration: "",
    age_group: "all",
    category: "story",
    subcategory: "",
    language: "English",
    tags: [],
    license_source: "",
    allow_download: false,
    featured: false
  });

  const { data: audioContent = [], isLoading } = useQuery({
    queryKey: ['audio-content'],
    queryFn: () => base44.entities.AudioContent.list('-created_date'),
    initialData: [],
  });

  const createAudioMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-content'] });
      setShowCreateDialog(false);
      resetForm();
      alert('Audio content created successfully!');
    },
    onError: (error) => {
      console.error("Error creating audio:", error);
      alert('Failed to create audio content. Please try again.');
    }
  });

  const updateAudioMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AudioContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-content'] });
      setShowEditDialog(false);
      setEditingAudio(null);
      resetForm();
      alert('Audio content updated successfully!');
    },
    onError: (error) => {
      console.error("Error updating audio:", error);
      alert('Failed to update audio content. Please try again.');
    }
  });

  const deleteAudioMutation = useMutation({
    mutationFn: (id) => base44.entities.AudioContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-content'] });
      alert('Audio content deleted successfully!');
    },
    onError: (error) => {
      console.error("Error deleting audio:", error);
      alert('Failed to delete audio content. Please try again.');
    }
  });

  const handleAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file (MP3, WAV, etc.)');
      return;
    }

    setUploadProgress({ ...uploadProgress, audio: true });
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, mp3_url: result.file_url });
      alert('Audio file uploaded successfully!');
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert('Failed to upload audio file. Please try again.');
    } finally {
      setUploadProgress({ ...uploadProgress, audio: false });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadProgress({ ...uploadProgress, image: true });
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_image: result.file_url });
      alert('Cover image uploaded successfully!');
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadProgress({ ...uploadProgress, image: false });
    }
  };

  const handleCreate = () => {
    if (!formData.title || !formData.category) {
      alert('Please fill in at least the title and category');
      return;
    }

    // Generate slug from title if not provided
    if (!formData.slug) {
      formData.slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    // Convert tags string to array
    if (typeof formData.tags === 'string') {
      formData.tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    }

    createAudioMutation.mutate(formData);
  };

  const handleEdit = (audio) => {
    setEditingAudio(audio);
    setFormData({
      title: audio.title || "",
      slug: audio.slug || "",
      mp3_url: audio.mp3_url || "",
      youtube_id: audio.youtube_id || "",
      cover_image: audio.cover_image || "",
      description: audio.description || "",
      transcript: audio.transcript || "",
      moral_lesson: audio.moral_lesson || "",
      duration: audio.duration || "",
      age_group: audio.age_group || "all",
      category: audio.category || "story",
      subcategory: audio.subcategory || "",
      language: audio.language || "English",
      tags: audio.tags || [],
      license_source: audio.license_source || "",
      allow_download: audio.allow_download || false,
      featured: audio.featured || false
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!editingAudio) return;

    // Convert tags string to array if needed
    if (typeof formData.tags === 'string') {
      formData.tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    }

    updateAudioMutation.mutate({
      id: editingAudio.id,
      data: formData
    });
  };

  const handleDelete = (audio) => {
    if (confirm(`Are you sure you want to delete "${audio.title}"? This action cannot be undone.`)) {
      deleteAudioMutation.mutate(audio.id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      mp3_url: "",
      youtube_id: "",
      cover_image: "",
      description: "",
      transcript: "",
      moral_lesson: "",
      duration: "",
      age_group: "all",
      category: "story",
      subcategory: "",
      language: "English",
      tags: [],
      license_source: "",
      allow_download: false,
      featured: false
    });
    setEditingAudio(null);
  };

  const categoryColors = {
    story: "bg-blue-100 text-blue-800",
    hadith: "bg-green-100 text-green-800",
    history: "bg-purple-100 text-purple-800",
    nasheed: "bg-pink-100 text-pink-800",
    tajweed: "bg-amber-100 text-amber-800",
    fiqh: "bg-indigo-100 text-indigo-800",
    quran: "bg-emerald-100 text-emerald-800"
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Audio Content Management
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Upload and manage Islamic audio stories, lessons, and nasheeds
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Audio
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{audioContent.length}</div>
              <div className="text-sm text-gray-600">Total Audio</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {audioContent.filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-600">
                {audioContent.filter(a => a.featured).length}
              </div>
              <div className="text-sm text-gray-600">Featured</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {audioContent.reduce((sum, a) => sum + (a.plays_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Plays</div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Content List */}
        {isLoading ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-pulse" />
            <p className="text-gray-500">Loading audio content...</p>
          </div>
        ) : audioContent.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Headphones className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No audio content yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Audio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {audioContent.map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Cover Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {audio.cover_image ? (
                          <img
                            src={audio.cover_image}
                            alt={audio.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Audio Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900 truncate pr-4">
                            {audio.title}
                          </h3>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={() => handleEdit(audio)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(audio)}
                              size="sm"
                              variant="outline"
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {audio.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {audio.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={categoryColors[audio.category]}>
                            {audio.category}
                          </Badge>
                          {audio.subcategory && (
                            <Badge variant="outline">{audio.subcategory}</Badge>
                          )}
                          {audio.duration && (
                            <Badge variant="outline">{audio.duration}</Badge>
                          )}
                          {audio.age_group && (
                            <Badge variant="outline">Ages: {audio.age_group}</Badge>
                          )}
                          {audio.featured && (
                            <Badge className="bg-amber-500">⭐ Featured</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {audio.mp3_url && (
                            <span className="flex items-center gap-1">
                              <Headphones className="w-3 h-3" />
                              Audio uploaded
                            </span>
                          )}
                          {audio.plays_count > 0 && (
                            <span>{audio.plays_count} plays</span>
                          )}
                          <span>{audio.language || 'English'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Audio Content</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Story of Prophet Ibrahim"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="hadith">Hadith</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="nasheed">Nasheed</SelectItem>
                      <SelectItem value="tajweed">Tajweed</SelectItem>
                      <SelectItem value="fiqh">Fiqh</SelectItem>
                      <SelectItem value="quran">Quran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="age_group">Age Group</Label>
                  <Select
                    value={formData.age_group}
                    onValueChange={(value) => setFormData({ ...formData, age_group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-6">3-6 years</SelectItem>
                      <SelectItem value="7-10">7-10 years</SelectItem>
                      <SelectItem value="11+">11+ years</SelectItem>
                      <SelectItem value="all">All ages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Audio Upload */}
              <div>
                <Label>Audio File (MP3)</Label>
                <input
                  ref={audioFileRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    onClick={() => audioFileRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    disabled={uploadProgress.audio}
                  >
                    {uploadProgress.audio ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Audio File
                      </>
                    )}
                  </Button>
                  {formData.mp3_url && (
                    <Badge className="bg-green-500 px-4 py-2">✓ Uploaded</Badge>
                  )}
                </div>
                {formData.mp3_url && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{formData.mp3_url}</p>
                )}
              </div>

              {/* Cover Image Upload */}
              <div>
                <Label>Cover Image</Label>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    onClick={() => imageFileRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    disabled={uploadProgress.image}
                  >
                    {uploadProgress.image ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload Cover Image
                      </>
                    )}
                  </Button>
                  {formData.cover_image && (
                    <Badge className="bg-green-500 px-4 py-2">✓ Uploaded</Badge>
                  )}
                </div>
                {formData.cover_image && (
                  <div className="mt-2">
                    <img
                      src={formData.cover_image}
                      alt="Cover preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g., Prophets, Sahabah"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 05:30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the audio content"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="moral_lesson">Moral Lesson</Label>
                <Textarea
                  id="moral_lesson"
                  value={formData.moral_lesson}
                  onChange={(e) => setFormData({ ...formData, moral_lesson: e.target.value })}
                  placeholder="Key lesson or takeaway"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., prophets, kindness, patience"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_download}
                    onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Allow Download</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreate}
                  disabled={createAudioMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Audio
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - Similar structure to Create Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Audio Content</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Same form fields as Create Dialog */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Story of Prophet Ibrahim"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="hadith">Hadith</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="nasheed">Nasheed</SelectItem>
                      <SelectItem value="tajweed">Tajweed</SelectItem>
                      <SelectItem value="fiqh">Fiqh</SelectItem>
                      <SelectItem value="quran">Quran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-age">Age Group</Label>
                  <Select
                    value={formData.age_group}
                    onValueChange={(value) => setFormData({ ...formData, age_group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-6">3-6 years</SelectItem>
                      <SelectItem value="7-10">7-10 years</SelectItem>
                      <SelectItem value="11+">11+ years</SelectItem>
                      <SelectItem value="all">All ages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Audio Upload */}
              <div>
                <Label>Audio File (MP3)</Label>
                <input
                  ref={audioFileRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    onClick={() => audioFileRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    disabled={uploadProgress.audio}
                  >
                    {uploadProgress.audio ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.mp3_url ? 'Replace Audio' : 'Upload Audio File'}
                      </>
                    )}
                  </Button>
                  {formData.mp3_url && (
                    <Badge className="bg-green-500 px-4 py-2">✓ Uploaded</Badge>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <Label>Cover Image</Label>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    onClick={() => imageFileRef.current?.click()}
                    variant="outline"
                    className="flex-1"
                    disabled={uploadProgress.image}
                  >
                    {uploadProgress.image ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {formData.cover_image ? 'Replace Image' : 'Upload Cover Image'}
                      </>
                    )}
                  </Button>
                  {formData.cover_image && (
                    <Badge className="bg-green-500 px-4 py-2">✓ Uploaded</Badge>
                  )}
                </div>
                {formData.cover_image && (
                  <div className="mt-2">
                    <img
                      src={formData.cover_image}
                      alt="Cover preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-subcategory">Subcategory</Label>
                  <Input
                    id="edit-subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g., Prophets, Sahabah"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 05:30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the audio content"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-moral">Moral Lesson</Label>
                <Textarea
                  id="edit-moral"
                  value={formData.moral_lesson}
                  onChange={(e) => setFormData({ ...formData, moral_lesson: e.target.value })}
                  placeholder="Key lesson or takeaway"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., prophets, kindness, patience"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_download}
                    onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Allow Download</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdate}
                  disabled={updateAudioMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Audio
                </Button>
                <Button
                  onClick={() => {
                    setShowEditDialog(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}