import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Video, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminVideos() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    thumbnail_url: "",
    category: "prophets",
    duration: "",
    filter_tag: "lesson",
    description: ""
  });

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('-created_date'),
    initialData: [],
  });

  const createVideoMutation = useMutation({
    mutationFn: (videoData) => base44.entities.Video.create(videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      resetForm();
      alert('Video added successfully!');
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Video.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      resetForm();
      alert('Video updated successfully!');
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      alert('Video deleted successfully!');
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      video_url: "",
      thumbnail_url: "",
      category: "prophets",
      duration: "",
      filter_tag: "lesson",
      description: ""
    });
    setEditingVideo(null);
    setShowForm(false);
  };

  const handleEdit = (video) => {
    setFormData({
      title: video.title || "",
      video_url: video.video_url || "",
      thumbnail_url: video.thumbnail_url || "",
      category: video.category || "prophets",
      duration: video.duration || "",
      filter_tag: video.filter_tag || "lesson",
      description: video.description || ""
    });
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.video_url) {
      alert('Please fill in title and video URL');
      return;
    }

    // Auto-generate thumbnail if not provided
    let finalData = { ...formData };
    if (!finalData.thumbnail_url && formData.video_url.includes('youtube')) {
      const videoId = getYouTubeId(formData.video_url);
      if (videoId) {
        finalData.thumbnail_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    if (editingVideo) {
      updateVideoMutation.mutate({ id: editingVideo.id, data: finalData });
    } else {
      createVideoMutation.mutate(finalData);
    }
  };

  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Manage Videos
          </h1>
          <p className="text-lg text-gray-600">
            Add and manage YouTube videos for the video library
          </p>
        </motion.div>

        {/* Add Video Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Video
          </Button>
        </div>

        {/* Video Form Modal */}
        <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Story of Prophet Muhammad ﷺ"
                  required
                />
              </div>

              <div>
                <Label htmlFor="video_url">YouTube URL *</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thumbnail will be auto-generated from YouTube
                </p>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prophets">Prophets</SelectItem>
                    <SelectItem value="manners">Manners</SelectItem>
                    <SelectItem value="duas">Duas</SelectItem>
                    <SelectItem value="facts">Islamic Facts</SelectItem>
                    <SelectItem value="series">Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter_tag">Video Length</Label>
                <Select
                  value={formData.filter_tag}
                  onValueChange={(value) => setFormData({ ...formData, filter_tag: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (0-5 min)</SelectItem>
                    <SelectItem value="lesson">Lesson (5-15 min)</SelectItem>
                    <SelectItem value="series">Series (15+ min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 10:25"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the video content..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingVideo ? 'Update' : 'Add'} Video
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Videos List */}
        {isLoading ? (
          <div className="text-center py-12">Loading videos...</div>
        ) : videos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No videos yet. Add your first video!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">
                          {video.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge>{video.category}</Badge>
                          {video.filter_tag && (
                            <Badge variant="outline">{video.filter_tag}</Badge>
                          )}
                          {video.duration && (
                            <Badge variant="outline">{video.duration}</Badge>
                          )}
                        </div>
                        {video.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleEdit(video)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this video?')) {
                              deleteVideoMutation.mutate(video.id);
                            }
                          }}
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500 hover:bg-red-50"
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
        )}
      </div>
    </div>
  );
}