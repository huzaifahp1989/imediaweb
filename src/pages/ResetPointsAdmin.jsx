import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users, Trophy } from "lucide-react";

const clampPoints = (n) => {
  const v = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(1500, Math.round(v)));
};

function readLeaderboard() {
  try {
    const raw = localStorage.getItem("ikz_leaderboard");
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(items) {
  try {
    localStorage.setItem("ikz_leaderboard", JSON.stringify(items));
  } catch {}
}

function readUsers() {
  try {
    const raw = localStorage.getItem("users");
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeUsers(items) {
  try {
    localStorage.setItem("users", JSON.stringify(items));
  } catch {}
}

export default function ResetPointsAdmin() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [users, setUsers] = useState([]);

  const [resetValue, setResetValue] = useState(400);
  const [targetEmail, setTargetEmail] = useState("");
  const [setValue, setSetValue] = useState(400);
  const [addDelta, setAddDelta] = useState(50);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLeaderboard(readLeaderboard());
    setUsers(readUsers());
  }, []);

  const merged = useMemo(() => {
    // Merge by email when possible; prefer leaderboard entries
    const byEmail = new Map();
    leaderboard.forEach((u) => {
      const key = (u.email || u.full_name || "").toLowerCase();
      byEmail.set(key, { source: "leaderboard", ...u });
    });
    users.forEach((u) => {
      const key = (u.email || u.full_name || "").toLowerCase();
      if (!byEmail.has(key)) byEmail.set(key, { source: "users", ...u });
    });
    return Array.from(byEmail.values());
  }, [leaderboard, users]);

  const refresh = () => {
    setLeaderboard(readLeaderboard());
    setUsers(readUsers());
  };

  const handleResetAll = () => {
    const value = clampPoints(Number(resetValue));
    // Update leaderboard
    const lb = readLeaderboard();
    const nextLb = lb.map((u) => ({ ...u, points: value }));
    writeLeaderboard(nextLb);
    // Update users
    const us = readUsers();
    const nextUsers = us.map((u) => ({ ...u, points: value }));
    writeUsers(nextUsers);
    setStatus(`Reset all learner points to ${value}.`);
    refresh();
  };

  const handleSetByEmail = () => {
    const email = String(targetEmail || "").trim().toLowerCase();
    if (!email) {
      setStatus("Enter an email to set points.");
      return;
    }
    const value = clampPoints(Number(setValue));
    let changed = 0;

    // Leaderboard
    const lb = readLeaderboard();
    const nextLb = lb.map((u) => {
      const key = (u.email || "").toLowerCase();
      if (key === email) {
        changed++;
        return { ...u, points: value };
      }
      return u;
    });
    writeLeaderboard(nextLb);

    // Users
    const us = readUsers();
    const nextUsers = us.map((u) => {
      const key = (u.email || "").toLowerCase();
      if (key === email) {
        changed++;
        return { ...u, points: value };
      }
      return u;
    });
    writeUsers(nextUsers);

    setStatus(changed > 0 ? `Set ${email} points to ${value}.` : `No user found for ${email}.`);
    refresh();
  };

  const handleAddByEmail = () => {
    const email = String(targetEmail || "").trim().toLowerCase();
    if (!email) {
      setStatus("Enter an email to add points.");
      return;
    }
    const delta = Number(addDelta);
    let changed = 0;

    const applyAdd = (u) => ({ ...u, points: clampPoints((u.points || 0) + delta) });

    // Leaderboard
    const lb = readLeaderboard();
    const nextLb = lb.map((u) => {
      const key = (u.email || "").toLowerCase();
      if (key === email) {
        changed++;
        return applyAdd(u);
      }
      return u;
    });
    writeLeaderboard(nextLb);

    // Users
    const us = readUsers();
    const nextUsers = us.map((u) => {
      const key = (u.email || "").toLowerCase();
      if (key === email) {
        changed++;
        return applyAdd(u);
      }
      return u;
    });
    writeUsers(nextUsers);

    setStatus(changed > 0 ? `Added ${delta} points to ${email}.` : `No user found for ${email}.`);
    refresh();
  };

  const clearSampleData = () => {
    try {
      localStorage.removeItem("ikz_leaderboard");
      localStorage.removeItem("users");
      localStorage.removeItem("gameScores");
      setStatus("Cleared local sample data: leaderboard, users, game scores.");
    } catch (e) {
      setStatus("Failed to clear local sample data.");
    }
    refresh();
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Points Tools: Reset or Add Points
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                These tools update local leaderboard and users data. Game logic caps points at 1500.
              </AlertDescription>
            </Alert>

            {/* Bulk reset */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-sm text-gray-700">Reset all learners to</label>
                <Input type="number" value={resetValue} onChange={(e) => setResetValue(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={handleResetAll}>Reset All</Button>
              </div>
            </div>

            {/* Targeted set/add */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-sm text-gray-700">Target email</label>
                <Input placeholder="student@example.com" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Set points to</label>
                <Input type="number" value={setValue} onChange={(e) => setSetValue(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSetByEmail}>Set Exact</Button>
                <Button onClick={handleAddByEmail}>Add Points</Button>
              </div>
            </div>

            {/* Status */}
            {status && (
              <div className="text-sm text-green-700">{status}</div>
            )}

            {/* Cleanup */}
            <div className="mt-4 p-4 border rounded-md bg-red-50 border-red-200">
              <div className="font-semibold text-red-700 mb-2">Danger Zone</div>
              <p className="text-sm text-red-700 mb-3">
                Delete all local sample accounts and details (leaderboard, users, game scores).
              </p>
              <Button variant="destructive" onClick={clearSampleData}>Delete All Fake Accounts and Details</Button>
            </div>

            {/* Current snapshot */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Learners</h3>
              {merged.length === 0 ? (
                <div className="text-sm text-gray-600">No learners found in local storage.</div>
              ) : (
                <div className="divide-y divide-gray-100 bg-white border rounded-md overflow-hidden">
                  {merged.map((u, i) => (
                    <div key={`${u.email || u.full_name || 'user'}-${i}`} className="p-3 sm:p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{u.full_name || (u.email?.split('@')[0]) || 'Learner'}</div>
                        <div className="text-xs text-gray-600 truncate">{u.email || 'no-email'}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-amber-600 font-bold">{u.points || 0}</div>
                        <div className="text-[10px] text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
