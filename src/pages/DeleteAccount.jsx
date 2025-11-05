import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, ShieldAlert, ArrowLeft } from "lucide-react";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [agreedToDelete, setAgreedToDelete] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        navigate(createPageUrl("Home"));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error("Authentication check failed:", error);
      navigate(createPageUrl("Home"));
    }
  };

  const handleDeleteAccount = async () => {
    if (!agreedToDelete || confirmText !== "DELETE") {
      alert("Please confirm by typing DELETE and checking the box.");
      return;
    }

    setDeleting(true);

    try {
      // Send email notification to admin
      await base44.integrations.Core.SendEmail({
        from_name: "Islam Kids Zone - Account Deletion",
        to: "huzaify786@gmail.com",
        subject: "🗑️ User Account Deletion Request",
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
            <h2 style="color: #DC2626;">🗑️ Account Deletion Request</h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <p><strong>👤 Name:</strong> ${user.full_name || 'N/A'}</p>
              <p><strong>📧 Email:</strong> ${user.email || 'N/A'}</p>
              <p><strong>🆔 User ID:</strong> ${user.id}</p>
              <p><strong>⭐ Points:</strong> ${user.points || 0}</p>
              <p><strong>🏙️ City:</strong> ${user.city || 'N/A'}</p>
              <p><strong>🕌 Madrasah:</strong> ${user.madrasah_maktab || 'N/A'}</p>
              <p><strong>📅 Deletion Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              User requested account deletion from the Delete Account page.
            </p>
          </div>
        `
      });

      // Delete user's game scores
      try {
        const gameScores = await base44.entities.GameScore.filter({ user_id: user.id });
        for (const score of gameScores) {
          await base44.entities.GameScore.delete(score.id);
        }
      } catch (error) {
        console.log("Error deleting game scores:", error);
      }

      // Delete user's game progress
      try {
        const gameProgress = await base44.entities.UserGameProgress.filter({ user_id: user.id });
        for (const progress of gameProgress) {
          await base44.entities.UserGameProgress.delete(progress.id);
        }
      } catch (error) {
        console.log("Error deleting game progress:", error);
      }

      // Delete user's recordings
      try {
        const recordings = await base44.entities.Recording.filter({ user_id: user.id });
        for (const recording of recordings) {
          await base44.entities.Recording.delete(recording.id);
        }
      } catch (error) {
        console.log("Error deleting recordings:", error);
      }

      // Delete user's poetry
      try {
        const poetry = await base44.entities.Poetry.filter({ user_id: user.id });
        for (const poem of poetry) {
          await base44.entities.Poetry.delete(poem.id);
        }
      } catch (error) {
        console.log("Error deleting poetry:", error);
      }

      // Delete user's challenges
      try {
        const sentChallenges = await base44.entities.Challenge.filter({ challenger_id: user.id });
        const receivedChallenges = await base44.entities.Challenge.filter({ opponent_id: user.id });
        
        for (const challenge of [...sentChallenges, ...receivedChallenges]) {
          await base44.entities.Challenge.delete(challenge.id);
        }
      } catch (error) {
        console.log("Error deleting challenges:", error);
      }

      // Delete user's good deeds
      try {
        const goodDeeds = await base44.entities.GoodDeed.filter({ user_id: user.id });
        for (const deed of goodDeeds) {
          await base44.entities.GoodDeed.delete(deed.id);
        }
      } catch (error) {
        console.log("Error deleting good deeds:", error);
      }

      // Finally, delete the user account
      await base44.entities.User.delete(user.id);

      // Logout and redirect
      alert("Your account has been successfully deleted. We're sorry to see you go!");
      base44.auth.logout(createPageUrl("Home"));
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("There was an error deleting your account. Please contact support or try again later.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-4 border-red-500 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-8 h-8" />
                <div>
                  <CardTitle className="text-2xl">Delete Account</CardTitle>
                  <p className="text-sm text-red-100 mt-1">This action cannot be undone</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {!showFinalConfirm ? (
                <div className="space-y-6">
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-red-900 mb-2">Warning: This will permanently delete:</h3>
                        <ul className="space-y-1 text-sm text-red-800">
                          <li>✗ Your profile and account information</li>
                          <li>✗ All your game scores and progress ({user.points || 0} points)</li>
                          <li>✗ Your leaderboard rankings</li>
                          <li>✗ All audio recordings you've submitted</li>
                          <li>✗ All poems and nasheeds you've written</li>
                          <li>✗ Your challenge history</li>
                          <li>✗ All your saved data and badges</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">📋 Current Account Information:</h3>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p><strong>Name:</strong> {user.full_name || 'N/A'}</p>
                      <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                      <p><strong>Points:</strong> {user.points || 0} ⭐</p>
                      <p><strong>City:</strong> {user.city || 'N/A'}</p>
                      {user.madrasah_maktab && <p><strong>Madrasah:</strong> {user.madrasah_maktab}</p>}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-900 mb-2">⚠️ Before You Delete:</h3>
                    <ul className="space-y-1 text-sm text-yellow-800">
                      <li>• Make sure you've downloaded any data you want to keep</li>
                      <li>• Consider just taking a break instead of deleting</li>
                      <li>• You won't be able to recover your account or progress</li>
                      <li>• You can create a new account anytime, but you'll start from scratch</li>
                    </ul>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      onClick={() => navigate(createPageUrl("Home"))}
                      variant="outline"
                      className="text-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setShowFinalConfirm(true)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Proceed to Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Trash2 className="w-6 h-6 text-red-600" />
                        <h3 className="font-bold text-red-900 text-lg">Final Confirmation Required</h3>
                      </div>
                      <p className="text-sm text-red-800">
                        This is your last chance to cancel. Once you confirm, your account and all associated data will be permanently deleted within 30 days.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type "DELETE" to confirm (all caps):
                      </label>
                      <Input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE here"
                        className="border-2 border-red-300 focus:border-red-500"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agree"
                        checked={agreedToDelete}
                        onCheckedChange={setAgreedToDelete}
                        className="mt-1"
                      />
                      <label htmlFor="agree" className="text-sm text-gray-700 cursor-pointer">
                        I understand that this action is permanent and cannot be undone. I want to delete my account and all associated data.
                      </label>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        onClick={() => setShowFinalConfirm(false)}
                        variant="outline"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        disabled={deleting || confirmText !== "DELETE" || !agreedToDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Deleting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete My Account
                          </span>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help or have questions? <a href={createPageUrl("ContactUs")} className="text-blue-600 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}