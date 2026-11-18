import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  Database,
  GitBranch,
  Check,
  BookOpen,
  User,
} from 'lucide-react';
import {
  Appointment,
  AppointmentCategory,
  AppointmentStatus,
  MediaAttachment,
  SchoolShift,
} from '../types';
import { MediaUploadDropzone } from './MediaUploadDropzone';
import {
  LESSON_CATEGORIES,
  VESPERTINO_CLASSES,
  MATUTINO_CLASSES,
  getShiftForClass,
  getCategoryLabel,
} from '../constants/school';

interface AppointmentModalProps {
  appointment: Partial<Appointment> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment, syncToSupabase: boolean, exportToGitHub: boolean) => void;
  onDelete?: (id: string) => void;
  onPreviewMedia?: (mediaList: MediaAttachment[], index: number) => void;
}

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
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [shift, setShift] = useState<SchoolShift>('vespertino');
  const [schoolClass, setSchoolClass] = useState('62.01');
  const [category, setCategory] = useState<AppointmentCategory>('1_aula');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('agendado');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [syncToSupabase, setSyncToSupabase] = useState(true);
  const [exportToGitHub, setExportToGitHub] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialClass = appointment?.schoolClass || '62.01';
      const detectedShift =
        appointment?.shift || getShiftForClass(initialClass) || 'vespertino';

      setTitle(appointment?.title || '');
      setSubject(appointment?.subject || '');
      setTeacherName(appointment?.teacherName || '');
      setShift(detectedShift);
      setSchoolClass(initialClass);
      setCategory(appointment?.category || '1_aula');
      setDescription(appointment?.description || '');
      setDate(appointment?.date || new Date().toISOString().split('T')[0]);
      setStartTime(appointment?.startTime || '13:30');
      setEndTime(appointment?.endTime || '');
      setStatus(appointment?.status || 'agendado');
      setLocation(appointment?.location || '');
      setMedia(appointment?.media || []);
      setShowMoreOptions(false);
      setExportToGitHub(false);
      setErrorMsg('');
    }
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(appointment?.id);
  const availableClasses = shift === 'vespertino' ? VESPERTINO_CLASSES : MATUTINO_CLASSES;

  const handleShiftChange = (newShift: SchoolShift) => {
    setShift(newShift);
    const list = newShift === 'vespertino' ? VESPERTINO_CLASSES : MATUTINO_CLASSES;
    if (!list.includes(schoolClass)) {
      setSchoolClass(list[0]);
    }
    if (!isEditing) {
      setStartTime(newShift === 'vespertino' ? '13:30' : '07:30');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSubject = subject.trim();
    const cleanTitle = title.trim();

    if (!cleanSubject && !cleanTitle) {
      setErrorMsg('Informe a matéria ou um título para o agendamento.');
      return;
    }
    if (!date) {
      setErrorMsg('Selecione uma data.');
      return;
    }

    const finalTitle =
      cleanTitle ||
      `${cleanSubject}${schoolClass ? ` · Turma ${schoolClass}` : ''}`;

    const payload: Appointment = {
      id: appointment?.id || `apt-${Date.now()}`,
      title: finalTitle,
      description: description.trim(),
      date,
      startTime,
      endTime: endTime.trim() || undefined,
      category,
      subject: cleanSubject || undefined,
      teacherName: teacherName.trim() || undefined,
      schoolClass: schoolClass || undefined,
      shift,
      status,
      location: location.trim(),
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
      <div className="relative w-full max-w-xl my-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-base font-semibold">
            {isEditing ? 'Editar Aula / Agendamento' : 'Novo Agendamento de Aula'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs">
              {errorMsg}
            </div>
          )}

          {/* 1. Categoria: 1ª até 5ª Aula */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Aula (1ª até 5ª)
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              {LESSON_CATEGORIES.map((lesson) => (
                <button
                  key={lesson.value}
                  type="button"
                  onClick={() => setCategory(lesson.value)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    category === lesson.value
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {lesson.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Turno e Turmas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Turma ({shift === 'vespertino' ? 'Vespertino' : 'Matutino'})
              </label>

              <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => handleShiftChange('vespertino')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    shift === 'vespertino'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Vespertino
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftChange('matutino')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    shift === 'matutino'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  Matutino
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setSchoolClass(cls)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
                    schoolClass === cls
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-indigo-400'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Matéria e Nome do Professor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                Matéria *
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Ex: Matemática, Física, Artes..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                Professor(a)
              </label>
              <input
                type="text"
                placeholder="Ex: Prof. Carlos Silva"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* 4. Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
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
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                Horário
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* 5. Fotos e Vídeos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Fotos e Vídeos
              </span>
              {media.length > 0 && (
                <span className="text-xs text-neutral-500 font-mono">
                  {media.length} anexo{media.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <MediaUploadDropzone
              media={media}
              onChange={setMedia}
              onPreviewMedia={onPreviewMedia}
            />
          </div>

          {/* 6. Notas */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notas / Conteúdo (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Atividade prática, registro de aula, observações..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          {/* 7. Mais opções (recolhível) */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2.5">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="flex items-center justify-between w-full text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 py-1 transition-colors"
            >
              <span>Mais opções (título personalizado, sala, término, GitHub)</span>
              {showMoreOptions ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showMoreOptions && (
              <div className="mt-3 space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/70">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Título personalizado (se vazio, usa Matéria + Turma)
                  </label>
                  <input
                    type="text"
                    placeholder={
                      subject
                        ? `${subject} · Turma ${schoolClass}`
                        : `${getCategoryLabel(category)} · Turma ${schoolClass}`
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Término
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Sala / Local
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Lab. Informática, Sala 04"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={syncToSupabase}
                      onChange={(e) => setSyncToSupabase(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <Database className="w-3.5 h-3.5 text-emerald-500" />
                      Sincronizar com Supabase
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
                      Exportar como Issue no GitHub
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
            {isEditing && onDelete && appointment?.id ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente excluir este agendamento?')) {
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
                {isEditing ? 'Salvar' : 'Agendar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
