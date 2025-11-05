import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Users } from "lucide-react";

export default function ResetPointsAdmin() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(user => user.points > 400);
    },
    initialData: [],
  });

  const resetPointsMutation = useMutation({
    mutationFn: async () => {
      const usersToUpdate = users.filter(user => user.points > 400);
      
      for (const user of usersToUpdate) {
        await base44.entities.User.update(user.id, {
          points: 400
        });
      }
      
      return usersToUpdate.length;
    },
    onSuccess: (count) => {
      setStatus({
        type: "success",
        message: `Successfully reset ${count} users to 400 points!`
      });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
    onError: (error) => {
      setStatus({
        type: "error",
        message: `Error: ${error.message}`
      });
    }
  });

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
            {status.message && (
              <Alert className={`mb-6 ${status.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={status.type === "success" ? "text-green-800" : "text-red-800"}>
                  {status.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Users with points over 400:</h3>
              {isLoading ? (
                <p className="text-gray-600">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="text-green-600 font-medium">✅ All users have 400 points or less!</p>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-red-600 font-medium mb-3">Found {users.length} users to reset:</p>
                  <div className="space-y-2">
                    {users.map(user => (
                      <div key={user.id} className="flex justify-between items-center p-2 bg-white rounded border">
                        <span className="font-medium">{user.full_name || user.email}</span>
                        <span className="text-red-600 font-bold">{user.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => resetPointsMutation.mutate()}
              disabled={resetPointsMutation.isPending || users.length === 0}
              className="w-full bg-red-500 hover:bg-red-600"
              size="lg"
            >
              {resetPointsMutation.isPending ? (
                "Resetting Points..."
              ) : (
                `Reset ${users.length} Users to 400 Points`
              )}
            </Button>

            <p className="text-sm text-gray-600 mt-4 text-center">
              ⚠️ This action will set all users with more than 400 points to exactly 400 points.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}