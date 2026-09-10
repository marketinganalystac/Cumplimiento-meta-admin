import { useState, useEffect } from 'react';
import LoginView from './LoginView';
import ConsoleView from './ConsoleView';
import TallerView from './TallerView';
import PendingView from './PendingView';
import SucursalView from './SucursalView';
import VendedorView from './VendedorView';
import CreditosView from './CreditosView';
import { saveCSV, loadCSV, getSession, signOut, isAdmin, supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

type ViewName = 'console' | 'taller' | 'pending' | 'sucursal' | 'vendedor' | 'creditos';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<ViewName>('console');
  const [pendingInfo, setPendingInfo] = useState({ nombre: '', num: 0 });

  // CSV general
  const [portalCSVText, setPortalCSVText] = useState<string | null>(null);
  const [portalCSVName, setPortalCSVName] = useState<string | null>(null);
  const [portalCSVUpdatedAt, setPortalCSVUpdatedAt] = useState<string | null>(null);
  const [csvLoading, setCsvLoading] = useState(true);

  // CSV Taller
  const [tallerCSVText, setTallerCSVText] = useState<string | null>(null);
  const [tallerCSVName, setTallerCSVName] = useState<string | null>(null);
  const [tallerCSVUpdatedAt, setTallerCSVUpdatedAt] = useState<string | null>(null);
  const [tallerCsvLoading, setTallerCsvLoading] = useState(true);

  // CSV Maestro Clientes (Créditos)
  const [maestroCSVText, setMaestroCSVText] = useState<string | null>(null);
  const [maestroCSVName, setMaestroCSVName] = useState<string | null>(null);
  const [maestroCSVUpdatedAt, setMaestroCSVUpdatedAt] = useState<string | null>(null);
  const [maestroCsvLoading, setMaestroCsvLoading] = useState(true);

  // ── Verificar sesión al iniciar ──────────────────────────────
  useEffect(() => {
    getSession().then(session => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Cargar CSVs desde Supabase cuando hay sesión ─────────────
  useEffect(() => {
    if (!user) return;
    Promise.all([
      loadCSV('portal_csv').then(saved => {
        if (saved?.text) { setPortalCSVText(saved.text); setPortalCSVName(saved.name); setPortalCSVUpdatedAt(saved.updatedAt); }
      }),
      loadCSV('taller_csv').then(saved => {
        if (saved?.text) { setTallerCSVText(saved.text); setTallerCSVName(saved.name); setTallerCSVUpdatedAt(saved.updatedAt); }
      }),
      loadCSV('maestro_csv').then(saved => {
        if (saved?.text) { setMaestroCSVText(saved.text); setMaestroCSVName(saved.name); setMaestroCSVUpdatedAt(saved.updatedAt); }
      }),
    ]).finally(() => {
      setCsvLoading(false);
      setTallerCsvLoading(false);
      setMaestroCsvLoading(false);
    });
  }, [user]);

  function goConsole() { setView('console'); window.scrollTo(0, 0); }
  function openTaller() { setView('taller'); window.scrollTo(0, 0); }
  function openSucursal() { setView('sucursal'); window.scrollTo(0, 0); }
  function openVendedor() { setView('vendedor'); window.scrollTo(0, 0); }
  function openCreditos() { setView('creditos'); window.scrollTo(0, 0); }
  function openPending(nombre: string, num: number) {
    setPendingInfo({ nombre, num });
    setView('pending');
    window.scrollTo(0, 0);
  }

  async function handleCSVLoad(text: string, name: string) {
    setPortalCSVText(text); setPortalCSVName(name);
    const updatedAt = await saveCSV('portal_csv', text, name);
    setPortalCSVUpdatedAt(updatedAt);
  }

  async function handleTallerCSVLoad(text: string, name: string) {
    setTallerCSVText(text); setTallerCSVName(name);
    const updatedAt = await saveCSV('taller_csv', text, name);
    setTallerCSVUpdatedAt(updatedAt);
  }

  async function handleMaestroCSVLoad(text: string, name: string) {
    setMaestroCSVText(text); setMaestroCSVName(name);
    const updatedAt = await saveCSV('maestro_csv', text, name);
    setMaestroCSVUpdatedAt(updatedAt);
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setView('console');
  }

  // ── Estados de carga y auth ──────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0d1117', color: '#8fa8cc', fontSize: '14px', gap: '10px'
      }}>
        <div style={{
          width: '18px', height: '18px', border: '2px solid #F5C518',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        Verificando sesión...
      </div>
    );
  }

  if (!user) return <LoginView onLogin={() => {}} />;

  const admin = isAdmin(user);

  return (
    <div>
      <div style={{ display: view === 'console' ? 'block' : 'none' }}>
        <ConsoleView
          onOpenTaller={openTaller}
          onOpenSucursal={openSucursal}
          onOpenVendedor={openVendedor}
          onOpenCreditos={openCreditos}
          onOpenPending={openPending}
          portalCSVText={portalCSVText}
          portalCSVName={portalCSVName}
          portalCSVUpdatedAt={portalCSVUpdatedAt}
          onCSVLoad={handleCSVLoad}
          csvLoading={csvLoading}
          tallerCSVName={tallerCSVName}
          tallerCSVUpdatedAt={tallerCSVUpdatedAt}
          onTallerCSVLoad={handleTallerCSVLoad}
          tallerCsvLoading={tallerCsvLoading}
          maestroCSVName={maestroCSVName}
          maestroCSVUpdatedAt={maestroCSVUpdatedAt}
          onMaestroCSVLoad={handleMaestroCSVLoad}
          maestroCsvLoading={maestroCsvLoading}
          isAdmin={admin}
          userEmail={user.email ?? ''}
          onLogout={handleLogout}
        />
      </div>
      <div style={{ display: view === 'taller' ? 'block' : 'none' }}>
        <TallerView
          onGoConsole={goConsole}
          active={view === 'taller'}
          csvText={tallerCSVText}
          csvName={tallerCSVName}
          isAdmin={admin}
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
          isAdmin={admin}
        />
      </div>
      <div style={{ display: view === 'vendedor' ? 'block' : 'none' }}>
        <VendedorView
          onGoConsole={goConsole}
          csvText={portalCSVText}
          csvName={portalCSVName}
          active={view === 'vendedor'}
          isAdmin={admin}
        />
      </div>
      <div style={{ display: view === 'creditos' ? 'block' : 'none' }}>
        <CreditosView
          onGoConsole={goConsole}
          csvText={portalCSVText}
          csvName={portalCSVName}
          maestroCsvText={maestroCSVText}
          maestroCsvName={maestroCSVName}
          active={view === 'creditos'}
          isAdmin={admin}
        />
      </div>
    </div>
  );
}
