export type MediaType = 'image' | 'video';

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  name: string;
  size?: number; // bytes
  mimeType?: string;
  caption?: string;
  duration?: number; // seconds for video
  thumbnail?: string;
  uploadedAt: string;
}

export type LessonCategory =
  | '1_aula'
  | '2_aula'
  | '3_aula'
  | '4_aula'
  | '5_aula';

export type AppointmentCategory =
  | LessonCategory
  | 'reuniao'
  | 'producao'
  | 'vistoria'
  | 'gravacao'
  | 'ensaio'
  | 'cliente'
  | 'outro';

export type SchoolShift = 'vespertino' | 'matutino';

export type AppointmentStatus =
  | 'agendado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado';

export interface Appointment {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  category: AppointmentCategory;
  subject?: string; // Matéria
  teacherName?: string; // Nome do professor
  schoolClass?: string; // Turma (ex: 62.01, 13.01)
  shift?: SchoolShift; // vespertino | matutino
  status: AppointmentStatus;
  location: string;
  clientName?: string;
  clientEmail?: string;
  media: MediaAttachment[];
  githubSync?: {
    issueNumber?: number;
    issueUrl?: string;
    repo?: string;
    syncedAt?: string;
  };
  supabaseSynced?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucket: string;
  connected: boolean;
  lastSyncAt?: string;
  autoSync: boolean;
}

export interface GitHubConfig {
  token: string;
  repo: string; // "owner/repo"
  connected: boolean;
  lastExportAt?: string;
}

export interface VercelConfig {
  token: string;
  projectId?: string;
  deployHookUrl?: string;
  connected: boolean;
  lastDeployment?: {
    id: string;
    url: string;
    state: 'READY' | 'BUILDING' | 'ERROR';
    createdAt: string;
  };
}

export interface IntegrationsConfig {
  supabase: SupabaseConfig;
  github: GitHubConfig;
  vercel: VercelConfig;
}

export type CalendarViewMode = 'calendar' | 'list';
