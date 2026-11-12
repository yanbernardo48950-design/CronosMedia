import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  Video as VideoIcon,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Appointment, MediaAttachment } from '../types';

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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 12)); // Nov 2026 (matching simulated date)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-11-12');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 12));
    setSelectedDateStr('2026-11-12');
  };

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Selected date appointments
  const selectedDayAppointments = appointments.filter((a) => a.date === selectedDateStr);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ensaio':
        return 'border-rose-500/80 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200';
      case 'producao':
        return 'border-indigo-500/80 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200';
      case 'vistoria':
        return 'border-amber-500/80 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200';
      case 'gravacao':
        return 'border-purple-500/80 bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200';
      case 'reuniao':
        return 'border-blue-500/80 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200';
      default:
        return 'border-neutral-500/80 bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Calendar Grid */}
      <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        {/* Calendar Navigation Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 transition-colors"
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
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2.5 bg-neutral-50/50 dark:bg-neutral-950/30">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200 dark:divide-neutral-800 bg-neutral-200 dark:bg-neutral-800">
          {/* Previous month padding days */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[105px] p-2 bg-neutral-50/40 dark:bg-neutral-950/40 text-neutral-400 dark:text-neutral-600 select-none text-xs"
              >
                <span>{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayAppointments = appointments.filter((a) => a.date === dateStr);
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === '2026-11-12';

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`min-h-[105px] p-2 bg-white dark:bg-neutral-900 transition-colors cursor-pointer relative group flex flex-col justify-between ${
                  isSelected ? 'ring-2 ring-indigo-500/80 z-10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-850'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : isSelected
                        ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayAppointments.length > 0 && (
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                {/* Day Appointments List */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayAppointments.slice(0, 2).map((apt) => {
                    const hasPhotos = apt.media.some((m) => m.type === 'image');
                    const hasVideos = apt.media.some((m) => m.type === 'video');

                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className={`px-1.5 py-1 rounded text-[11px] font-medium border truncate transition-opacity hover:opacity-90 flex items-center justify-between gap-1 ${getCategoryColor(
                          apt.category
                        )}`}
                      >
                        <span className="truncate">{apt.title}</span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {hasPhotos && <ImageIcon className="w-2.5 h-2.5 opacity-70" />}
                          {hasVideos && <VideoIcon className="w-2.5 h-2.5 opacity-70 text-indigo-400" />}
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

                {/* Quick Add Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewAppointment(dateStr);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1.5 right-1.5 p-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Novo agendamento nesta data"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Next month padding to fill row */}
          {Array.from({
            length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7,
          }).map((_, i) => (
            <div
              key={`next-${i}`}
              className="min-h-[105px] p-2 bg-neutral-50/40 dark:bg-neutral-950/40 text-neutral-400 dark:text-neutral-600 select-none text-xs"
            >
              <span>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Sidebar Panel */}
      <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Agenda do Dia
            </span>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 mt-0.5">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              {new Date(selectedDateStr + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
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

        {/* Day Appointments List */}
        {selectedDayAppointments.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 dark:text-neutral-400 space-y-2">
            <p className="text-xs">Nenhum compromisso agendado para esta data.</p>
            <button
              onClick={() => onNewAppointment(selectedDateStr)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Clique para agendar com fotos ou vídeos
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => onSelectAppointment(apt)}
                className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-indigo-300 dark:hover:border-neutral-700 transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                    {apt.title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                    {apt.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    {apt.startTime} - {apt.endTime}
                  </span>
                  {apt.location && (
                    <span className="flex items-center gap-1 truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{apt.location}</span>
                    </span>
                  )}
                </div>

                {/* Multimedia preview strip */}
                {apt.media.length > 0 && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/60">
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mb-1.5 flex items-center justify-between">
                      <span>Anexos ({apt.media.length}):</span>
                      <span className="text-[10px] text-indigo-500">Clique para abrir</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {apt.media.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewMedia(apt.media, idx);
                          }}
                          className="relative aspect-video rounded overflow-hidden bg-black border border-neutral-300 dark:border-neutral-800 hover:opacity-90 group/media"
                        >
                          {item.type === 'video' ? (
                            <>
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                              />
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
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded text-[8px] font-mono bg-black/80 text-white">
                            {item.type === 'video' ? 'VID' : 'IMG'}
                          </span>
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
