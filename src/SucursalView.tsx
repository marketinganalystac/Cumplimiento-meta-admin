import { useRef, useEffect, useState } from 'react';
import { SUC_B64 } from './iframeData';
import { saveReportState, loadReportState } from './lib/supabase';

interface SucursalViewProps {
  onGoConsole: () => void;
  csvText: string | null;
  csvName: string | null;
  active: boolean;
  isAdmin: boolean;
}

export default function SucursalView({ onGoConsole, csvText, csvName, active, isAdmin }: SucursalViewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (active && !loaded && frameRef.current) {
      frameRef.current.src = 'data:text/html;base64,' + SUC_B64;
      setLoaded(true);
    }
  }, [active, loaded]);

  useEffect(() => {
    async function onMessage(e: MessageEvent) {
      if (!e.data) return;
      if (e.data.type === 'goConsole') { onGoConsole(); return; }

      if (e.data.type === 'iframeReady' && e.data.from === 'sucursal') {
        const win = frameRef.current?.contentWindow;
        if (!win) return;

        // 1. Restaurar estado manual
        const state = await loadReportState('sucursal');
        if (state) {
          win.postMessage({ type: 'restoreState', state }, '*');
        }
        win.postMessage({ type: 'setRole', isAdmin }, '*');

        // 2. Enviar CSV si hay uno cargado
        if (csvText) {
          win.postMessage({ type: 'csvData', text: csvText, name: csvName }, '*');
        }
        return;
      }

      // El iframe pide guardar estado
      if (e.data.type === 'saveState' && e.data.report === 'sucursal') {
        await saveReportState('sucursal', e.data.state);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [csvText, csvName, onGoConsole]);

  // Cuando el CSV cambia mientras el iframe ya está cargado
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
