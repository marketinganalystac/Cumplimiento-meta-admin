import { useRef, useEffect, useState } from 'react';
import { CRED_B64 } from './iframeData';
import { saveReportState, loadReportState } from './lib/supabase';

interface CreditosViewProps {
  onGoConsole: () => void;
  active: boolean;
  csvText?: string | null;
  csvName?: string | null;
  maestroCsvText?: string | null;
  maestroCsvName?: string | null;
  isAdmin: boolean;
}

export default function CreditosView({ onGoConsole, active, csvText, csvName, maestroCsvText, maestroCsvName, isAdmin }: CreditosViewProps) {
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
        // Reutiliza las Proyecciones ya cargadas y guardadas por el reporte Vendedor
        const vendState = await loadReportState('vendedor') as { proyVend?: unknown; sucOrder?: unknown } | null;
        if (vendState) {
          win.postMessage({ type: 'restoreState', state: { proyVend: vendState.proyVend, sucOrder: vendState.sucOrder } }, '*');
        }
        win.postMessage({ type: 'setRole', isAdmin }, '*');
        if (csvText) win.postMessage({ type: 'csvData', text: csvText, name: csvName }, '*');
        if (maestroCsvText) win.postMessage({ type: 'maestroData', text: maestroCsvText, name: maestroCsvName }, '*');
        return;
      }

      if (e.data.type === 'saveState' && e.data.report === 'creditos') {
        await saveReportState('creditos', e.data.state);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onGoConsole, csvText, csvName, maestroCsvText, maestroCsvName, isAdmin]);

  // Si el CSV de ventas llega después de que el iframe ya cargó
  useEffect(() => {
    if (csvText && loaded && frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.postMessage(
        { type: 'csvData', text: csvText, name: csvName }, '*'
      );
    }
  }, [csvText, csvName, loaded]);

  // Si el Maestro de Clientes llega o cambia después de que el iframe ya cargó
  useEffect(() => {
    if (maestroCsvText && loaded && frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.postMessage(
        { type: 'maestroData', text: maestroCsvText, name: maestroCsvName }, '*'
      );
    }
  }, [maestroCsvText, maestroCsvName, loaded]);

  return (
    <div className="suc-frame-wrap">
      <iframe ref={frameRef} src="about:blank" title="Reporte Créditos" />
    </div>
  );
}
