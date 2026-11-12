import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  GitBranch,
  Database,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Appointment, AppointmentCategory, MediaAttachment } from '../types';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter appointments
  const filtered = appointments
    .filter((apt) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        apt.title.toLowerCase().includes(search) ||
        apt.description.toLowerCase().includes(search) ||
        (apt.location && apt.location.toLowerCase().includes(search)) ||
        (apt.clientName && apt.clientName.toLowerCase().includes(search));

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory !== 'all' && apt.category !== selectedCategory) {
        return false;
      }

      // Media filter
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
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const getCategoryBadge = (category: AppointmentCategory) => {
    switch (category) {
      case 'ensaio':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300';
      case 'producao':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300';
      case 'vistoria':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
      case 'gravacao':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300';
      case 'reuniao':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, local ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Media Filter & Add */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                Com Fotos
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
                Com Vídeos
              </button>
            </div>

            <button
              onClick={onNewAppointment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Registro
            </button>
          </div>
        </div>

        {/* Category Filter Pills and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-neutral-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Categoria:
            </span>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'ensaio', label: 'Ensaios' },
              { id: 'producao', label: 'Produção' },
              { id: 'vistoria', label: 'Vistorias' },
              { id: 'gravacao', label: 'Gravações' },
              { id: 'reuniao', label: 'Reuniões' },
              { id: 'cliente', label: 'Clientes' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <span>Ordem:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {sortOrder === 'asc' ? 'Cronológica ↑' : 'Mais recentes ↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Cards List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center space-y-3">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Nenhum compromisso encontrado para os filtros selecionados.
          </p>
          <button
            onClick={onNewAppointment}
            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar Primeiro Compromisso com Mídia
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const photosCount = apt.media.filter((m) => m.type === 'image').length;
            const videosCount = apt.media.filter((m) => m.type === 'video').length;

            return (
              <div
                key={apt.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${getCategoryBadge(
                        apt.category
                      )}`}
                    >
                      {apt.category}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {apt.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onExportToGitHub(apt)}
                      title="Exportar para GitHub Issues"
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectAppointment(apt)}
                      title="Editar compromisso"
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir compromisso "${apt.title}"?`)) {
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

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    {new Date(apt.date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {apt.startTime} às {apt.endTime}
                  </span>
                  {apt.location && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        {apt.location}
                      </span>
                    </>
                  )}
                  {apt.clientName && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        {apt.clientName}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {apt.description && (
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {apt.description}
                  </p>
                )}

                {/* Multimedia Attachments Preview Row */}
                {apt.media.length > 0 && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Arquivos Multimídia:
                        </span>
                        {photosCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-mono">
                            <ImageIcon className="w-3 h-3 text-emerald-500" />
                            {photosCount} foto{photosCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {videosCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-mono">
                            <VideoIcon className="w-3 h-3 text-rose-500" />
                            {videosCount} vídeo{videosCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-indigo-500">
                        Clique na mídia para expandir
                      </span>
                    </div>

                    {/* Media Thumbnail Gallery */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {apt.media.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => onPreviewMedia(apt.media, idx)}
                          className="group/thumb relative aspect-video rounded-lg overflow-hidden bg-neutral-950 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-indigo-500 transition-all shadow-2xs"
                        >
                          {item.type === 'video' ? (
                            <>
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                              />
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

                          <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[8px] font-mono uppercase bg-black/70 text-white backdrop-blur-xs">
                            {item.type === 'video' ? 'Vídeo' : 'Foto'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cloud & Git Status Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Database
                        className={`w-3 h-3 ${
                          apt.supabaseSynced ? 'text-emerald-500' : 'text-neutral-400'
                        }`}
                      />
                      {apt.supabaseSynced ? 'Supabase Sincronizado' : 'Armazenado Localmente'}
                    </span>

                    {apt.githubSync?.issueNumber && (
                      <a
                        href={apt.githubSync.issueUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <GitBranch className="w-3 h-3" />
                        GitHub Issue #{apt.githubSync.issueNumber}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <span className="font-mono text-[10px]">
                    ID: {apt.id} · Atualizado: {new Date(apt.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
