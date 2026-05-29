-- ================================================================
--  AUTO CENTRO · Portal de Reportes
--  Script de configuración Supabase
--  Ejecutar en: https://supabase.com/dashboard → SQL Editor
-- ================================================================

-- ── 1. Tabla: csv_data ──────────────────────────────────────────
--  Guarda el CSV del portal (Data General).
--  Solo hay 1 registro: id = 'portal_csv'

create table if not exists csv_data (
  id          text primary key,          -- siempre 'portal_csv'
  text        text        not null,      -- contenido CSV completo
  name        text        not null,      -- nombre del archivo
  updated_at  timestamptz default now()
);

-- ── 2. Tabla: report_state ──────────────────────────────────────
--  Guarda el estado JSON de cada reporte.
--  3 registros: 'taller', 'sucursal', 'vendedor'

create table if not exists report_state (
  id          text primary key,          -- 'taller' | 'sucursal' | 'vendedor'
  state       jsonb       not null,      -- estado completo serializado
  updated_at  timestamptz default now()
);

-- ── 3. Políticas RLS (acceso anon mientras no hay auth) ─────────

-- Habilitar RLS en ambas tablas
alter table csv_data    enable row level security;
alter table report_state enable row level security;

-- Permitir todo a anon (cambiar a 'authenticated' cuando agregues login)
create policy "anon_all_csv"
  on csv_data for all
  to anon
  using (true)
  with check (true);

create policy "anon_all_report_state"
  on report_state for all
  to anon
  using (true)
  with check (true);

-- ── Verificación ────────────────────────────────────────────────
-- Después de ejecutar, deberías ver las 2 tablas:
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('csv_data', 'report_state');
