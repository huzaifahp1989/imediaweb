import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RefreshCw, Circle } from 'lucide-react';
import PropTypes from 'prop-types';
import { setAyahStatus, getAyahStatus } from '@/api/quranOfflineDb';

const STATUS_META = {
  memorised: { label: 'Memorised', color: 'bg-green-600', Icon: CheckCircle },
  revision: { label: 'Under Revision', color: 'bg-yellow-500', Icon: RefreshCw },
  new: { label: 'Not Memorised', color: 'bg-gray-500', Icon: Circle },
};

export default function AyahStatusControls({ surahNumber, ayahNumber, onChange }) {
  const [status, setStatus] = useState('new');

  useEffect(() => {
    let mounted = true;
    getAyahStatus(surahNumber, ayahNumber).then((res) => {
      if (!mounted) return;
      if (res?.status) setStatus(res.status);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [surahNumber, ayahNumber]);

  const applyStatus = async (next) => {
    setStatus(next);
    try { await setAyahStatus(surahNumber, ayahNumber, next); } catch (e) {}
    onChange?.(next);
  };

  const ActiveMeta = STATUS_META[status] || STATUS_META.new;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={ActiveMeta.color}>
        <ActiveMeta.Icon className="w-4 h-4 mr-1" /> {ActiveMeta.label}
      </Badge>
      <div className="flex items-center gap-2">
        <Button size="sm" variant={status === 'memorised' ? 'default' : 'outline'} onClick={() => applyStatus('memorised')}>
          <CheckCircle className="w-4 h-4 mr-1" /> Memorised
        </Button>
        <Button size="sm" variant={status === 'revision' ? 'default' : 'outline'} onClick={() => applyStatus('revision')}>
          <RefreshCw className="w-4 h-4 mr-1" /> Revision
        </Button>
        <Button size="sm" variant={status === 'new' ? 'default' : 'outline'} onClick={() => applyStatus('new')}>
          <Circle className="w-4 h-4 mr-1" /> Not Yet
        </Button>
      </div>
    </div>
  );
}

AyahStatusControls.propTypes = {
  surahNumber: PropTypes.number.isRequired,
  ayahNumber: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

