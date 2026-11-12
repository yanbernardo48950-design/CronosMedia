import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Tag,
  AlignLeft,
  Trash2,
  Database,
  GitBranch,
  Check,
} from 'lucide-react';
import { Appointment, AppointmentCategory, AppointmentStatus, MediaAttachment } from '../types';
import { MediaUploadDropzone } from './MediaUploadDropzone';

interface AppointmentModalProps {
  appointment: Partial<Appointment> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment, syncToSupabase: boolean, exportToGitHub: boolean) => void;
  onDelete?: (id: string) => void;
  onPreviewMedia?: (mediaList: MediaAttachment[], index: number) => void;
}

const CATEGORIES: { value: AppointmentCategory; label: string }[] = [
  { value: 'reuniao', label: 'Reunião' },
  { value: 'producao', label: 'Produção Audiovisual' },
  { value: 'vistoria', label: 'Vistoria Técnica' },
  { value: 'gravacao', label: 'Gravação / Filmagem' },
  { value: 'ensaio', label: 'Ensaio Fotográfico' },
  { value: 'cliente', label: 'Atendimento a Cliente' },
  { value: 'outro', label: 'Outro' },
];

const STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: 'agendado', label: 'Agendado' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onPreviewMedia,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(appointment?.id);

  const [title, setTitle] = useState(appointment?.title || '');
  const [description, setDescription] = useState(appointment?.description || '');
  const [date, setDate] = useState(appointment?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(appointment?.startTime || '10:00');
  const [endTime, setEndTime] = useState(appointment?.endTime || '11:00');
  const [category, setCategory] = useState<AppointmentCategory>(
    appointment?.category || 'producao'
  );
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status || 'agendado');
  const [location, setLocation] = useState(appointment?.location || '');
  const [clientName, setClientName] = useState(appointment?.clientName || '');
  const [clientEmail, setClientEmail] = useState(appointment?.clientEmail || '');
  const [media, setMedia] = useState<MediaAttachment[]>(appointment?.media || []);

  const [syncToSupabase, setSyncToSupabase] = useState(true);
  const [exportToGitHub, setExportToGitHub] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Informe o título do compromisso.');
      return;
    }
    if (!date) {
      setErrorMsg('Selecione uma data para o compromisso.');
      return;
    }

    const payload: Appointment = {
      id: appointment?.id || `apt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      category,
      status,
      location: location.trim(),
      clientName: clientName.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      media,
      githubSync: appointment?.githubSync,
      supabaseSynced: appointment?.supabaseSynced || false,
      createdAt: appointment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(payload, syncToSupabase, exportToGitHub);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-900 dark:text-neutral-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50">
          <div>
            <h2 className="text-base font-semibold">
              {isEditing ? 'Editar Registro de Compromisso' : 'Novo Agendamento Multimídia'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Anexe fotos, vídeos de campo e sincronize com a nuvem.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Título do Compromisso *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ensaio de Moda, Vistoria Estrutural, Gravação de Comercial..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                <Tag className="w-3.5 h-3.5" />
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AppointmentCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                Início
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                Término
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Localização / Estúdio / Link
            </label>
            <input
              type="text"
              placeholder="Ex: Estúdio B, Obra Alphaville Lote 14 ou Link do Google Meet"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                <User className="w-3.5 h-3.5" />
                Cliente / Responsável
              </label>
              <input
                type="text"
                placeholder="Ex: Dra. Mariana Costa, Arq. Lucas"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                <Mail className="w-3.5 h-3.5" />
                E-mail de Contato
              </label>
              <input
                type="email"
                placeholder="contato@cliente.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              Pauta & Observações Técnicas
            </label>
            <textarea
              rows={3}
              placeholder="Instruções de equipamentos, lista de tomadas de vídeo, ângulos fotográficos ou itens para checagem in loco..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Section: Multimedia Attachments */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Anexos Multimídia (Fotos e Vídeos)
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {media.length} arquivo(s)
              </span>
            </div>
            <MediaUploadDropzone
              media={media}
              onChange={setMedia}
              onPreviewMedia={onPreviewMedia}
            />
          </div>

          {/* Sync Toggles */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncToSupabase}
                onChange={(e) => setSyncToSupabase(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                Sincronizar no Supabase (PostgreSQL & Storage)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exportToGitHub}
                onChange={(e) => setExportToGitHub(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                Exportar registro como Issue no repositório GitHub
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
            {isEditing && onDelete && appointment?.id ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente remover este compromisso?')) {
                    onDelete(appointment.id!);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                {isEditing ? 'Salvar Alterações' : 'Criar Compromisso'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
