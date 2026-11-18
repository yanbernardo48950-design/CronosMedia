import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Video as VideoIcon,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import { Appointment, MediaAttachment } from '../types';
import { getCategoryLabel, getShiftLabel } from '../constants/school';

interface MonthCalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onNewAppointment: (date?: string) => void;
  onPreviewMedia: (mediaList: MediaAttachment[], index: number) => void;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onNewAppointment,
  onPreviewMedia,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const selectedDayAppointments = appointments
    .filter((a) => a.date === selectedDateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Calendar Grid */}
      <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        {/* Calendar Navigation Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-md border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              Hoje
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2 bg-neutral-50/50 dark:bg-neutral-950/30">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200 dark:divide-neutral-800 bg-neutral-200 dark:bg-neutral-800">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[96px] p-2 bg-neutral-50/40 dark:bg-neutral-950/40 text-neutral-400 dark:text-neutral-600 select-none text-xs"
              >
                <span>{dayNum}</span>
              </div>
            );
          })}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayAppointments = appointments.filter((a) => a.date === dateStr);
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                onDoubleClick={() => onNewAppointment(dateStr)}
                className={`min-h-[96px] p-2 bg-white dark:bg-neutral-900 transition-colors cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-inset ring-indigo-500 z-10'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs tabular-nums ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : isSelected
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewAppointment(dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Agendar nesta data"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayAppointments.slice(0, 2).map((apt) => {
                    const hasPhotos = apt.media.some((m) => m.type === 'image');
                    const hasVideos = apt.media.some((m) => m.type === 'video');
                    const displayLabel = apt.subject
                      ? `${getCategoryLabel(apt.category)} · ${apt.subject}`
                      : apt.title;

                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className="px-1.5 py-1 rounded text-[11px] font-medium border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 truncate hover:border-indigo-400 transition-colors flex items-center justify-between gap-1"
                      >
                        <span className="truncate">{displayLabel}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {hasPhotos && <ImageIcon className="w-2.5 h-2.5 text-emerald-500" />}
                          {hasVideos && <VideoIcon className="w-2.5 h-2.5 text-rose-500" />}
                        </div>
                      </div>
                    );
                  })}

                  {dayAppointments.length > 2 && (
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono px-1">
                      +{dayAppointments.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {Array.from({
            length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7,
          }).map((_, i) => (
            <div
              key={`next-${i}`}
              className="min-h-[96px] p-2 bg-neutral-50/40 dark:bg-neutral-950/40 text-neutral-400 dark:text-neutral-600 select-none text-xs"
            >
              <span>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Panel */}
      <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Agenda do dia
            </span>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 capitalize mt-0.5">
              {new Date(selectedDateStr + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })}
            </h3>
          </div>

          <button
            onClick={() => onNewAppointment(selectedDateStr)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Agendar
          </button>
        </div>

        {selectedDayAppointments.length === 0 ? (
          <div className="py-10 text-center text-neutral-500 dark:text-neutral-400 space-y-2">
            <p className="text-xs">Dia livre, sem aulas ou compromissos.</p>
            <button
              onClick={() => onNewAppointment(selectedDateStr)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              + Agendar aula com foto ou vídeo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => onSelectAppointment(apt)}
                className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-indigo-400 dark:hover:border-neutral-700 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {getCategoryLabel(apt.category)}
                      {apt.schoolClass && (
                        <span>
                          {' '}
                          · Turma {apt.schoolClass}
                          {apt.shift ? ` (${getShiftLabel(apt.shift)})` : ''}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug truncate">
                      {apt.subject || apt.title}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 shrink-0 tabular-nums">
                    {apt.startTime}
                  </span>
                </div>

                {(apt.teacherName || apt.location || apt.endTime) && (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {apt.teacherName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 shrink-0" />
                        {apt.teacherName}
                      </span>
                    )}
                    {apt.endTime && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {apt.startTime}–{apt.endTime}
                      </span>
                    )}
                    {apt.location && (
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{apt.location}</span>
                      </span>
                    )}
                  </div>
                )}

                {apt.media.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/60">
                    <div className="grid grid-cols-3 gap-1.5">
                      {apt.media.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewMedia(apt.media, idx);
                          }}
                          className="relative aspect-video rounded overflow-hidden bg-black border border-neutral-300 dark:border-neutral-800 hover:opacity-90"
                        >
                          {item.type === 'video' ? (
                            <>
                              <video src={item.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <VideoIcon className="w-3.5 h-3.5 text-white drop-shadow" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
