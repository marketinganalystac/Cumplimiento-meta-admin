interface PendingViewProps {
  onGoConsole: () => void;
  nombre: string;
}

const ICONS: Record<string, string> = {
  'Sucursal': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'Vendedor': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
};

export default function PendingView({ onGoConsole, nombre }: PendingViewProps) {
  const iconPath = ICONS[nombre] || ICONS['Sucursal'];

  return (
    <div className="pending-wrap">
      <div className="ac-topbar">
        <div className="ac-brand">
          <div>
            <div className="ac-badge">AUTO CENTRO</div>
            <div className="ac-tag">Para autos... lo más completo</div>
          </div>
          <div className="ac-section">
            Cumplimiento de meta · {nombre || '—'}
          </div>
        </div>
      </div>
      <div className="pending-body">
        <div className="pending-card">
          <div className="pending-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F5C518"
              strokeWidth="2"
              dangerouslySetInnerHTML={{ __html: iconPath }}
            />
          </div>
          <div className="pending-badge">🚧 En construcción</div>
          <div className="pending-title">Reporte · {nombre || '—'}</div>
          <div className="pending-sub">
            Este reporte aún no ha sido creado. Regrese al portal y solicite la construcción de este reporte para Auto Centro, S.A.
          </div>
          <button className="pending-btn" onClick={onGoConsole}>← Volver al portal</button>
        </div>
      </div>
    </div>
  );
}
