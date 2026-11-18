import React from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import { CalendarViewMode, IntegrationsConfig } from '../types';

interface HeaderProps {
  currentView: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  onNewAppointment: () => void;
  onOpenIntegrations: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  integrationsConfig: IntegrationsConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onNewAppointment,
  onOpenIntegrations,
  isDark,
  onToggleTheme,
  integrationsConfig,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onViewChange('calendar')}
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
        >
          CronosMedia
        </button>

        {/* Zone 2: Concise navigation */}
        <nav className="flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => onViewChange('calendar')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'calendar'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : ''
            }`}
          >
            Calendário
          </button>

          <button
            onClick={() => onViewChange('list')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-neutral-900 dark:hover:text-white ${
              currentView === 'list'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                : ''
            }`}
          >
            Registros
          </button>

          <button
            onClick={onOpenIntegrations}
            className="flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <span>Integrações</span>
            {(integrationsConfig.supabase.connected ||
              integrationsConfig.github.connected ||
              integrationsConfig.vercel.connected) && (
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                (Ativo)
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Theme & Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Alternar tema claro e escuro"
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          <button
            onClick={onNewAppointment}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Agendar
          </button>
        </div>
      </div>
    </header>
  );
};
