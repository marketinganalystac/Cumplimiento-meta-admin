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
}

export default function ConsoleView({
  onOpenTaller, onOpenSucursal, onOpenVendedor, onOpenPending,
  portalCSVText, portalCSVName, onCSVLoad, csvLoading
}: ConsoleViewProps) {
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [csvLabel, setCsvLabel] = useState('Cargar Data General');
  const [dateChip, setDateChip] = useState('');
  const [period, setPeriod] = useState('—');

  useEffect(() => {
    const hoy = new Date();
    const mes = hoy.toLocaleDateString('es-PA', { month: 'long', year: 'numeric' });
    const formatted = mes.charAt(0).toUpperCase() + mes.slice(1);
    setDateChip(formatted);
    setPeriod(formatted);
  }, []);

  // Reflejar cuando el CSV se restauró desde Supabase
  useEffect(() => {
    if (portalCSVName && !csvLoading) {
      setCsvLoaded(true);
      setCsvLabel(portalCSVName);
    }
  }, [portalCSVName, csvLoading]);

  function handleCSV(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target!.result as string;
      onCSVLoad(text, file.name);
      setCsvLoaded(true);
      setCsvLabel(file.name);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27ae60' }}></div>
          <span style={{ color: '#8fa8cc', fontSize: '10.5px' }}>3 de 3 reportes activos</span>
        </div>
      </div>

      <div className="ac-subtitle-bar">
        <span className="ac-subtitle">Seleccione el reporte que desea administrar</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="csv-chip"
            onClick={() => csvInputRef.current?.click()}
            title="Cargar Data General (CSV)"
            disabled={csvLoading}
          >
            <span className={`csv-dot${csvLoaded ? ' ok' : ''}`}></span>
            <i className="fas fa-upload"></i>
            <span>{csvLoading ? 'Cargando...' : csvLabel}</span>
          </button>
          <input
            type="file"
            ref={csvInputRef}
            className="csv-chip-input"
            accept=".csv,.txt"
            onChange={(e) => handleCSV(e.target as HTMLInputElement)}
          />
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
          <div>
            <div className="ac-footer-label">Reportes activos</div>
            <div className="ac-footer-val">3 / 3</div>
          </div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>🗓️</div>
          <div>
            <div className="ac-footer-label">Período en curso</div>
            <div className="ac-footer-val">{period}</div>
          </div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>🏢</div>
          <div>
            <div className="ac-footer-label">Sucursales</div>
            <div className="ac-footer-val">13 registradas</div>
          </div>
        </div>
        <div className="ac-footer-card">
          <div style={{ fontSize: '18px' }}>📊</div>
          <div>
            <div className="ac-footer-label">Fuente de datos</div>
            <div className="ac-footer-val">{csvLoaded ? '✓ CSV cargado' : 'CSV upload'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
