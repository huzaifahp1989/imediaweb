import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mic, Square, Play, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function KidsRecordingStudio() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [parentConsent, setParentConsent] = useState(false);
  const [category, setCategory] = useState("quran");
  const [notes, setNotes] = useState("");

  const [recording, setRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

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

      mediaRecorder.start();
      setRecording(true);
      toast.success("Recording started");
    } catch (error) {
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

  const validate = () => {
    const a = Number(age || 0);
    if (!fullName || !a || !category) {
      toast.error("Please fill in all required fields");
      return false;
    }
    if (a < 13 && !parentConsent) {
      toast.error("Parent consent is required for under 13");
      return false;
    }
    if (!audioBlob) {
      toast.error("Please record audio first");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const file = new File([audioBlob], `kids-recording-${Date.now()}.webm`, { type: "audio/webm" });
      let fileUrl = "";
      const { base44 } = await import("@/api/base44Client");
      const up = await base44.integrations.Core.UploadFile({ file });
      fileUrl = up.file_url || "";
      if (!fileUrl) {
        toast.error("Upload failed");
        setSubmitting(false);
        return;
      }
      await base44.integrations.Core.SendEmail({
        from_name: "Kids Recording Studio",
        to: "imediac786@gmail.com",
        subject: "New Kids Recording Submission",
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
            <h2 style="color:#0ea5e9; margin:0 0 12px;">New Kids Recording Submission</h2>
            <table style="width:100%; background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:16px;">
              <tr><td><strong>Name:</strong></td><td>${fullName}</td></tr>
              <tr><td><strong>Age:</strong></td><td>${Number(age)}</td></tr>
              <tr><td><strong>Parent Consent:</strong></td><td>${parentConsent ? 'Yes' : 'No'}</td></tr>
              <tr><td><strong>Category:</strong></td><td>${category}</td></tr>
              <tr><td><strong>Notes:</strong></td><td>${notes || '-'}</td></tr>
              <tr><td><strong>File:</strong></td><td><a href="${fileUrl}">${fileUrl}</a></td></tr>
            </table>
          </div>
        `,
      });
      toast.success("Submitted successfully");
      resetRecording();
      setFullName("");
      setAge("");
      setParentConsent(false);
      setCategory("quran");
      setNotes("");
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-2">🎙️</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Kids Recording Studio</h1>
          <p className="text-gray-600">Record Quran, stories or hadith and send with consent</p>
        </motion.div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Consent & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={parentConsent} onCheckedChange={(v) => setParentConsent(!!v)} />
              <span>Parent consent</span>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quran">Quran</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="hadith">Hadith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recording</CardTitle>
          </CardHeader>
          <CardContent>
            {permissionDenied && (
              <div className="mb-4 p-3 rounded bg-red-50 text-red-700">Microphone access denied</div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={startRecording} disabled={recording} className="bg-blue-600 hover:bg-blue-700">
                <Mic className="w-4 h-4 mr-2" /> Start
              </Button>
              <Button onClick={stopRecording} disabled={!recording} variant="outline">
                <Square className="w-4 h-4 mr-2" /> Stop
              </Button>
              <Button onClick={playRecording} disabled={!audioUrl} variant="outline">
                <Play className="w-4 h-4 mr-2" /> Play
              </Button>
              <Button onClick={submit} disabled={!audioBlob || submitting} className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" /> {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
            <div className="mt-4">
              <audio ref={audioRef} src={audioUrl || undefined} controls className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
