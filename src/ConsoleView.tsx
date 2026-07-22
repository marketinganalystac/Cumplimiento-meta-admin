import { useRef, useEffect, useState } from 'react';

interface ConsoleViewProps {
  onOpenTaller: () => void;
  onOpenSucursal: () => void;
  onOpenVendedor: () => void;
  onOpenPending: (nombre: string, num: number) => void;
  portalCSVText: string | null;
  portalCSVName: string | null;
  portalCSVUpdatedAt?: string | null;
  onCSVLoad: (text: string, name: string) => void;
  csvLoading?: boolean;
  tallerCSVName: string | null;
  tallerCSVUpdatedAt?: string | null;
  onTallerCSVLoad: (text: string, name: string) => void;
  tallerCsvLoading?: boolean;
  isAdmin: boolean;
  userEmail: string;
  onLogout: () => void;
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ width: '11px', height: '11px', marginRight: '4px', flexShrink: 0, color: '#8fa8cc' }}>
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3 3v6.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ConsoleView({
  onOpenTaller, onOpenSucursal, onOpenVendedor, onOpenPending,
  portalCSVText, portalCSVName, portalCSVUpdatedAt, onCSVLoad, csvLoading,
  tallerCSVName, tallerCSVUpdatedAt, onTallerCSVLoad, tallerCsvLoading,
  isAdmin, userEmail, onLogout,
}: ConsoleViewProps) {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const tallerCsvInputRef = useRef<HTMLInputElement>(null);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [csvLabel, setCsvLabel] = useState('Data General');
  const [csvProgress, setCsvProgress] = useState<number | null>(null); // null = oculto, número = % visible
  const [csvLoadedAt, setCsvLoadedAt] = useState<string | null>(null);
  const [tallerLoaded, setTallerLoaded] = useState(false);
  const [tallerLabel, setTallerLabel] = useState('Data Taller');
  const [tallerProgress, setTallerProgress] = useState<number | null>(null);
  const [tallerLoadedAt, setTallerLoadedAt] = useState<string | null>(null);
  const [dateChip, setDateChip] = useState('');
  const [period, setPeriod] = useState('—');

  useEffect(() => {
    const hoy = new Date();
    const mes = hoy.toLocaleDateString('es-PA', { month: 'long', year: 'numeric' });
    const formatted = mes.charAt(0).toUpperCase() + mes.slice(1);
    setDateChip(formatted);
    setPeriod(formatted);
  }, []);

  // Formatea un timestamp ISO (guardado en Supabase) a fecha + hora corta,
  // ej. "22 jul, 2:45 p.m."
  function formatTimestamp(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const fecha = d.toLocaleDateString('es-PA', { day: 'numeric', month: 'short' });
    const hora = d.toLocaleTimeString('es-PA', { hour: 'numeric', minute: '2-digit' });
    return `${fecha}, ${hora}`;
  }

  useEffect(() => {
    // Si la data ya viene cargada (sesión persistida / otro admin la subió antes),
    // usamos el updatedAt real guardado en Supabase en vez de inventar una hora.
    // La hora "en vivo" (horaActual()) solo se usa cuando la carga ocurre ahora mismo, vía handleCSV.
    if (portalCSVName && !csvLoading) {
      setCsvLoaded(true);
      setCsvLabel(portalCSVName);
      const formatted = formatTimestamp(portalCSVUpdatedAt);
      if (formatted) setCsvLoadedAt(formatted);
    }
  }, [portalCSVName, portalCSVUpdatedAt, csvLoading]);

  useEffect(() => {
    if (tallerCSVName && !tallerCsvLoading) {
      setTallerLoaded(true);
      setTallerLabel(tallerCSVName);
      const formatted = formatTimestamp(tallerCSVUpdatedAt);
      if (formatted) setTallerLoadedAt(formatted);
    }
  }, [tallerCSVName, tallerCSVUpdatedAt, tallerCsvLoading]);

  // Intenta UTF-8 estricto primero; si el archivo no es UTF-8 válido
  // (típico de exportaciones desde Excel/sistemas en español que usan
  // Windows-1252 / Latin-1), reintenta con esa codificación. Esto evita
  // que tildes como "í" o "é" se corrompan en "�" (ej. "Vía Tocumen",
  // "Chitré", "Vía Porras").
  function decodeFileBuffer(buffer: ArrayBuffer): string {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
      return new TextDecoder('windows-1252').decode(buffer);
    }
  }

  // Fecha + hora local corta para mostrar "última carga": ej. "22 jul, 2:45 p.m."
  function horaActual(): string {
    return formatTimestamp(new Date().toISOString())!;
  }

  function handleCSV(input: HTMLInputElement, isTaller: boolean) {
    const file = input.files?.[0];
    if (!file) return;
    const setProgress = isTaller ? setTallerProgress : setCsvProgress;
    setProgress(0);
    const reader = new FileReader();

    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        // Etapa 1 — lectura real del archivo: 0% → 60%
        const pct = (evt.loaded / evt.total) * 60;
        setProgress(pct);
      }
    };

    reader.onload = function(e) {
      // Etapa 2 — el padre procesa el CSV (no nos reporta avance real),
      // así que avanzamos suavemente hasta 95% mientras se espera la respuesta.
      setProgress(70);
      const ramp = setInterval(() => {
        setProgress((p) => (p !== null && p < 95 ? p + 3 : p));
      }, 120);

      const text = decodeFileBuffer(e.target!.result as ArrayBuffer);
      if (isTaller) {
        onTallerCSVLoad(text, file.name);
        setTallerLoaded(true);
        setTallerLabel(file.name);
        setTallerLoadedAt(horaActual());
      } else {
        onCSVLoad(text, file.name);
        setCsvLoaded(true);
        setCsvLabel(file.name);
        setCsvLoadedAt(horaActual());
      }

      // Pequeño margen para que el usuario perciba el 100% antes de ocultar la barra.
      setTimeout(() => {
        clearInterval(ramp);
        setProgress(100);
        setTimeout(() => setProgress(null), 500);
      }, 250);
    };

    reader.onerror = () => { setProgress(null); };

    reader.readAsArrayBuffer(file);
    input.value = '';
  }

  return (
    <div className="ac-wrap">
      <div className="ac-topbar">
        <div className="ac-brand">
          <div>
            <div className="ac-badge">AUTO CENTRO</div>
            <div className="ac-tag">Para autos... lo más completo</div>
          </div>
          <div className="ac-section">Centro de reportes · Cumplimiento de meta</div>
        </div>
        {/* Info de sesión y logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: isAdmin ? 'rgba(245,197,24,.15)' : 'rgba(99,130,170,.15)',
              border: `1px solid ${isAdmin ? 'rgba(245,197,24,.4)' : 'rgba(99,130,170,.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px'
            }}>
              {isAdmin ? '👑' : '👤'}
            </div>
            <div>
              <div style={{ fontSize: '10px', color: isAdmin ? '#F5C518' : '#8fa8cc', fontWeight: 600 }}>
                {isAdmin ? 'Administrador' : 'Viewer'}
              </div>
              <div style={{ fontSize: '9px', color: '#5a7a9a' }}>{userEmail}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            background: 'none', border: '1px solid rgba(99,130,170,.3)', borderRadius: '6px',
            color: '#5a7a9a', fontSize: '10px', padding: '4px 8px', cursor: 'pointer',
          }}>
            Salir
          </button>
        </div>
      </div>

      <div className="ac-subtitle-bar">
        <span className="ac-subtitle">Seleccione el reporte que desea administrar</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

          {/* Botones CSV — solo visibles para admin */}
          {isAdmin && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button className="csv-chip" onClick={() => csvInputRef.current?.click()}
                  title="Cargar Data General — Sucursal y Vendedor" disabled={csvLoading}>
                  <span className={`csv-dot${csvLoaded ? ' ok' : ''}`}></span>
                  <i className="fas fa-upload"></i>
                  <span>{csvLoading ? 'Cargando...' : csvLabel}</span>
                </button>
                {csvProgress !== null && (
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,.12)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      width: `${Math.min(100, csvProgress)}%`,
                      background: 'linear-gradient(90deg,#F5C518,#27ae60)',
                      transition: 'width .15s ease-out',
                    }} />
                  </div>
                )}
              </div>
              <input type="file" ref={csvInputRef} className="csv-chip-input" accept=".csv,.txt"
                onChange={(e) => handleCSV(e.target as HTMLInputElement, false)} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button className="csv-chip" onClick={() => tallerCsvInputRef.current?.click()}
                  title="Cargar Data Taller" disabled={tallerCsvLoading}
                  style={{ borderColor: tallerLoaded ? 'rgba(39,174,96,.5)' : undefined }}>
                  <span className={`csv-dot${tallerLoaded ? ' ok' : ''}`}></span>
                  <i className="fas fa-upload"></i>
                  <span>{tallerCsvLoading ? 'Cargando...' : tallerLabel}</span>
                </button>
                {tallerProgress !== null && (
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,.12)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      width: `${Math.min(100, tallerProgress)}%`,
                      background: 'linear-gradient(90deg,#F5C518,#27ae60)',
                      transition: 'width .15s ease-out',
                    }} />
                  </div>
                )}
              </div>
              <input type="file" ref={tallerCsvInputRef} className="csv-chip-input" accept=".csv,.txt"
                onChange={(e) => handleCSV(e.target as HTMLInputElement, true)} />
            </>
          )}

          {/* Viewer: solo indicadores de estado sin botón */}
          {!isAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{
                fontSize: '10px', padding: '4px 10px', borderRadius: '20px',
                background: csvLoaded ? 'rgba(39,174,96,.1)' : 'rgba(90,120,150,.1)',
                border: `1px solid ${csvLoaded ? 'rgba(39,174,96,.3)' : 'rgba(90,120,150,.2)'}`,
                color: csvLoaded ? '#27ae60' : '#5a7a9a',
              }}>
                {csvLoaded ? '✓ Data General' : '○ Sin data general'}
              </span>
              <span style={{
                fontSize: '10px', padding: '4px 10px', borderRadius: '20px',
                background: tallerLoaded ? 'rgba(39,174,96,.1)' : 'rgba(90,120,150,.1)',
                border: `1px solid ${tallerLoaded ? 'rgba(39,174,96,.3)' : 'rgba(90,120,150,.2)'}`,
                color: tallerLoaded ? '#27ae60' : '#5a7a9a',
              }}>
                {tallerLoaded ? '✓ Data Taller' : '○ Sin data taller'}
              </span>
            </div>
          )}

          <span className="ac-date">{dateChip}</span>
        </div>
      </div>

      <div className="ac-grid">

        {/* SUCURSAL */}
        <div className="ac-card">
          <div className="ac-card-head">
            <div className="ac-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div className="ac-card-title">Cumplimiento de meta<br />· Sucursal</div>
                <div className="ac-order">1</div>
              </div>
              <div className="ac-card-scope">Auto Centro, S.A.</div>
            </div>
          </div>
          <div className="ac-card-body">
            <p className="ac-desc">Vista consolidada por sucursal de todas las líneas de negocio. Proyección, ventas al corte y % de cumplimiento.</p>
            <div className="ac-stats">
              <div className="ac-stat"><TagIcon />13 sucursales</div>
              <div className="ac-stat"><TagIcon />Multi-línea</div>
            </div>
            <div className="ac-status">
              <span className="ac-status-badge st-active">● Activo</span>
              <span style={{ fontSize: '10px', color: '#aab' }}>Reporte existente</span>
            </div>
            <div className="ac-divider"></div>
            <button className="ac-btn" onClick={onOpenSucursal}>Abrir reporte →</button>
          </div>
        </div>

        {/* VENDEDOR */}
        <div className="ac-card">
          <div className="ac-card-head">
            <div className="ac-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div className="ac-card-title">Cumplimiento de meta<br />· Vendedor</div>
                <div className="ac-order">2</div>
              </div>
              <div className="ac-card-scope">Auto Centro, S.A.</div>
            </div>
          </div>
          <div className="ac-card-body">
            <p className="ac-desc">Ranking individual de vendedores por sucursal: cuota asignada, ventas al corte, % cumplimiento y ticket promedio.</p>
            <div className="ac-stats">
              <div className="ac-stat"><TagIcon />Por vendedor</div>
              <div className="ac-stat"><TagIcon />Cuota · Ranking</div>
            </div>
            <div className="ac-status">
              <span className="ac-status-badge st-active">● Activo</span>
              <span style={{ fontSize: '10px', color: '#aab' }}>Reporte existente</span>
            </div>
            <div className="ac-divider"></div>
            <button className="ac-btn" onClick={onOpenVendedor}>Abrir reporte →</button>
          </div>
        </div>

        {/* TALLER */}
        <div className="ac-card">
          <div className="ac-card-head">
            <div className="ac-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2">
                <path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div className="ac-card-title">Cumplimiento de meta<br />· Taller</div>
                <div className="ac-order">3</div>
              </div>
              <div className="ac-card-scope">Auto Centro, S.A.</div>
            </div>
          </div>
          <div className="ac-card-body">
            <p className="ac-desc">Seguimiento de ventas de talleres por sucursal. Proyección, ventas al corte, % cumplimiento y vehículos únicos.</p>
            <div className="ac-stats">
              <div className="ac-stat"><TagIcon />13 sucursales</div>
              <div className="ac-stat"><TagIcon />CSV · Proyección</div>
            </div>
            <div className="ac-status">
              <span className="ac-status-badge st-active">● Activo</span>
              <span style={{ fontSize: '10px', color: '#aab' }}>Reporte existente</span>
            </div>
            <div className="ac-divider"></div>
            <button className="ac-btn" onClick={onOpenTaller}>Abrir reporte →</button>
          </div>
        </div>

      </div>

      <div className="ac-footer">
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>📁</div>
          <div><div className="ac-footer-label">Reportes activos</div><div className="ac-footer-val">3 / 3</div></div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>🗓️</div>
          <div><div className="ac-footer-label">Período en curso</div><div className="ac-footer-val">{period}</div></div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>🏢</div>
          <div><div className="ac-footer-label">Sucursales</div><div className="ac-footer-val">13 registradas</div></div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>📊</div>
          <div>
            <div className="ac-footer-label">Data General</div>
            <div className="ac-footer-val">{csvLoaded ? '✓ Cargado' : 'Pendiente'}</div>
            {csvLoaded && csvLoadedAt && (
              <div style={{ fontSize: '9px', color: '#8090a8', marginTop: '2px' }}>Última carga: {csvLoadedAt}</div>
            )}
          </div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>🔧</div>
          <div>
            <div className="ac-footer-label">Data Taller</div>
            <div className="ac-footer-val">{tallerLoaded ? '✓ Cargado' : 'Pendiente'}</div>
            {tallerLoaded && tallerLoadedAt && (
              <div style={{ fontSize: '9px', color: '#8090a8', marginTop: '2px' }}>Última carga: {tallerLoadedAt}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
