import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";

export default function ResetPointsAdmin() {
  // Email-only mode: disable admin panel actions and show CTA
  const subject = encodeURIComponent("Admin Access Request - Reset Points");
  const body = encodeURIComponent("Hi, I'd like admin access to reset user points to 400 on Islam Kids Zone. My name is ____ and my contact details are ____.");

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              Admin: Reset Points to 400
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                The Reset Points admin tool is disabled in this email-only mode.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button
                onClick={() => {
                  window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
                size="lg"
              >
                Request Admin Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
