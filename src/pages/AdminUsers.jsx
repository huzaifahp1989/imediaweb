import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function AdminUsers() {
  const subject = encodeURIComponent("Admin Access Request - Users Management");
  const body = encodeURIComponent("Hi, I'd like admin access to manage users on Islam Kids Zone. My name is ____ and my contact details are ____.");

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 mb-4">
              The Users management panel is disabled in this email-only mode. Please request admin access.
            </p>
            <Button
              onClick={() => {
                window.location.href = `mailto:imediac786@gmail.com?subject=${subject}&body=${body}`;
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request Admin Access
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
