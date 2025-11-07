import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, Square, Play, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function RecordingStudio() {
  const [user, setUser] = useState(null);
  const [recording, setRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pageText, setPageText] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadUser();
    loadPageText();
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
      setUser(null);
    }
  };

  const loadPageText = () => {
    try {
      const raw = localStorage.getItem("siteSettings");
      if (raw) {
        const settings = JSON.parse(raw);
        setPageText(settings?.recordingStudioText || "Welcome to Islam Media Central Recording Studio. Please record Quran recitation, nasheeds, or Islamic messages with clarity and respect.");
      } else {
        setPageText("Welcome to Islam Media Central Recording Studio. Please record Quran recitation, nasheeds, or Islamic messages with clarity and respect.");
      }
    } catch {
      setPageText("Welcome to Islam Media Central Recording Studio. Please record Quran recitation, nasheeds, or Islamic messages with clarity and respect.");
    }
  };

  const startRecording = async () => {
    try {
      setPermissionDenied(false);
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
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      startTimeRef.current = Date.now();
      mediaRecorder.start();
      setRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      if (error?.name === "NotAllowedError") {
        setPermissionDenied(true);
      }
      toast.error("Could not access microphone. Please enable permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      toast.success("Recording stopped");
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    chunksRef.current = [];
  };

  const submitRecording = async () => {
    if (!audioBlob) {
      toast.error("Please record audio first");
      return;
    }
    if (!user) {
      toast.error("Please log in to submit your recording");
      return;
    }

    setSubmitting(true);
    try {
      const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const rec = await base44.entities.Recording.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_email: user.email,
        recording_type: "studio",
        file_url,
        duration,
        status: "pending",
      });

      let supportEmail = "imedia786@gmail.com";
      try {
        const raw = localStorage.getItem("siteSettings");
        if (raw) {
          const settings = JSON.parse(raw);
          if (settings?.supportEmail) supportEmail = settings.supportEmail;
        }
      } catch {}

      await base44.integrations.Core.SendEmail({
        from_name: "Islam Media Central",
        to: supportEmail,
        subject: "🎤 New Recording Submission",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
            <div style="padding: 24px; background: linear-gradient(135deg, #2563EB 0%, #60A5FA 100%); color: white;">
              <h2 style="margin: 0;">Islam Media Central Recording Studio</h2>
            </div>
            <div style="padding: 24px;">
              <p><strong>User:</strong> ${user.full_name || user.email}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Duration:</strong> ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")} minutes</p>
              <p><strong>Recording ID:</strong> ${rec.id}</p>
              <div style="margin: 16px 0; padding: 12px; background: #EFF6FF; border-left: 4px solid #2563EB;">
                <a href="${file_url}" style="display:inline-block;padding:10px 16px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Download & Listen</a>
                <p style="margin-top:8px;font-size:12px;color:#6B7280">Direct link: ${file_url}</p>
              </div>
            </div>
          </div>
        `,
      });

      setSubmitted(true);
      toast.success("Recording submitted successfully");
      setTimeout(() => {
        resetRecording();
        setSubmitted(false);
      }, 2500);
    } catch (error) {
      console.error("Error submitting recording:", error);
      toast.error("Failed to submit recording");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-2">🎙️</div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Islam Media Central Recording Studio</h1>
          <p className="text-blue-700">Record directly in your browser and submit with one click.</p>
        </motion.div>

        {/* Top instructions text block */}
        <Card className="mb-6 border-blue-200">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle>Instructions & Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="prose max-w-none">
              <p className="text-gray-800 whitespace-pre-line">{pageText}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recording UI */}
        <Card className="shadow-md border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <CardTitle className="flex items-center gap-2"><Mic className="w-5 h-5" /> Recording Controls</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {permissionDenied && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700">
                Microphone access denied. Please enable permissions in your browser settings.
              </div>
            )}

            {!user ? (
              <div className="p-4 rounded bg-yellow-50 text-yellow-800 mb-4">
                Please log in to submit recordings.
              </div>
            ) : null}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={startRecording} disabled={recording} className="bg-blue-600 hover:bg-blue-700">
                <Mic className="w-4 h-4 mr-2" /> Start
              </Button>
              <Button onClick={stopRecording} disabled={!recording} variant="outline" className="border-blue-600 text-blue-600">
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
              <Button onClick={playRecording} disabled={!audioUrl} variant="outline" className="border-blue-600 text-blue-600">
                <Play className="w-4 h-4 mr-2" /> Play
              </Button>
              <Button onClick={submitRecording} disabled={!audioBlob || submitting || !user} className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" /> {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>

            <div className="mt-4">
              <audio ref={audioRef} src={audioUrl || undefined} controls className="w-full" />
            </div>

            {submitted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded bg-green-50 text-green-700">
                Alhamdulillah! Your recording has been submitted.
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

