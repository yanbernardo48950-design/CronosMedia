import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Appointment, SupabaseConfig } from '../types';

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  if (!config.url || !config.anonKey) {
    return null;
  }
  const currentKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedConfigKey === currentKey) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });
    cachedConfigKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Erro ao inicializar Supabase Client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  config: SupabaseConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.url || !config.anonKey) {
    return {
      success: false,
      message: 'URL e Anon Key do Supabase são obrigatórios para conexão.',
    };
  }

  try {
    const client = getSupabaseClient(config);
    if (!client) {
      return { success: false, message: 'Falha ao instanciar o cliente Supabase.' };
    }

    // Try a ping to the rest endpoint or query table if exists
    const { error } = await client.from('appointments').select('id').limit(1);

    if (error) {
      // If table does not exist yet (code 42P01), connection to Supabase was still authentic!
      if (error.code === '42P01' || error.message.includes('relation "appointments" does not exist')) {
        return {
          success: true,
          message: 'Conectado com sucesso ao Supabase! (Tabela "appointments" precisa ser criada no SQL Editor).',
        };
      }
      return {
        success: false,
        message: `Erro na consulta ao Supabase: ${error.message} (${error.code || 'sem código'})`,
      };
    }

    return {
      success: true,
      message: 'Conexão com Supabase validada e tabela "appointments" detectada!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro de rede ou credenciais inválidas: ${err?.message || 'Falha na conexão'}`,
    };
  }
}

export async function syncAppointmentsToSupabase(
  appointments: Appointment[],
  config: SupabaseConfig
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return {
      success: false,
      count: 0,
      error: 'Supabase não configurado. Adicione a URL e a Anon Key nas configurações.',
    };
  }

  try {
    const payload = appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      description: apt.description,
      date: apt.date,
      start_time: apt.startTime,
      end_time: apt.endTime,
      category: apt.category,
      status: apt.status,
      location: apt.location,
      client_name: apt.clientName,
      client_email: apt.clientEmail,
      media: apt.media,
      github_sync: apt.githubSync,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client
      .from('appointments')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      return {
        success: false,
        count: 0,
        error: error.message,
      };
    }

    return {
      success: true,
      count: appointments.length,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: err?.message || 'Falha inesperada ao sincronizar com Supabase',
    };
  }
}

export async function fetchAppointmentsFromSupabase(
  config: SupabaseConfig
): Promise<{ success: boolean; data?: Appointment[]; error?: string }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { success: false, error: 'Supabase não conectado' };
  }

  try {
    const { data, error } = await client
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const appointments: Appointment[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      category: row.category || 'outro',
      status: row.status || 'agendado',
      location: row.location || '',
      clientName: row.client_name,
      clientEmail: row.client_email,
      media: Array.isArray(row.media) ? row.media : [],
      githubSync: row.github_sync,
      supabaseSynced: true,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));

    return { success: true, data: appointments };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao buscar do Supabase' };
  }
}

export function getSupabaseSqlSchema(): string {
  return `-- ====================================================
-- SCHEMA DE AGENDAMENTO MULTIMÍDIA (CRONOSMEDIA)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ====================================================

-- 1. Criação da tabela principal de compromissos
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    category TEXT DEFAULT 'outro',
    status TEXT DEFAULT 'agendado',
    location TEXT,
    client_name TEXT,
    client_email TEXT,
    media JSONB DEFAULT '[]'::jsonb,
    github_sync JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acesso permissivas para uso com a chave anon (ou autenticado)
CREATE POLICY "Permitir leitura pública ou anônima"
    ON public.appointments FOR SELECT
    USING (true);

CREATE POLICY "Permitir inserção e atualização"
    ON public.appointments FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Criação do Bucket de Armazenamento para Fotos e Vídeos
INSERT INTO storage.buckets (id, name, public)
VALUES ('appointment-media', 'appointment-media', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Política de acesso ao Bucket de Mídia
CREATE POLICY "Permitir upload de mídia multimídia"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'appointment-media');

CREATE POLICY "Permitir leitura pública de fotos e vídeos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'appointment-media');

-- 6. Índice de busca por data
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (date);
`;
}
