import { useRef, useEffect, useState } from 'react';
import { SUC_B64 } from './iframeData';

interface SucursalViewProps {
  onGoConsole: () => void;
  csvText: string | null;
  csvName: string | null;
  active: boolean;
}

export default function SucursalView({ onGoConsole, csvText, csvName, active }: SucursalViewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (active && !loaded && frameRef.current) {
      frameRef.current.src = 'data:text/html;base64,' + SUC_B64;
      setLoaded(true);
    }
  }, [active, loaded]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data) return;
      if (e.data.type === 'goConsole') { onGoConsole(); return; }
      if (e.data.type === 'iframeReady' && e.data.from === 'sucursal') {
        if (csvText && frameRef.current?.contentWindow) {
          frameRef.current.contentWindow.postMessage(
            { type: 'csvData', text: csvText, name: csvName }, '*'
          );
        }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [csvText, csvName, onGoConsole]);

  useEffect(() => {
    if (csvText && loaded && frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.postMessage(
        { type: 'csvData', text: csvText, name: csvName }, '*'
      );
    }
  }, [csvText, csvName, loaded]);

  return (
    <div className="suc-frame-wrap">
      <iframe ref={frameRef} src="about:blank" title="Reporte Sucursal" />
    </div>
  );
}
