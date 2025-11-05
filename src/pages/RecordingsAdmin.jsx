import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Play, Pause, CheckCircle, XCircle, Star, Mic, Calendar, User, Clock, Download } from "lucide-react";

export default function RecordingsAdmin() {
  const [playingId, setPlayingId] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [pointsToAward, setPointsToAward] = useState(50);
  
  const queryClient = useQueryClient();

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ['recordings'],
    queryFn: () => base44.entities.Recording.list('-created_date'),
    initialData: [],
  });

  const updateRecordingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Recording.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      setSelectedRecording(null);
    },
  });

  const handleApprove = async (recording) => {
    try {
      // Update recording status
      await updateRecordingMutation.mutateAsync({
        id: recording.id,
        data: {
          status: "approved",
          admin_notes: adminNotes,
          points_awarded: pointsToAward
        }
      });

      // Award points to user
      const user = await base44.entities.User.list();
      const targetUser = user.find(u => u.id === recording.user_id);
      
      if (targetUser) {
        await base44.auth.updateMe({
          points: (targetUser.points || 0) + pointsToAward
        });
      }

      // Send email to user
      await base44.integrations.Core.SendEmail({
        from_name: "Islam Kids Zone",
        to: recording.user_email,
        subject: "🎉 Your Recording Has Been Approved!",
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
            <h2 style="color: #10B981;">🎊 Masha'Allah! Your Recording is Approved!</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p>Assalamu Alaikum <strong>${recording.user_name}</strong>,</p>
              <p>Great news! Your ${recording.recording_type} recording has been approved and featured on our website!</p>
              <p><strong>🌟 You've earned ${pointsToAward} points!</strong></p>
              ${adminNotes ? `<p><strong>📝 Feedback:</strong> ${adminNotes}</p>` : ''}
              <p>Keep up the amazing work! We can't wait to hear more from you.</p>
              <p style="margin-top: 20px;">Jazakallahu Khayran,<br>Islam Kids Zone Team</p>
            </div>
          </div>
        `
      });

      alert("Recording approved and user notified!");
    } catch (error) {
      console.error("Error approving recording:", error);
      alert("Error approving recording");
    }
  };

  const handleReject = async (recording) => {
    try {
      await updateRecordingMutation.mutateAsync({
        id: recording.id,
        data: {
          status: "rejected",
          admin_notes: adminNotes
        }
      });

      // Send email to user
      if (recording.user_email) {
        await base44.integrations.Core.SendEmail({
          from_name: "Islam Kids Zone",
          to: recording.user_email,
          subject: "📝 Update on Your Recording Submission",
          body: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
              <h2 style="color: #3B82F6;">Update on Your Recording</h2>
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p>Assalamu Alaikum <strong>${recording.user_name}</strong>,</p>
                <p>Thank you for submitting your ${recording.recording_type} recording!</p>
                ${adminNotes ? `<p><strong>📝 Feedback:</strong> ${adminNotes}</p>` : ''}
                <p>Don't be discouraged! Please feel free to submit another recording. We're here to help you improve!</p>
                <p style="margin-top: 20px;">Jazakallahu Khayran,<br>Islam Kids Zone Team</p>
              </div>
            </div>
          `
        });
      }

      alert("Recording rejected and user notified!");
    } catch (error) {
      console.error("Error rejecting recording:", error);
      alert("Error rejecting recording");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    featured: "bg-purple-100 text-purple-800",
    rejected: "bg-red-100 text-red-800"
  };

  const typeIcons = {
    quran: "📖",
    nasheed: "🎵",
    story: "📚"
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">🎙️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Recording Submissions
          </h1>
          <p className="text-lg text-gray-600">
            Review and manage student recordings
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-2xl font-bold text-gray-900">{recordings.length}</div>
              <div className="text-sm text-gray-500">Total Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-yellow-600">
                {recordings.filter(r => r.status === "pending").length}
              </div>
              <div className="text-sm text-gray-500">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">
                {recordings.filter(r => r.status === "approved" || r.status === "featured").length}
              </div>
              <div className="text-sm text-gray-500">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-purple-600">
                {recordings.filter(r => r.status === "featured").length}
              </div>
              <div className="text-sm text-gray-500">Featured</div>
            </CardContent>
          </Card>
        </div>

        {/* Recordings List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading recordings...</div>
        ) : recordings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mic className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No recordings submitted yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recordings.map((recording, index) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-5xl">{typeIcons[recording.recording_type]}</div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {recording.recording_type.charAt(0).toUpperCase() + recording.recording_type.slice(1)} Recording
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {recording.user_name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(recording.duration)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(recording.created_date)}
                              </div>
                            </div>
                          </div>
                          <Badge className={statusColors[recording.status]}>
                            {recording.status}
                          </Badge>
                        </div>

                        {/* Audio Player */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <audio
                            controls
                            src={recording.file_url}
                            className="w-full"
                          />
                        </div>

                        {/* Download Link */}
                        <div className="mb-3">
                          <a
                            href={recording.file_url}
                            download
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Recording
                          </a>
                        </div>

                        {/* Admin Notes if exists */}
                        {recording.admin_notes && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
                            <p className="text-sm text-blue-900">
                              <strong>Admin Notes:</strong> {recording.admin_notes}
                            </p>
                          </div>
                        )}

                        {/* Actions for Pending */}
                        {recording.status === "pending" && (
                          <div className="space-y-3">
                            {selectedRecording?.id === recording.id ? (
                              <div className="space-y-3 border-t pt-3">
                                <Textarea
                                  placeholder="Add feedback or notes..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  className="min-h-[80px]"
                                />
                                <div className="flex items-center gap-2">
                                  <label className="text-sm font-medium">Points to Award:</label>
                                  <Input
                                    type="number"
                                    value={pointsToAward}
                                    onChange={(e) => setPointsToAward(parseInt(e.target.value) || 0)}
                                    className="w-24"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApprove(recording)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve & Award Points
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(recording)}
                                    variant="destructive"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedRecording(null);
                                      setAdminNotes("");
                                      setPointsToAward(50);
                                    }}
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setSelectedRecording(recording)}
                                variant="outline"
                                className="w-full"
                              >
                                Review & Take Action
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Points Awarded Display */}
                        {recording.points_awarded > 0 && (
                          <div className="flex items-center gap-2 text-amber-600 font-semibold">
                            <Star className="w-5 h-5 fill-amber-500" />
                            {recording.points_awarded} points awarded
                          </div>
                        )}
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