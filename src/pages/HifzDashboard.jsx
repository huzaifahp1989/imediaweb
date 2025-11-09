import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getAllAyahStatuses } from '@/api/quranOfflineDb';

function calcPercent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function HifzDashboard() {
  const [stats, setStats] = useState({ total: 0, memorised: 0, revision: 0, notMemorised: 0 });
  const [bySurah, setBySurah] = useState([]);

  useEffect(() => {
    (async () => {
      const mapAll = await getAllAyahStatuses();
      const statuses = Object.entries(mapAll).map(([key, val]) => {
        const [surahNumber, ayahNumber] = key.split('-').map(Number);
        return { surahNumber, ayahNumber, status: val?.status };
      });
      const total = statuses.length;
      const memorised = statuses.filter(s => s.status === 'memorised').length;
      const revision = statuses.filter(s => s.status === 'revision').length;
      const notMemorised = statuses.filter(s => s.status === 'new' || !s.status).length;

      const map = new Map();
      statuses.forEach(s => {
        const key = s.surahNumber;
        const entry = map.get(key) || { surahNumber: key, total: 0, memorised: 0 };
        entry.total += 1;
        if (s.status === 'memorised') entry.memorised += 1;
        map.set(key, entry);
      });

      setStats({ total, memorised, revision, notMemorised });
      setBySurah(Array.from(map.values()).sort((a, b) => a.surahNumber - b.surahNumber));
    })();
  }, []);

  const percentAll = useMemo(() => calcPercent(stats.memorised, stats.total), [stats]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hifz Progress Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-sm text-gray-500">Total Ayahs Tracked</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Memorised</p>
              <p className="text-lg font-semibold">{stats.memorised}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Under Revision</p>
              <p className="text-lg font-semibold">{stats.revision}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Not Memorised</p>
              <p className="text-lg font-semibold">{stats.notMemorised}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm mb-1">Overall Memorisation</p>
            <Progress value={percentAll} />
            <p className="text-xs text-gray-500 mt-1">{percentAll}% complete</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Surah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bySurah.length === 0 && (
              <p className="text-sm text-gray-600">No memorisation data yet. Mark ayahs as memorised in the Full Qur’an page.</p>
            )}
            {bySurah.map((s) => {
              const percent = calcPercent(s.memorised, s.total);
              return (
                <div key={s.surahNumber} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>Surah {s.surahNumber}</Badge>
                      <span className="text-sm text-gray-600">Memorised {s.memorised}/{s.total}</span>
                    </div>
                    <span className="text-sm font-medium">{percent}%</span>
                  </div>
                  <Progress value={percent} className="mt-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
