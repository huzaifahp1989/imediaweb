import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Manzil mapping (commonly used grouping)
const MANZIL_GROUPS = [
  { number: 1, range: [1, 4], label: 'Al-Fatihah → An-Nisa' },
  { number: 2, range: [5, 9], label: 'Al-Ma’idah → At-Tawbah' },
  { number: 3, range: [10, 16], label: 'Yunus → An-Nahl' },
  { number: 4, range: [17, 25], label: 'Al-Isra → Al-Furqan' },
  { number: 5, range: [26, 36], label: 'Ash-Shu’ara → Ya-Sin' },
  { number: 6, range: [37, 49], label: 'As-Saffat → Al-Hujurat' },
  { number: 7, range: [50, 114], label: 'Qaf → An-Nas' },
];

export default function Manzil() {
  const navigate = useNavigate();

  const groups = useMemo(() => MANZIL_GROUPS, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manzil (Weekly Recitation)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Select a Manzil to review or recite. You can open the surahs in the Full Qur’an view and cache them for offline reading.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((m) => (
          <Card key={m.number} className="border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" /> Manzil {m.number}
                </CardTitle>
                <Badge className="bg-green-600">Surah {m.range[0]} → {m.range[1]}</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{m.label}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={() => navigate(`/FullQuran?surah=${m.range[0]}`)} variant="outline">Open start surah</Button>
                <Button onClick={() => navigate(`/FullQuran?surah=${m.range[1]}`)} variant="outline">Open end surah</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

