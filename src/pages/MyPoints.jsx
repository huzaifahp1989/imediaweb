import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, RefreshCw, TrendingUp, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { watchAuth, getUserProfile, getFirebase } from "@/api/firebase";
import { collection, getDocs, query, orderBy, doc } from "firebase/firestore";

export default function MyPoints() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = async (u) => {
    setLoading(true);
    setStatus("");
    try {
      if (!u) {
        setProfile(null);
        setScores([]);
        setLoading(false);
        return;
      }
      const p = await getUserProfile(u.uid);
      setProfile(p ? { id: u.uid, email: u.email, ...p } : { id: u.uid, email: u.email, points: 0 });
      // Load recent awards history
      try {
        const { db } = getFirebase();
        if (db) {
          const ref = doc(db, 'users', u.uid);
          const col = collection(ref, 'game_scores');
          const q = query(col, orderBy('at', 'desc'));
          const snap = await getDocs(q);
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setScores(items);
        }
      } catch (e) {
        // Non-fatal
      }
    } catch (e) {
      setStatus(`Failed to load profile: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stop = watchAuth(async (u) => {
      setCurrentUser(u || null);
      await load(u);
    });
    return () => { try { stop?.(); } catch {} };
  }, []);

  const cap = 1500;
  const points = Number(profile?.points || 0);
  const progress = Math.round(Math.min((points / cap) * 100, 100));

  return (
    <div className="min-h-screen py-6 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-blue-300 shadow-lg mb-6">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-300" />
              My Points
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {status && (
              <div className="mb-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">{status}</div>
            )}
            {!currentUser ? (
              <div className="text-center text-gray-600">
                <p className="mb-3">You’re not signed in.</p>
                <p className="mb-4">Sign in to track your points and awards.</p>
                <Link to="/Signup"><Button className="bg-blue-600 hover:bg-blue-700">Sign in / Signup</Button></Link>
              </div>
            ) : loading ? (
              <div className="text-center text-gray-500">Loading your points…</div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-700 text-lg">{points} points</span>
                    <Badge className="bg-blue-100 text-blue-700">Cap {cap}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => load(currentUser)}>
                      <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Link to="/Leaderboard"><Button>
                      <Trophy className="w-4 h-4 mr-2" /> Leaderboard
                    </Button></Link>
                  </div>
                </div>
                <div className="mb-4">
                  <Progress value={progress} className="h-3" />
                  <div className="text-xs text-gray-500 mt-1">Progress to cap: {progress}%</div>
                </div>

                {profile?.lastAward ? (
                  <div className="mb-4 p-3 border rounded bg-gray-50">
                    <div className="text-sm text-gray-700">Last Award</div>
                    <div className="text-sm text-gray-900 font-medium">
                      {profile.lastAward.game_type || 'Game'} {profile.lastAward.perfect ? '⭐ Perfect!' : ''} (+{profile.lastAward.points_awarded || 0})
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-sm text-gray-600">Play a game to earn your first points!</div>
                )}

                <div className="mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Recent Awards</h3>
                  {scores.length === 0 ? (
                    <div className="text-sm text-gray-600">No awards yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {scores.slice(0, 10).map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="text-sm text-gray-800">
                            {s.game_type || 'Game'} {s.perfect ? '⭐ Perfect!' : ''}
                          </div>
                          <div className="flex items-center gap-1 text-amber-700 font-semibold">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            +{Number(s.points_awarded || 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 p-3 border rounded bg-blue-50 text-blue-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Keep learning and playing to earn more points!
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

