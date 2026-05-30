import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nyxlnnvtuwwueumohxps.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eGxubnZ0dXd3dWV1bW9oeHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODU4NzYsImV4cCI6MjA5Mjk2MTg3Nn0.Od_LADd9ivOUgzY9Bb-mQ7YE_1OW7EXaBktoGl_ZHjs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Guarda o actualiza un CSV en Supabase por id */
export async function saveCSV(id: string, csvText: string, csvName: string) {
  const { error } = await supabase
    .from('csv_data')
    .upsert({ id, text: csvText, name: csvName, updated_at: new Date().toISOString() });
  if (error) console.error('[supabase] saveCSV:', error.message);
}

/** Lee un CSV guardado en Supabase por id */
export async function loadCSV(id: string): Promise<{ text: string; name: string } | null> {
  const { data, error } = await supabase
    .from('csv_data')
    .select('text, name')
    .eq('id', id)
    .single();
  if (error) { console.warn('[supabase] loadCSV:', error.message); return null; }
  return data as { text: string; name: string };
}

/** Guarda el estado completo de un reporte (JSON) */
export async function saveReportState(reportId: string, state: object) {
  const { error } = await supabase
    .from('report_state')
    .upsert({ id: reportId, state, updated_at: new Date().toISOString() });
  if (error) console.error(`[supabase] saveReportState(${reportId}):`, error.message);
}

/** Lee el estado de un reporte */
export async function loadReportState(reportId: string): Promise<object | null> {
  const { data, error } = await supabase
    .from('report_state')
    .select('state')
    .eq('id', reportId)
    .single();
  if (error) { console.warn(`[supabase] loadReportState(${reportId}):`, error.message); return null; }
  return (data as { state: object }).state;
}
