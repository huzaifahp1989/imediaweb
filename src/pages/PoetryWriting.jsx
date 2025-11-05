import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { FileText, Send, CheckCircle, Sparkles } from "lucide-react";
// Removed import of base44 for public page

export default function PoetryWriting() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "poem"
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState(null);

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
      setUser(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit your work!");
      return;
    }

    setSubmitting(true);

    try {
      await base44.entities.Poetry.create({
        user_id: user.id,
        user_name: user.full_name || "Anonymous",
        title: formData.title,
        content: formData.content,
        type: formData.type,
        status: "pending"
      });

      await base44.integrations.Core.SendEmail({
        from_name: "Islam Kids Zone",
        to: "huzaify786@gmail.com",
        subject: `📝 New ${formData.type === "poem" ? "Poem" : "Nasheed"} Submission`,
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New ${formData.type === "poem" ? "Poem" : "Nasheed"} Submission</h2>
            <p><strong>Student:</strong> ${user.full_name || "Anonymous"}</p>
            <p><strong>Title:</strong> ${formData.title}</p>
            <hr/>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${formData.content}</pre>
          </div>
        `
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ title: "", content: "", type: "poem" });
      }, 5000);
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Error submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Write Islamic Poetry & Nasheeds
          </h1>
          <p className="text-lg text-gray-600">
            Express your love for Islam through beautiful words!
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="border-4 border-green-400 shadow-2xl">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Masha'Allah! 🎉
                </h2>
                <p className="text-xl text-gray-600">
                  Your {formData.type} has been submitted successfully!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Submit Your Work
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div>
                  <Label className="text-gray-700 font-semibold mb-3 block">
                    What are you writing?
                  </Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "poem" })}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        formData.type === "poem"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">📖</div>
                      <div className="font-bold">Islamic Poem</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "nasheed" })}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        formData.type === "nasheed"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-300"
                      }`}
                    >
                      <div className="text-3xl mb-2">🎵</div>
                      <div className="font-bold">Nasheed</div>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-gray-700 font-semibold">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give your work a beautiful title..."
                    required
                    className="mt-2"
                  />
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content" className="text-gray-700 font-semibold">
                    Your {formData.type === "poem" ? "Poem" : "Nasheed"} *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your beautiful words here..."
                    required
                    rows={12}
                    className="mt-2 font-mono"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-xl py-6"
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </form>

              {/* Tips */}
              <div className="mt-6 bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Writing Tips
                </h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>🤲 Start with Bismillah</li>
                  <li>❤️ Write from your heart about Islam</li>
                  <li>📝 Check spelling and grammar</li>
                  <li>⭐ Be creative and original!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}