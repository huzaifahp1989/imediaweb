import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// There are 240 quarter-hizb (8 quarters per Juz). This is an approximate mapping for navigation.
function quarterToJuz(quarter) {
  const juz = Math.ceil(quarter / 8);
  const idx = ((quarter - 1) % 8) + 1; // 1..8
  return { juz, idx };
}

export default function Hizb() {
  const navigate = useNavigate();
  const [quarter, setQuarter] = useState(1);

  const { juz, idx } = useMemo(() => quarterToJuz(Math.min(240, Math.max(1, Number(quarter) || 1))), [quarter]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hizb / Quarter-Hizb Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Select a quarter (1–240). Each Juz has 8 quarters. This navigator links you to the Juz in the Full Qur’an module and approximates the quarter position.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose Quarter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input type="number" min={1} max={240} value={quarter} onChange={(e) => setQuarter(e.target.value)} className="w-32" />
            <Badge>Juz {juz} • Quarter {idx} of 8</Badge>
            <Button onClick={() => navigate(`/FullQuran?juz=${juz}&quarter=${idx}`)} variant="default">Open Juz {juz}</Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Note: Exact ayah ranges per quarter-hizb vary by script. We’ll refine per-ayah segment mapping in a subsequent update.</p>
        </CardContent>
      </Card>
    </div>
  );
}

