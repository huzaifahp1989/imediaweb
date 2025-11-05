
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Mic, Square, Play, Pause, Upload, Star, Award, Music, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RecordAndShare() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingType, setRecordingType] = useState("quran");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (audioUrl && audioElement) {
      audioElement.pause();
    }
    
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  }, [audioUrl, audioElement]); // Added audioElement to dependency array

  const loadUser = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        toast.error("Please log in to record and share");
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
      toast.error("Failed to load user data."); // Added error toast
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);

      toast.success("Recording started! 🎙️");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      toast.success("Recording stopped!");
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob || !user) {
      toast.error("Please record something first and make sure you're logged in");
      return;
    }

    setUploading(true);

    try {
      // Convert blob to file
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      // Upload to base44
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Save recording metadata
      await base44.entities.Recording.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_email: user.email,
        recording_type: recordingType,
        file_url: file_url,
        duration: Math.floor(recordingTime),
        status: "pending",
      });

      // Award 10 points to the user
      const currentPoints = user.points || 0;
      await base44.auth.updateMe({
        points: currentPoints + 10
      });

      // Update local user state
      setUser({ ...user, points: currentPoints + 10 });

      // Reset recording state
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      // Ensure audio playback is stopped and element is reset
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
        setIsPlaying(false);
      }

      toast.success("🎉 Recording submitted! You earned 10 points!", {
        duration: 5000,
        description: "Your recording will be reviewed by our team. Keep up the great work!"
      });

      // Send notification email to admin
      try {
        await base44.integrations.Core.SendEmail({
          from_name: "Islam Kids Zone",
          to: "huzaify786@gmail.com",
          subject: "🎙️ New Audio Recording Submitted",
          body: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
              <h2 style="color: #3B82F6;">🎙️ New Recording Submitted!</h2>
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p><strong>👤 Submitted by:</strong> ${user.full_name || user.email}</p>
                <p><strong>📧 Email:</strong> ${user.email}</p>
                <p><strong>🎵 Type:</strong> ${recordingType}</p>
                <p><strong>⏱️ Duration:</strong> ${Math.floor(recordingTime / 60)}:${String(recordingTime % 60).padStart(2, '0')}</p>
                <p><strong>🔗 File URL:</strong> <a href="${file_url}">${file_url}</a></p>
                <p><strong>⭐ Points Awarded:</strong> 10 points</p>
                <p><strong>📅 Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Please review this recording in the admin dashboard.
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
        toast.warning("Notification email to admin failed, but recording was submitted."); // Added toast for email error
      }

    } catch (error) {
      console.error("Error uploading recording:", error);
      toast.error("Failed to upload recording. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Mic className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please email us to enable recording and sharing features.
            </p>
            <Button onClick={() => {
              const subject = encodeURIComponent("Access Request - Record & Share");
              const body = encodeURIComponent("Hi, I'd like to enable recording features on Islam Kids Zone. My name is ____ and my contact details are ____.");
              window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
            }}>
              Email Us
            </Button>
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
          <div className="text-6xl mb-4">🎙️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Record & Share
          </h1>
          <p className="text-lg text-gray-600">
            Share your beautiful Quran recitation, nasheed, or Islamic story
          </p>
        </motion.div>

        {/* Points Reward Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="border-4 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
                    <span>Earn 10 Points!</span>
                  </h3>
                  <p className="text-gray-700 font-medium">
                    Submit a recording and earn <strong>10 points</strong> instantly! Your recordings help inspire other kids.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Points Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Current Points</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {user.points || 0} points
                  </p>
                </div>
                <Star className="w-12 h-12 text-amber-500 fill-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recording Type Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What would you like to record?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setRecordingType("quran")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  recordingType === "quran"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-bold text-gray-900 mb-1">Quran Recitation</h3>
                <p className="text-sm text-gray-600">Recite verses from the Quran</p>
              </button>

              <button
                onClick={() => setRecordingType("nasheed")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  recordingType === "nasheed"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <Music className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-bold text-gray-900 mb-1">Nasheed</h3>
                <p className="text-sm text-gray-600">Sing an Islamic nasheed</p>
              </button>

              <button
                onClick={() => setRecordingType("story")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  recordingType === "story"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-bold text-gray-900 mb-1">Islamic Story</h3>
                <p className="text-sm text-gray-600">Tell an Islamic story</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recording Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recording Studio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              {/* Timer Display */}
              {(isRecording || audioBlob) && (
                <div className="text-4xl font-mono font-bold text-gray-900">
                  {formatTime(recordingTime)}
                </div>
              )}

              {/* Recording Button */}
              {!audioBlob && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  }`}
                  aria-label={isRecording ? "Stop Recording" : "Start Recording"} // Added aria-label
                >
                  {isRecording ? (
                    <Square className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </motion.button>
              )}

              {isRecording && (
                <p className="text-red-500 font-semibold animate-pulse">
                  🔴 Recording in progress...
                </p>
              )}

              {/* Playback Controls */}
              {audioBlob && (
                <div className="space-y-4">
                  <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                    Recording Complete! ✅
                  </Badge>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={togglePlayback}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                      aria-label={isPlaying ? "Pause Recording" : "Play Recording"} // Added aria-label
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Play
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                        setRecordingTime(0);
                        if (audioElement) {
                          audioElement.pause();
                          setAudioElement(null); // Reset audio element
                          setIsPlaying(false);
                        }
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Record Again
                    </Button>
                  </div>

                  <Button
                    onClick={uploadRecording}
                    disabled={uploading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-lg py-6"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Submit & Earn 10 Points! ⭐
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle>Recording Tips 💡</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Find a quiet place with no background noise</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Speak clearly and at a comfortable pace</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Hold your device about 6 inches from your mouth</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Take your time and do your best - it&apos;s okay to record again!</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 font-bold">5.</span>
                <span>Submit your recording and earn <strong>10 points</strong> automatically! 🌟</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

