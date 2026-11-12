import React from 'react';
import {
  Calendar,
  Clock,
  List,
  Database,
  GitBranch,
  Rocket,
  Image as ImageIcon,
  Video as VideoIcon,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CalendarViewMode, IntegrationsConfig, Appointment } from '../types';

interface SidebarProps {
  currentView: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  onOpenIntegrations: () => void;
  appointments: Appointment[];
  integrationsConfig: IntegrationsConfig;
  onResetSeedData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onOpenIntegrations,
  appointments,
  integrationsConfig,
  onResetSeedData,
}) => {
  const totalCount = appointments.length;
  const photoCount = appointments.reduce(
    (acc, apt) => acc + apt.media.filter((m) => m.type === 'image').length,
    0
  );
  const videoCount = appointments.reduce(
    (acc, apt) => acc + apt.media.filter((m) => m.type === 'video').length,
    0
  );

  return (
    <aside className="w-full lg:w-64 space-y-5 shrink-0">
      {/* Navigation View Switcher */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xs space-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1 block">
          Visualização
        </span>

        <button
          onClick={() => onViewChange('month')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
            currentView === 'month'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-500" />
          Calendário Mensal
        </button>

        <button
          onClick={() => onViewChange('week')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
            currentView === 'week'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-4 h-4 text-indigo-500" />
          Grade Semanal
        </button>

        <button
          onClick={() => onViewChange('agenda')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
            currentView === 'agenda'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <List className="w-4 h-4 text-indigo-500" />
          Registros e Mídias
        </button>
      </div>

      {/* Multimedia Statistics Strip */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
          Métricas Multimídia
        </span>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800">
            <span className="block text-base font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
              {totalCount}
            </span>
            <span className="text-[10px] text-neutral-500">Agendados</span>
          </div>

          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800">
            <span className="block text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {photoCount}
            </span>
            <span className="text-[10px] text-neutral-500 flex items-center justify-center gap-0.5">
              <ImageIcon className="w-2.5 h-2.5" /> Fotos
            </span>
          </div>

          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800">
            <span className="block text-base font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {videoCount}
            </span>
            <span className="text-[10px] text-neutral-500 flex items-center justify-center gap-0.5">
              <VideoIcon className="w-2.5 h-2.5" /> Vídeos
            </span>
          </div>
        </div>
      </div>

      {/* Cloud Integrations Status Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Integrações
          </span>
          <button
            onClick={onOpenIntegrations}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Configurar
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {/* Supabase row */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800/60">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                Supabase
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                integrationsConfig.supabase.connected
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {integrationsConfig.supabase.connected ? 'Online' : 'Local'}
            </span>
          </div>

          {/* GitHub row */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800/60">
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                GitHub
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                integrationsConfig.github.connected
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {integrationsConfig.github.connected ? 'Pronto' : 'Setup'}
            </span>
          </div>

          {/* Vercel row */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800/60">
            <div className="flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                Vercel
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                integrationsConfig.vercel.connected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {integrationsConfig.vercel.connected ? 'Deploy OK' : 'Hook'}
            </span>
          </div>
        </div>
      </div>

      {/* Reset Seed Data */}
      <button
        onClick={onResetSeedData}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Restaurar Dados de Demonstração
      </button>
    </aside>
  );
};
