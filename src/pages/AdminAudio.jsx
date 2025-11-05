import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Upload, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAudio() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    mp3_url: "",
    cover_image: "",
    description: "",
    transcript: "",
    moral_lesson: "",
    duration: "",
    age_group: "all",
    category: "story",
    subcategory: "",
    language: "English",
    allow_download: false,
    featured: false
  });

  const queryClient = useQueryClient();

  const { data: audioContent = [], isLoading } = useQuery({
    queryKey: ['admin-audio'],
    queryFn: () => base44.entities.AudioContent.list('-created_date'),
    initialData: [],
  });

  const createAudioMutation = useMutation({
    mutationFn: (data) => base44.entities.AudioContent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audio'] });
      setIsDialogOpen(false);
      resetForm();
    }
  });

  const updateAudioMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AudioContent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audio'] });
      setIsDialogOpen(false);
      resetForm();
    }
  });

  const deleteAudioMutation = useMutation({
    mutationFn: (id) => base44.entities.AudioContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-audio'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      mp3_url: "",
      cover_image: "",
      description: "",
      transcript: "",
      moral_lesson: "",
      duration: "",
      age_group: "all",
      category: "story",
      subcategory: "",
      language: "English",
      allow_download: false,
      featured: false
    });
    setEditingAudio(null);
  };

  const handleEdit = (audio) => {
    setEditingAudio(audio);
    setFormData({
      title: audio.title || "",
      mp3_url: audio.mp3_url || "",
      cover_image: audio.cover_image || "",
      description: audio.description || "",
      transcript: audio.transcript || "",
      moral_lesson: audio.moral_lesson || "",
      duration: audio.duration || "",
      age_group: audio.age_group || "all",
      category: audio.category || "story",
      subcategory: audio.subcategory || "",
      language: audio.language || "English",
      allow_download: audio.allow_download || false,
      featured: audio.featured || false
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAudio) {
      updateAudioMutation.mutate({ id: editingAudio.id, data: formData });
    } else {
      createAudioMutation.mutate(formData);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [field]: file_url });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Audio Content Management</h1>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Audio
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center py-12 text-gray-500">Loading audio content...</p>
        ) : (
          <div className="grid gap-6">
            {audioContent.map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 flex-1">
                        {audio.cover_image && (
                          <img
                            src={audio.cover_image}
                            alt={audio.title}
                            className="w-20 h-20 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{audio.title}</CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{audio.category}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{audio.age_group}</span>
                            {audio.duration && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{audio.duration}</span>
                            )}
                            {audio.featured && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">⭐ Featured</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {audio.mp3_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(audio.mp3_url, '_blank')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(audio)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this audio?")) {
                              deleteAudioMutation.mutate(audio.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {audio.description && (
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-2">{audio.description}</p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAudio ? "Edit Audio" : "Add New Audio"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (MM:SS)</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="05:30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="all">All Ages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="mp3">Audio File (MP3) *</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      id="mp3"
                      value={formData.mp3_url}
                      onChange={(e) => setFormData({ ...formData, mp3_url: e.target.value })}
                      placeholder="MP3 URL or upload below"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('mp3-upload').click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <input
                    id="mp3-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'mp3_url')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cover">Cover Image</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      id="cover"
                      value={formData.cover_image}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                      placeholder="Image URL or upload below"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('cover-upload').click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'cover_image')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="transcript">Transcript</Label>
                <Textarea
                  id="transcript"
                  value={formData.transcript}
                  onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                  rows={6}
                  placeholder="Full text transcript of the audio..."
                />
              </div>

              <div>
                <Label htmlFor="moral">Moral Lesson</Label>
                <Textarea
                  id="moral"
                  value={formData.moral_lesson}
                  onChange={(e) => setFormData({ ...formData, moral_lesson: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="featured" className="cursor-pointer">Featured Content</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allow_download"
                    checked={formData.allow_download}
                    onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="allow_download" className="cursor-pointer">Allow Downloads</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAudioMutation.isPending || updateAudioMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {editingAudio ? "Update Audio" : "Create Audio"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}