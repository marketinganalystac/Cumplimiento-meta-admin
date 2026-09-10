import { useRef, useEffect, useState } from 'react';
import { CRED_B64 } from './iframeData';
import { saveReportState, loadReportState } from './lib/supabase';

interface CreditosViewProps {
  onGoConsole: () => void;
  active: boolean;
  csvText?: string | null;
  csvName?: string | null;
  isAdmin: boolean;
}

export default function CreditosView({ onGoConsole, active, csvText, csvName, isAdmin }: CreditosViewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (active && !loaded && frameRef.current) {
      frameRef.current.src = 'data:text/html;base64,' + CRED_B64;
      setLoaded(true);
    }
  }, [active, loaded]);

  useEffect(() => {
    async function onMessage(e: MessageEvent) {
      if (!e.data) return;
      if (e.data.type === 'goConsole') { onGoConsole(); return; }

      if (e.data.type === 'iframeReady' && e.data.from === 'creditos') {
        const win = frameRef.current?.contentWindow;
        if (!win) return;
        const state = await loadReportState('creditos');
        if (state) win.postMessage({ type: 'restoreState', state }, '*');
        win.postMessage({ type: 'setRole', isAdmin }, '*');
        if (csvText) win.postMessage({ type: 'csvData', text: csvText, name: csvName }, '*');
        return;
      }

      if (e.data.type === 'saveState' && e.data.report === 'creditos') {
        await saveReportState('creditos', e.data.state);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onGoConsole, csvText, csvName, isAdmin]);

  // Si el CSV llega después de que el iframe ya cargó
  useEffect(() => {
    if (csvText && loaded && frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.postMessage(
        { type: 'csvData', text: csvText, name: csvName }, '*'
      );
    }
  }, [csvText, csvName, loaded]);

  return (
    <div className="suc-frame-wrap">
      <iframe ref={frameRef} src="about:blank" title="Reporte Créditos" />
    </div>
  );
}
