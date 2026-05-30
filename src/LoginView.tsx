import { useState } from 'react';
import { signIn } from './lib/supabase';

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      onLogin();
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1C3A6B',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Topbar igual que los reportes ── */}
      <div style={{
        background: '#1C3A6B',
        borderBottom: '1px solid rgba(255,255,255,.1)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <div style={{
              background: '#F5C518', color: '#1C3A6B',
              fontSize: '13px', fontWeight: 700,
              padding: '5px 12px', borderRadius: '4px', letterSpacing: '.8px',
            }}>AUTO CENTRO</div>
            <div style={{ color: '#8fa8cc', fontSize: '10px', marginTop: '3px' }}>
              Para autos... lo más completo
            </div>
          </div>
          <div style={{
            color: '#e8f0fb', fontSize: '16px', fontWeight: 700,
            borderLeft: '2px solid rgba(255,255,255,.25)',
            paddingLeft: '14px', marginLeft: '4px', letterSpacing: '.2px',
          }}>
            Centro de Reportes · Cumplimiento de Meta
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#27ae60' }} />
          <span style={{ color: '#8fa8cc', fontSize: '10.5px' }}>3 de 3 reportes activos</span>
        </div>
      </div>

      {/* ── Date bar ── */}
      <div style={{
        background: '#162e57',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        padding: '7px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#8fa8cc', fontSize: '11px' }}>Acceso al portal</span>
          <div style={{
            background: '#F5C518', color: '#1C3A6B',
            fontSize: '13px', fontWeight: 800,
            padding: '3px 14px', borderRadius: '6px',
          }}>
            {new Date().toLocaleDateString('es-PA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <span style={{ color: '#5a7a9a', fontSize: '10.5px' }}>Ingrese sus credenciales para continuar</span>
      </div>

      {/* ── Cuerpo ── */}
      <div style={{
        flex: 1,
        background: '#F0F2F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Card */}
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(28,58,107,.12)',
          }}>

            {/* Header de la card — estilo KPI strip */}
            <div style={{
              background: '#1C3A6B',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '48px', height: '48px',
                background: 'rgba(245,197,24,.15)',
                border: '1px solid rgba(245,197,24,.3)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
              }}>🔐</div>
              <div>
                <div style={{ color: '#F5C518', fontSize: '15px', fontWeight: 800, letterSpacing: '.2px' }}>
                  Iniciar sesión
                </div>
                <div style={{ color: '#8fa8cc', fontSize: '11px', marginTop: '2px' }}>
                  Acceso restringido · Solo usuarios autorizados
                </div>
              </div>
            </div>

            {/* Info chips — estilo info-bar de los reportes */}
            <div style={{
              background: '#162e57',
              padding: '7px 24px',
              display: 'flex', gap: '16px', flexWrap: 'wrap',
            }}>
              {[
                { icon: '📊', label: 'Sucursal', color: '#F5C518' },
                { icon: '🔧', label: 'Taller', color: '#F5C518' },
                { icon: '👤', label: 'Vendedor', color: '#F5C518' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px' }}>{item.icon}</span>
                  <span style={{ fontSize: '10.5px', color: '#8fa8cc' }}>
                    Reporte <strong style={{ color: item.color }}>{item.label}</strong>
                  </span>
                </div>
              ))}
            </div>

            {/* Formulario */}
            <div style={{ padding: '28px 24px 24px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 700,
                    color: '#1C3A6B', textTransform: 'uppercase', letterSpacing: '.5px',
                  }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@autocentro.com"
                    required
                    autoFocus
                    style={{
                      background: '#F0F2F5',
                      border: '1px solid #d0d8e8',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: '#1C3A6B',
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'border-color .15s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#F5C518'}
                    onBlur={e => e.target.style.borderColor = '#d0d8e8'}
                  />
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 700,
                    color: '#1C3A6B', textTransform: 'uppercase', letterSpacing: '.5px',
                  }}>
                    Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        background: '#F0F2F5',
                        border: '1px solid #d0d8e8',
                        borderRadius: '6px',
                        padding: '10px 40px 10px 14px',
                        fontSize: '13px',
                        color: '#1C3A6B',
                        outline: 'none',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#F5C518'}
                      onBlur={e => e.target.style.borderColor = '#d0d8e8'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: '#8090a8', fontSize: '13px', padding: '2px',
                      }}
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: '#fdecea',
                    border: '1px solid #f8bcb3',
                    borderLeft: '4px solid #e05c4b',
                    borderRadius: '6px',
                    padding: '9px 12px',
                    fontSize: '11.5px',
                    color: '#c0392b',
                    fontWeight: 500,
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Botón */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#c9a800' : '#F5C518',
                    color: '#1C3A6B',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    letterSpacing: '.3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px',
                    fontFamily: 'inherit',
                    transition: 'background .15s',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: '14px', height: '14px',
                        border: '2px solid #1C3A6B',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin .7s linear infinite',
                      }} />
                      Verificando...
                    </>
                  ) : (
                    <>Ingresar al portal →</>
                  )}
                </button>

              </form>
            </div>

            {/* Footer de la card */}
            <div style={{
              borderTop: '1px solid #e8ecf4',
              padding: '10px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '10px', color: '#8090a8' }}>
                Auto Centro, S.A. · Portal interno
              </span>
              <span style={{ fontSize: '10px', color: '#27ae60', fontWeight: 600 }}>
                ● Sistema activo
              </span>
            </div>
          </div>

          {/* Nota debajo */}
          <div style={{
            textAlign: 'center', marginTop: '16px',
            fontSize: '10.5px', color: '#8090a8',
          }}>
            Si no tienes acceso, contacta al administrador del sistema
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
