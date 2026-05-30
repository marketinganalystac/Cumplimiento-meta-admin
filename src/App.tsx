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

  // CSV general (Sucursal + Vendedor)
  const [portalCSVText, setPortalCSVText] = useState<string | null>(null);
  const [portalCSVName, setPortalCSVName] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(true);

  // CSV Taller
  const [tallerCSVText, setTallerCSVText] = useState<string | null>(null);
  const [tallerCSVName, setTallerCSVName] = useState<string | null>(null);
  const [tallerCsvLoading, setTallerCsvLoading] = useState(true);

  // Restaurar ambos CSV desde Supabase al iniciar
  useEffect(() => {
    Promise.all([
      loadCSV('portal_csv').then(saved => {
        if (saved?.text) { setPortalCSVText(saved.text); setPortalCSVName(saved.name); }
      }),
      loadCSV('taller_csv').then(saved => {
        if (saved?.text) { setTallerCSVText(saved.text); setTallerCSVName(saved.name); }
      }),
    ]).finally(() => {
      setCsvLoading(false);
      setTallerCsvLoading(false);
    });
  }, []);

  function goConsole() { setView('console'); window.scrollTo(0, 0); }
  function openTaller() { setView('taller'); window.scrollTo(0, 0); }
  function openSucursal() { setView('sucursal'); window.scrollTo(0, 0); }
  function openVendedor() { setView('vendedor'); window.scrollTo(0, 0); }
  function openPending(nombre: string, num: number) {
    setPendingInfo({ nombre, num });
    setView('pending');
    window.scrollTo(0, 0);
  }

  async function handleCSVLoad(text: string, name: string) {
    setPortalCSVText(text);
    setPortalCSVName(name);
    await saveCSV('portal_csv', text, name);
  }

  async function handleTallerCSVLoad(text: string, name: string) {
    setTallerCSVText(text);
    setTallerCSVName(name);
    await saveCSV('taller_csv', text, name);
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
          tallerCSVName={tallerCSVName}
          onTallerCSVLoad={handleTallerCSVLoad}
          tallerCsvLoading={tallerCsvLoading}
        />
      </div>
      <div style={{ display: view === 'taller' ? 'block' : 'none' }}>
        <TallerView
          onGoConsole={goConsole}
          active={view === 'taller'}
          csvText={tallerCSVText}
          csvName={tallerCSVName}
        />
      </div>
      <div style={{ display: view === 'pending' ? 'block' : 'none' }}>
        <PendingView onGoConsole={goConsole} nombre={pendingInfo.nombre} />
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
