import React, { useState } from "react";
import { messagesApi } from "@/api/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, CheckCircle2, Sparkles } from "lucide-react";
// Removed import of base44 for public page

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
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
    setLoading(true);

    try {
      await base44.integrations.Core.SendEmail({
        from_name: "Islam Kids Zone - Contact Form",
        to: "huzaify786@gmail.com",
        subject: `Contact Form: ${formData.subject}`,
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
            <h2 style="color: #3B82F6;">📧 New Contact Form Submission</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p><strong>👤 Name:</strong> ${formData.name}</p>
              <p><strong>📧 Email:</strong> ${formData.email}</p>
              <p><strong>📝 Subject:</strong> ${formData.subject}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p><strong>💬 Message:</strong></p>
              <p style="background-color: #f9fafb; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${formData.message}</p>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              📅 Sent on: ${new Date().toLocaleString()}
            </p>
          </div>
        `
      });

      // Persist message to Firestore if Firebase is configured
      try {
        await messagesApi.add({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          createdAt: new Date().toISOString(),
          read: false,
        });
      } catch (persistErr) {
        // Silently ignore if Firebase is not configured
        console.warn("Message not persisted (Firebase not configured or error)", persistErr?.message || persistErr);
      }

      setSuccess(true);
      setFormData({
        name: user?.full_name || "",
        email: user?.email || "",
        subject: "",
        message: ""
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
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
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, suggestion, or feedback? We'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Email Card */}
            <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                    <a 
                      href="mailto:huzaify786@gmail.com"
                      className="text-blue-600 hover:text-blue-700 text-sm break-all"
                    >
                      huzaify786@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-2 border-green-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Quick Response</h3>
                    <p className="text-gray-600 text-sm">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Islamic Quote */}
            <Card className="border-2 border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🌙</div>
                  <p className="text-gray-700 italic text-sm mb-2">
                    "The best of people are those who are most beneficial to people."
                  </p>
                  <p className="text-gray-500 text-xs">- Prophet Muhammad ﷺ</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <Card className="shadow-2xl border-2 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {success ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Message Sent! ✨
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting us. We'll get back to you soon!
                    </p>
                    <Button
                      onClick={() => setSuccess(false)}
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field */}
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-semibold">
                        Your Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-semibold">
                        Your Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Subject Field */}
                    <div>
                      <Label htmlFor="subject" className="text-gray-700 font-semibold">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What is this about?"
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <Label htmlFor="message" className="text-gray-700 font-semibold">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us more about your question or feedback..."
                        required
                        rows={6}
                        className="mt-1"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg py-6"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
