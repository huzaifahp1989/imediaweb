import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play, Trash2, Upload, CheckCircle2, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Audio() {
  const [user, setUser] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingType, setRecordingType] = useState("quran");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (authenticated) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("User not authenticated");
      setUser(null);
    }
  };

  const { data: featuredAudio = [] } = useQuery({
    queryKey: ['featuredAudio'],
    queryFn: async () => {
      const all = await base44.entities.AudioContent.list('-plays_count', 6);
      return all.filter(a => a.featured && a.status === 'active');
    },
    initialData: [],
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      startTimeRef.current = Date.now();
      mediaRecorder.start();
      setRecording(true);
      toast.success("Recording started!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      toast.success("Recording stopped!");
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    chunksRef.current = [];
  };

  const submitRecording = async () => {
    if (!audioBlob || !user) {
      toast.error("Please record audio first");
      return;
    }

    setSubmitting(true);

    try {
      const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      
      // Upload the audio file
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Save to database
      const recording = await base44.entities.Recording.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_email: user.email,
        recording_type: recordingType,
        file_url: file_url,
        duration: duration,
        status: "pending"
      });

      // Send email notification with recording details
      await base44.integrations.Core.SendEmail({
        from_name: "Islam Kids Zone",
        to: "huzaify786@gmail.com",
        subject: `🎤 New ${recordingType.charAt(0).toUpperCase() + recordingType.slice(1)} Recording Submission`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎤 New Audio Recording</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; margin-top: 2px;">
              <h2 style="color: #3B82F6; margin-top: 0;">Recording Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4B5563;">Type:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2937;">${recordingType.charAt(0).toUpperCase() + recordingType.slice(1)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4B5563;">User Name:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2937;">${user.full_name || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4B5563;">Email:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2937;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4B5563;">Duration:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2937;">${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')} minutes</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #4B5563;">Submitted:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1F2937;">${new Date().toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; color: #4B5563;">Recording ID:</td>
                  <td style="padding: 12px; color: #1F2937;">${recording.id}</td>
                </tr>
              </table>

              <div style="margin: 30px 0; padding: 20px; background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 5px;">
                <h3 style="margin-top: 0; color: #1E40AF;">📎 Audio File</h3>
                <p style="margin: 10px 0;">
                  <a href="${file_url}" 
                     style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    🎧 Download & Listen to Recording
                  </a>
                </p>
                <p style="margin: 10px 0; font-size: 12px; color: #6B7280;">
                  Direct link: <a href="${file_url}" style="color: #3B82F6; word-break: break-all;">${file_url}</a>
                </p>
              </div>

              <div style="margin-top: 30px; padding: 20px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 5px;">
                <h3 style="margin-top: 0; color: #92400E;">⚡ Action Required</h3>
                <p style="margin: 5px 0; color: #78350F;">Please review this recording and update its status in the admin panel:</p>
                <ul style="color: #78350F; margin: 10px 0;">
                  <li><strong>Approve</strong> - Make it visible to all users</li>
                  <li><strong>Feature</strong> - Highlight it on the homepage</li>
                  <li><strong>Reject</strong> - Remove if inappropriate</li>
                </ul>
              </div>
            </div>

            <div style="margin-top: 20px; padding: 20px; text-align: center; color: #6B7280; font-size: 12px;">
              <p style="margin: 5px 0;">This is an automated notification from <strong>Islam Kids Zone</strong></p>
              <p style="margin: 5px 0;">Part of Islam Media Central - www.imediac.com</p>
            </div>
          </div>
        `
      });

      setSubmitted(true);
      toast.success("Recording submitted successfully!");
      
      setTimeout(() => {
        deleteRecording();
        setSubmitted(false);
        setRecordingType("quran");
      }, 3000);
    } catch (error) {
      console.error("Error submitting recording:", error);
      toast.error("Failed to submit recording. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Please log in to record and submit audio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Record & Share Your Voice
          </h1>
          <p className="text-lg text-gray-600">
            Record your Quran recitation, nasheeds, or stories and share with the community!
          </p>
        </motion.div>

        {/* Recording Studio */}
        <Card className="mb-8 shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="text-2xl">🎙️ Recording Studio</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Masha'Allah!</h3>
                <p className="text-gray-600">Your recording has been submitted for review.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="recordingType" className="text-lg font-semibold mb-2 block">
                    What would you like to record?
                  </Label>
                  <select
                    id="recordingType"
                    value={recordingType}
                    onChange={(e) => setRecordingType(e.target.value)}
                    disabled={recording || audioBlob}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="quran">Quran Recitation</option>
                    <option value="nasheed">Nasheed</option>
                    <option value="story">Story</option>
                  </select>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {!audioBlob && !recording && (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="bg-red-500 hover:bg-red-600 text-white w-full md:w-auto"
                    >
                      <Mic className="w-6 h-6 mr-2" />
                      Start Recording
                    </Button>
                  )}

                  {recording && (
                    <div className="text-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-20 h-20 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                      >
                        <Mic className="w-10 h-10 text-white" />
                      </motion.div>
                      <p className="text-lg font-semibold text-red-500 mb-4">Recording...</p>
                      <Button
                        onClick={stopRecording}
                        size="lg"
                        variant="outline"
                        className="border-2 border-red-500 text-red-500"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop Recording
                      </Button>
                    </div>
                  )}

                  {audioBlob && audioUrl && !recording && (
                    <div className="w-full space-y-4">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-semibold mb-3">✓ Recording Complete!</p>
                        <audio src={audioUrl} controls className="w-full mb-3" />
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            onClick={submitRecording}
                            disabled={submitting}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {submitting ? "Submitting..." : "Submit Recording"}
                          </Button>
                          <Button
                            onClick={deleteRecording}
                            variant="outline"
                            className="border-2 border-red-500 text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Audio */}
        {featuredAudio.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Headphones className="w-6 h-6 text-purple-600" />
              Featured Audio
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAudio.map((audio) => (
                <Card key={audio.id} className="hover:shadow-xl transition-shadow">
                  {audio.cover_image && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={audio.cover_image}
                        alt={audio.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{audio.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{audio.description}</p>
                    <div className="flex gap-2 mb-3">
                      <Badge className="text-xs">{audio.duration}</Badge>
                      <Badge variant="outline" className="text-xs">{audio.category}</Badge>
                    </div>
                    {audio.mp3_url && (
                      <audio src={audio.mp3_url} controls className="w-full" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}