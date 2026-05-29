import { useState, useEffect } from 'react';
import ConsoleView from './ConsoleView';
import TallerView from './TallerView';
import PendingView from './PendingView';
import SucursalView from './SucursalView';
import VendedorView from './VendedorView';
import { saveCSV, loadCSV } from './lib/supabase';

type ViewName = 'console' | 'taller' | 'pending' | 'sucursal' | 'vendedor';

export default function App() {
  const [view, setView] = useState<ViewName>('console');
  const [pendingInfo, setPendingInfo] = useState({ nombre: '', num: 0 });
  const [portalCSVText, setPortalCSVText] = useState<string | null>(null);
  const [portalCSVName, setPortalCSVName] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(true);

  // ── Al iniciar: restaurar CSV desde Supabase ──────────────────
  useEffect(() => {
    loadCSV().then(saved => {
      if (saved?.text && saved?.name) {
        setPortalCSVText(saved.text);
        setPortalCSVName(saved.name);
      }
    }).finally(() => setCsvLoading(false));
  }, []);

  function goConsole() {
    setView('console');
    window.scrollTo(0, 0);
  }

  function openTaller() {
    setView('taller');
    window.scrollTo(0, 0);
  }

  function openSucursal() {
    setView('sucursal');
    window.scrollTo(0, 0);
  }

  function openVendedor() {
    setView('vendedor');
    window.scrollTo(0, 0);
  }

  function openPending(nombre: string, num: number) {
    setPendingInfo({ nombre, num });
    setView('pending');
    window.scrollTo(0, 0);
  }

  async function handleCSVLoad(text: string, name: string) {
    setPortalCSVText(text);
    setPortalCSVName(name);
    // Persistir en Supabase
    await saveCSV(text, name);
  }

  return (
    <div>
      <div style={{ display: view === 'console' ? 'block' : 'none' }}>
        <ConsoleView
          onOpenTaller={openTaller}
          onOpenSucursal={openSucursal}
          onOpenVendedor={openVendedor}
          onOpenPending={openPending}
          portalCSVText={portalCSVText}
          portalCSVName={portalCSVName}
          onCSVLoad={handleCSVLoad}
          csvLoading={csvLoading}
        />
      </div>
      <div style={{ display: view === 'taller' ? 'block' : 'none' }}>
        <TallerView onGoConsole={goConsole} active={view === 'taller'} />
      </div>
      <div style={{ display: view === 'pending' ? 'block' : 'none' }}>
        <PendingView
          onGoConsole={goConsole}
          nombre={pendingInfo.nombre}
        />
      </div>
      <div style={{ display: view === 'sucursal' ? 'block' : 'none' }}>
        <SucursalView
          onGoConsole={goConsole}
          csvText={portalCSVText}
          csvName={portalCSVName}
          active={view === 'sucursal'}
        />
      </div>
      <div style={{ display: view === 'vendedor' ? 'block' : 'none' }}>
        <VendedorView
          onGoConsole={goConsole}
          csvText={portalCSVText}
          csvName={portalCSVName}
          active={view === 'vendedor'}
        />
      </div>
    </div>
  );
}
