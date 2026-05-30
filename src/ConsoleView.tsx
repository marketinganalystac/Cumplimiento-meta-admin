import { useRef, useEffect, useState } from 'react';

interface ConsoleViewProps {
  onOpenTaller: () => void;
  onOpenSucursal: () => void;
  onOpenVendedor: () => void;
  onOpenPending: (nombre: string, num: number) => void;
  portalCSVText: string | null;
  portalCSVName: string | null;
  onCSVLoad: (text: string, name: string) => void;
  csvLoading?: boolean;
  tallerCSVName: string | null;
  onTallerCSVLoad: (text: string, name: string) => void;
  tallerCsvLoading?: boolean;
  isAdmin: boolean;
  userEmail: string;
  onLogout: () => void;
}

export default function ConsoleView({
  onOpenTaller, onOpenSucursal, onOpenVendedor, onOpenPending,
  portalCSVText, portalCSVName, onCSVLoad, csvLoading,
  tallerCSVName, onTallerCSVLoad, tallerCsvLoading,
  isAdmin, userEmail, onLogout,
}: ConsoleViewProps) {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const tallerCsvInputRef = useRef<HTMLInputElement>(null);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [csvLabel, setCsvLabel] = useState('Data General');
  const [tallerLoaded, setTallerLoaded] = useState(false);
  const [tallerLabel, setTallerLabel] = useState('Data Taller');
  const [dateChip, setDateChip] = useState('');
  const [period, setPeriod] = useState('—');

  useEffect(() => {
    const hoy = new Date();
    const mes = hoy.toLocaleDateString('es-PA', { month: 'long', year: 'numeric' });
    const formatted = mes.charAt(0).toUpperCase() + mes.slice(1);
    setDateChip(formatted);
    setPeriod(formatted);
  }, []);

  useEffect(() => {
    if (portalCSVName && !csvLoading) { setCsvLoaded(true); setCsvLabel(portalCSVName); }
  }, [portalCSVName, csvLoading]);

  useEffect(() => {
    if (tallerCSVName && !tallerCsvLoading) { setTallerLoaded(true); setTallerLabel(tallerCSVName); }
  }, [tallerCSVName, tallerCsvLoading]);

  function handleCSV(input: HTMLInputElement, isTaller: boolean) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target!.result as string;
      if (isTaller) { onTallerCSVLoad(text, file.name); setTallerLoaded(true); setTallerLabel(file.name); }
      else { onCSVLoad(text, file.name); setCsvLoaded(true); setCsvLabel(file.name); }
    };
    reader.readAsText(file, 'UTF-8');
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
              <button className="csv-chip" onClick={() => csvInputRef.current?.click()}
                title="Cargar Data General — Sucursal y Vendedor" disabled={csvLoading}>
                <span className={`csv-dot${csvLoaded ? ' ok' : ''}`}></span>
                <i className="fas fa-upload"></i>
                <span>{csvLoading ? 'Cargando...' : csvLabel}</span>
              </button>
              <input type="file" ref={csvInputRef} className="csv-chip-input" accept=".csv,.txt"
                onChange={(e) => handleCSV(e.target as HTMLInputElement, false)} />

              <button className="csv-chip" onClick={() => tallerCsvInputRef.current?.click()}
                title="Cargar Data Taller" disabled={tallerCsvLoading}
                style={{ borderColor: tallerLoaded ? 'rgba(39,174,96,.5)' : undefined }}>
                <span className={`csv-dot${tallerLoaded ? ' ok' : ''}`}></span>
                <i className="fas fa-upload"></i>
                <span>{tallerCsvLoading ? 'Cargando...' : tallerLabel}</span>
              </button>
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
              <div className="ac-stat"><span className="ac-stat-dot dot-gray"></span>13 sucursales</div>
              <div className="ac-stat"><span className="ac-stat-dot dot-gray"></span>Multi-línea</div>
            </div>
            <div className="ac-status">
              <span className="ac-status-badge st-active">● Activo</span>
              <span style={{ fontSize: '10px', color: '#aab' }}>Reporte existente</span>
            </div>
            <div className="ac-divider"></div>
            <button className="ac-btn" onClick={onOpenSucursal}>Abrir reporte →</button>
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
                <div className="ac-order">2</div>
              </div>
              <div className="ac-card-scope">Auto Centro, S.A.</div>
            </div>
          </div>
          <div className="ac-card-body">
            <p className="ac-desc">Seguimiento de ventas de talleres por sucursal. Proyección, ventas al corte, % cumplimiento y vehículos únicos.</p>
            <div className="ac-stats">
              <div className="ac-stat"><span className="ac-stat-dot dot-grn"></span>13 sucursales</div>
              <div className="ac-stat"><span className="ac-stat-dot dot-grn"></span>CSV · Proyección</div>
            </div>
            <div className="ac-status">
              <span className="ac-status-badge st-active">● Activo</span>
              <span style={{ fontSize: '10px', color: '#aab' }}>Reporte existente</span>
            </div>
            <div className="ac-divider"></div>
            <button className="ac-btn" onClick={onOpenTaller}>Abrir reporte →</button>
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
                <div className="ac-order">3</div>
              </div>
              <div className="ac-card-scope">Auto Centro, S.A.</div>
            </div>
          </div>
          <div className="ac-card-body">
            <p className="ac-desc">Ranking individual de vendedores por sucursal: cuota asignada, ventas al corte, % cumplimiento y ticket promedio.</p>
            <div className="ac-stats">
              <div className="ac-stat"><span className="ac-stat-dot dot-gray"></span>Por vendedor</div>
              <div className="ac-stat"><span className="ac-stat-dot dot-gray"></span>Cuota · Ranking</div>
            </div>
            <div className="ac-status">
              <span className="ac-status-badge st-active">● Activo</span>
              <span style={{ fontSize: '10px', color: '#aab' }}>Reporte existente</span>
            </div>
            <div className="ac-divider"></div>
            <button className="ac-btn" onClick={onOpenVendedor}>Abrir reporte →</button>
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
          <div><div className="ac-footer-label">Data General</div><div className="ac-footer-val">{csvLoaded ? '✓ Cargado' : 'Pendiente'}</div></div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>🔧</div>
          <div><div className="ac-footer-label">Data Taller</div><div className="ac-footer-val">{tallerLoaded ? '✓ Cargado' : 'Pendiente'}</div></div>
        </div>
      </div>
    </div>
  );
}
