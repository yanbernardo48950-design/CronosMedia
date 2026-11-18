import React from 'react';
import {
  Database,
  GitBranch,
  Rocket,
  Image as ImageIcon,
  Video as VideoIcon,
  RotateCcw,
} from 'lucide-react';
import { IntegrationsConfig, Appointment } from '../types';

interface SidebarProps {
  onOpenIntegrations: () => void;
  appointments: Appointment[];
  integrationsConfig: IntegrationsConfig;
  onResetSeedData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
    <aside className="w-full lg:w-64 space-y-4 shrink-0">
      {/* Resumo Multimídia */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
          Resumo
        </span>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800">
            <span className="block text-base font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
              {totalCount}
            </span>
            <span className="text-[11px] text-neutral-500">Eventos</span>
          </div>

          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800">
            <span className="block text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {photoCount}
            </span>
            <span className="text-[11px] text-neutral-500 flex items-center justify-center gap-0.5">
              <ImageIcon className="w-2.5 h-2.5" /> Fotos
            </span>
          </div>

          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800">
            <span className="block text-base font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {videoCount}
            </span>
            <span className="text-[11px] text-neutral-500 flex items-center justify-center gap-0.5">
              <VideoIcon className="w-2.5 h-2.5" /> Vídeos
            </span>
          </div>
        </div>
      </div>

      {/* Cloud Integrations Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Nuvem & Deploy
          </span>
          <button
            onClick={onOpenIntegrations}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Configurar
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <button
            type="button"
            onClick={onOpenIntegrations}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                Supabase
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {integrationsConfig.supabase.connected ? 'Conectado' : 'Local'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenIntegrations}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                GitHub
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {integrationsConfig.github.connected ? 'Conectado' : 'Configurar'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenIntegrations}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800/60 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                Vercel
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              {integrationsConfig.vercel.connected ? 'Ativo' : 'Hook'}
            </span>
          </button>
        </div>
      </div>

      {/* Reset Seed Data */}
      <button
        onClick={onResetSeedData}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Restaurar Exemplo
      </button>
    </aside>
  );
};
