import { useRef, useEffect, useState } from 'react';
import { TALLER_B64 } from './iframeData';

interface TallerViewProps {
  onGoConsole: () => void;
  active: boolean;
}

export default function TallerView({ onGoConsole, active }: TallerViewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (active && !loaded && frameRef.current) {
      frameRef.current.src = 'data:text/html;base64,' + TALLER_B64;
      setLoaded(true);
    }
  }, [active, loaded]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data) return;
      if (e.data.type === 'goConsole') {
        onGoConsole();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onGoConsole]);

  return (
    <div className="suc-frame-wrap">
      <iframe ref={frameRef} src="about:blank" title="Reporte Taller" />
    </div>
  );
}
