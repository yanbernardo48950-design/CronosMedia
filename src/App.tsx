import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MonthCalendarView } from './components/MonthCalendarView';
import { WeekCalendarView } from './components/WeekCalendarView';
import { AgendaListView } from './components/AgendaListView';
import { AppointmentModal } from './components/AppointmentModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { IntegrationsModal } from './components/IntegrationsModal';
import { INITIAL_APPOINTMENTS } from './data/seedAppointments';
import { Appointment, CalendarViewMode, IntegrationsConfig, MediaAttachment } from './types';
import { syncAppointmentsToSupabase } from './services/supabaseService';
import { exportAppointmentToGitHubIssue } from './services/githubService';

const APPOINTMENTS_STORAGE_KEY = 'cronosmedia_appointments_v1';
const INTEGRATIONS_STORAGE_KEY = 'cronosmedia_integrations_v1';
const THEME_STORAGE_KEY = 'cronosmedia_theme_v1';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) return saved === 'dark';
    return true; // Default to dark for high-tech media aesthetic
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar agendamentos do localStorage:', e);
    }
    return INITIAL_APPOINTMENTS;
  });

  // Save appointments to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }, [appointments]);

  // Integrations config state
  const [integrationsConfig, setIntegrationsConfig] = useState<IntegrationsConfig>(() => {
    try {
      const saved = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      supabase: {
        url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://projeto-exemplo.supabase.co',
        anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
        bucket: 'appointment-media',
        connected: false,
        autoSync: false,
      },
      github: {
        token: '',
        repo: 'empresa/cronosmedia',
        connected: false,
      },
      vercel: {
        token: '',
        deployHookUrl: '',
        connected: false,
      },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(integrationsConfig));
    } catch (e) {}
  }, [integrationsConfig]);

  // View state
  const [currentView, setCurrentView] = useState<CalendarViewMode>('month');

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment> | null>(null);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);

  // Active Lightbox / Player state
  const [activeMediaViewer, setActiveMediaViewer] = useState<{
    list: MediaAttachment[];
    index: number;
    appointmentId?: string;
  } | null>(null);

  // Quick Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open New Appointment Modal
  const handleOpenNewAppointment = (date?: string) => {
    setEditingAppointment({
      date: date || new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      category: 'producao',
      status: 'agendado',
      media: [],
    });
    setIsAppointmentModalOpen(true);
  };

  // Open Edit Appointment Modal
  const handleOpenEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // Save Appointment
  const handleSaveAppointment = async (
    savedApt: Appointment,
    syncToSupabase: boolean,
    exportToGitHub: boolean
  ) => {
    let updatedApt = { ...savedApt };

    // Export to GitHub if requested
    if (exportToGitHub && integrationsConfig.github.repo) {
      showToast('Exportando para GitHub Issues...');
      const ghRes = await exportAppointmentToGitHubIssue(updatedApt, integrationsConfig.github);
      if (ghRes.success) {
        updatedApt.githubSync = {
          issueNumber: ghRes.issueNumber,
          issueUrl: ghRes.issueUrl,
          repo: integrationsConfig.github.repo,
          syncedAt: new Date().toISOString(),
        };
        showToast(`Exportado como GitHub Issue #${ghRes.issueNumber}!`);
      }
    }

    // Update in state
    setAppointments((prev) => {
      const index = prev.findIndex((a) => a.id === updatedApt.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = updatedApt;
        return next;
      }
      return [updatedApt, ...prev];
    });

    showToast(`Compromisso "${updatedApt.title}" salvo com sucesso!`);

    // Sync to Supabase if requested or autoSync is active
    if ((syncToSupabase || integrationsConfig.supabase.autoSync) && integrationsConfig.supabase.url && integrationsConfig.supabase.anonKey) {
      syncAppointmentsToSupabase([updatedApt], integrationsConfig.supabase).then((res) => {
        if (res.success) {
          showToast('Registro sincronizado com o Supabase!');
        }
      });
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    showToast('Compromisso removido.');
  };

  // Preview Media
  const handlePreviewMedia = (mediaList: MediaAttachment[], index: number, appointmentId?: string) => {
    setActiveMediaViewer({
      list: mediaList,
      index,
      appointmentId,
    });
  };

  // Update Media Caption
  const handleUpdateMediaCaption = (mediaId: string, caption: string) => {
    setAppointments((prev) =>
      prev.map((apt) => ({
        ...apt,
        media: apt.media.map((m) => (m.id === mediaId ? { ...m, caption } : m)),
      }))
    );
    showToast('Legenda do arquivo atualizada.');
  };

  // Delete Media
  const handleDeleteMedia = (mediaId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => ({
        ...apt,
        media: apt.media.filter((m) => m.id !== mediaId),
      }))
    );
    showToast('Arquivo de mídia removido.');
  };

  // Quick Export to GitHub
  const handleQuickExportToGitHub = async (apt: Appointment) => {
    if (!integrationsConfig.github.repo) {
      setIsIntegrationsModalOpen(true);
      showToast('Configure o repositório GitHub antes de exportar.');
      return;
    }
    showToast(`Exportando "${apt.title}" para o GitHub...`);
    const res = await exportAppointmentToGitHubIssue(apt, integrationsConfig.github);
    if (res.success) {
      const updated = {
        ...apt,
        githubSync: {
          issueNumber: res.issueNumber,
          issueUrl: res.issueUrl,
          repo: integrationsConfig.github.repo,
          syncedAt: new Date().toISOString(),
        },
      };
      setAppointments((prev) => prev.map((a) => (a.id === apt.id ? updated : a)));
      showToast(`Sucesso! Criada Issue #${res.issueNumber} no GitHub.`);
    } else {
      showToast(`Erro ao exportar: ${res.error}`);
    }
  };

  // Reset seed data
  const handleResetSeedData = () => {
    if (confirm('Restaurar dados de demonstração originais com fotos e vídeos?')) {
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      showToast('Dados de demonstração restaurados.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewAppointment={() => handleOpenNewAppointment()}
        onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        integrationsConfig={integrationsConfig}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            onOpenIntegrations={() => setIsIntegrationsModalOpen(true)}
            appointments={appointments}
            integrationsConfig={integrationsConfig}
            onResetSeedData={handleResetSeedData}
          />

          {/* Center Main View Area */}
          <div className="flex-1 w-full min-w-0">
            {currentView === 'month' && (
              <MonthCalendarView
                appointments={appointments}
                onSelectAppointment={handleOpenEditAppointment}
                onNewAppointment={handleOpenNewAppointment}
                onPreviewMedia={(mediaList, index) => handlePreviewMedia(mediaList, index)}
              />
            )}

            {currentView === 'week' && (
              <WeekCalendarView
                appointments={appointments}
                onSelectAppointment={handleOpenEditAppointment}
                onNewAppointment={handleOpenNewAppointment}
                onPreviewMedia={(mediaList, index) => handlePreviewMedia(mediaList, index)}
              />
            )}

            {currentView === 'agenda' && (
              <AgendaListView
                appointments={appointments}
                onSelectAppointment={handleOpenEditAppointment}
                onNewAppointment={() => handleOpenNewAppointment()}
                onPreviewMedia={(mediaList, index) => handlePreviewMedia(mediaList, index)}
                onDeleteAppointment={handleDeleteAppointment}
                onExportToGitHub={handleQuickExportToGitHub}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        appointment={editingAppointment}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        onPreviewMedia={(list, idx) => handlePreviewMedia(list, idx)}
      />

      {activeMediaViewer && (
        <MediaViewerModal
          mediaList={activeMediaViewer.list}
          initialIndex={activeMediaViewer.index}
          onClose={() => setActiveMediaViewer(null)}
          onUpdateCaption={handleUpdateMediaCaption}
          onDeleteMedia={handleDeleteMedia}
        />
      )}

      <IntegrationsModal
        config={integrationsConfig}
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        onUpdateConfig={setIntegrationsConfig}
        appointments={appointments}
        onImportAppointmentsFromSupabase={(imported) => {
          setAppointments(imported);
          showToast(`${imported.length} compromissos importados do Supabase!`);
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border border-neutral-800 dark:border-neutral-200 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
