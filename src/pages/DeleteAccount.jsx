import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = React.useState("");
  const [agreedToDelete, setAgreedToDelete] = React.useState(false);

  const subject = encodeURIComponent("Account Deletion Request - Islam Kids Zone");
  const body = encodeURIComponent(
    "Hi, I'd like to delete my account on Islam Kids Zone. My name is ____ and my contact details are ____."
  );

  const handleEmail = () => {
    window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => navigate(createPageUrl("Home"))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <Card className="border-2 border-red-300 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Trash2 className="w-6 h-6 mr-2 text-red-600" />
              Delete Account (Email-Only Mode)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                <p className="text-gray-700">
                  Direct account deletion is disabled in this mode. To delete your account, please email our team.
                  We'll process the request and confirm via email. You can include your name and contact details in the email.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type DELETE to confirm you understand this action
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agree"
                    checked={agreedToDelete}
                    onCheckedChange={(val) => setAgreedToDelete(Boolean(val))}
                  />
                  <label htmlFor="agree" className="text-sm text-gray-700">
                    I understand this will permanently remove my account and associated content.
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleEmail}
                  disabled={confirmText !== "DELETE" || !agreedToDelete}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500"
                >
                  Email Us to Delete My Account
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  We'll respond to confirm your account deletion request.
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
