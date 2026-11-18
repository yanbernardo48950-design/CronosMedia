import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  GitBranch,
  Database,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Appointment, MediaAttachment } from '../types';
import {
  LESSON_CATEGORIES,
  VESPERTINO_CLASSES,
  MATUTINO_CLASSES,
  getCategoryLabel,
  getShiftLabel,
} from '../constants/school';

interface AgendaListViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onNewAppointment: () => void;
  onPreviewMedia: (mediaList: MediaAttachment[], index: number) => void;
  onDeleteAppointment: (id: string) => void;
  onExportToGitHub: (appointment: Appointment) => void;
}

export const AgendaListView: React.FC<AgendaListViewProps> = ({
  appointments,
  onSelectAppointment,
  onNewAppointment,
  onPreviewMedia,
  onDeleteAppointment,
  onExportToGitHub,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lessonFilter, setLessonFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos'>('all');

  const filtered = appointments
    .filter((apt) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        apt.title.toLowerCase().includes(search) ||
        apt.description.toLowerCase().includes(search) ||
        (apt.subject && apt.subject.toLowerCase().includes(search)) ||
        (apt.teacherName && apt.teacherName.toLowerCase().includes(search)) ||
        (apt.schoolClass && apt.schoolClass.toLowerCase().includes(search)) ||
        (apt.location && apt.location.toLowerCase().includes(search));

      if (!matchesSearch) return false;

      if (lessonFilter !== 'all' && apt.category !== lessonFilter) {
        return false;
      }

      if (classFilter === 'vespertino' && apt.shift !== 'vespertino') {
        return false;
      }
      if (classFilter === 'matutino' && apt.shift !== 'matutino') {
        return false;
      }
      if (
        classFilter !== 'all' &&
        classFilter !== 'vespertino' &&
        classFilter !== 'matutino' &&
        apt.schoolClass !== classFilter
      ) {
        return false;
      }

      if (mediaFilter === 'photos') {
        return apt.media.some((m) => m.type === 'image');
      }
      if (mediaFilter === 'videos') {
        return apt.media.some((m) => m.type === 'video');
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });

  return (
    <div className="space-y-4">
      {/* Compact Search & Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar matéria, professor ou turma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
              <button
                onClick={() => setMediaFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mediaFilter === 'all'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Todos ({appointments.length})
              </button>
              <button
                onClick={() => setMediaFilter('photos')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mediaFilter === 'photos'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <ImageIcon className="w-3 h-3 text-emerald-500" />
                Fotos
              </button>
              <button
                onClick={() => setMediaFilter('videos')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mediaFilter === 'videos'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <VideoIcon className="w-3 h-3 text-rose-500" />
                Vídeos
              </button>
            </div>

            <button
              onClick={onNewAppointment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Agendar
            </button>
          </div>
        </div>

        {/* Lesson Period & Class Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setLessonFilter('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                lessonFilter === 'all'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Todas Aulas
            </button>
            {LESSON_CATEGORIES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLessonFilter(l.value)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  lessonFilter === l.value
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {l.shortLabel}
              </button>
            ))}
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            aria-label="Filtrar por turma ou turno"
            className="px-2.5 py-1 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas as turmas</option>
            <option value="vespertino">Turno Vespertino (todas)</option>
            <option value="matutino">Turno Matutino (todas)</option>
            <optgroup label="Vespertino">
              {VESPERTINO_CLASSES.map((c) => (
                <option key={c} value={c}>
                  Turma {c} (Vespertino)
                </option>
              ))}
            </optgroup>
            <optgroup label="Matutino">
              {MATUTINO_CLASSES.map((c) => (
                <option key={c} value={c}>
                  Turma {c} (Matutino)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Nenhum agendamento encontrado.
          </p>
          <button
            onClick={onNewAppointment}
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => (
            <div
              key={apt.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-3"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {getCategoryLabel(apt.category)}
                    {apt.schoolClass && (
                      <span>
                        {' '}
                        · Turma {apt.schoolClass}
                        {apt.shift ? ` (${getShiftLabel(apt.shift)})` : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {apt.subject || apt.title}
                    {apt.subject && apt.title && apt.title !== `${apt.subject} · Turma ${apt.schoolClass}` && (
                      <span className="font-normal text-neutral-500 dark:text-neutral-400">
                        {' '}— {apt.title}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    {apt.teacherName && (
                      <>
                        <span className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                          {apt.teacherName}
                        </span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(apt.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.startTime}
                      {apt.endTime ? ` – ${apt.endTime}` : ''}
                    </span>
                    {apt.location && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {apt.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onExportToGitHub(apt)}
                    title="Exportar para GitHub Issues"
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectAppointment(apt)}
                    title="Editar"
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir "${apt.subject || apt.title}"?`)) {
                        onDeleteAppointment(apt.id);
                      }
                    }}
                    title="Excluir"
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {apt.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {apt.description}
                </p>
              )}

              {/* Media Gallery */}
              {apt.media.length > 0 && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {apt.media.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => onPreviewMedia(apt.media, idx)}
                        className="group/thumb relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-indigo-500 transition-all"
                      >
                        {item.type === 'video' ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <VideoIcon className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtle Sync Status */}
              {(apt.supabaseSynced || apt.githubSync?.issueNumber) && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 dark:text-neutral-400">
                  {apt.supabaseSynced && (
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-emerald-500" />
                      Supabase
                    </span>
                  )}
                  {apt.githubSync?.issueNumber && (
                    <a
                      href={apt.githubSync.issueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <GitBranch className="w-3 h-3" />
                      Issue #{apt.githubSync.issueNumber}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
