import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Video as VideoIcon, Plus } from 'lucide-react';
import { Appointment, MediaAttachment } from '../types';

interface WeekCalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onNewAppointment: (date?: string) => void;
  onPreviewMedia: (mediaList: MediaAttachment[], index: number) => void;
}

const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export const WeekCalendarView: React.FC<WeekCalendarViewProps> = ({
  appointments,
  onSelectAppointment,
  onNewAppointment,
  onPreviewMedia,
}) => {
  // Base date set around the simulated date (Nov 12, 2026 is a Thursday)
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2026, 10, 9)); // Mon Nov 09, 2026

  const handlePrevWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() - 7);
    setCurrentWeekStart(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: d,
      dateStr,
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('pt-BR', { month: 'short' }),
      isToday: dateStr === '2026-11-12',
    };
  });

  const getAppointmentsForDay = (dateStr: string) => {
    return appointments.filter((a) => a.date === dateStr);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
      {/* Week Header Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Semana de {weekDays[0].dayNumber} a {weekDays[6].dayNumber} de {weekDays[0].monthName} de{' '}
            {weekDays[0].date.getFullYear()}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Grade horária de compromissos e produções multimídia
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentWeekStart(new Date(2026, 10, 9))}
            className="px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 transition-colors mr-2"
          >
            Semana Atual
          </button>
          <button
            onClick={handlePrevWeek}
            aria-label="Semana anterior"
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            aria-label="Próxima semana"
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Column Headers */}
      <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-center py-2 text-xs">
        <div className="text-neutral-400 font-mono">Horário</div>
        {weekDays.map((wd) => (
          <div
            key={wd.dateStr}
            className={`py-1 font-medium ${
              wd.isToday
                ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/30 rounded'
                : 'text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <span className="capitalize">{wd.dayName}</span>, {wd.dayNumber}
          </div>
        ))}
      </div>

      {/* Hourly Timetable Rows */}
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800 max-h-[640px] overflow-y-auto">
        {HOURS.map((hour) => {
          const hourInt = parseInt(hour.split(':')[0], 10);

          return (
            <div key={hour} className="grid grid-cols-8 min-h-[58px] group">
              {/* Hour Label */}
              <div className="px-3 py-2 text-xs text-neutral-400 dark:text-neutral-500 font-mono text-center border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 select-none">
                {hour}
              </div>

              {/* Day cells for this hour */}
              {weekDays.map((wd) => {
                const dayApts = getAppointmentsForDay(wd.dateStr);
                const matchingApts = dayApts.filter((a) => {
                  const startHour = parseInt(a.startTime.split(':')[0], 10);
                  return startHour === hourInt;
                });

                return (
                  <div
                    key={`${wd.dateStr}-${hour}`}
                    onClick={() => onNewAppointment(wd.dateStr)}
                    className="p-1 border-r border-neutral-200 dark:border-neutral-800 relative hover:bg-neutral-50/80 dark:hover:bg-neutral-850/60 cursor-pointer transition-colors"
                  >
                    {matchingApts.map((apt) => {
                      const hasPhotos = apt.media.some((m) => m.type === 'image');
                      const hasVideos = apt.media.some((m) => m.type === 'video');

                      return (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment(apt);
                          }}
                          className="p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 text-xs shadow-xs space-y-1 mb-1 transition-transform hover:scale-[1.01]"
                        >
                          <div className="flex items-center justify-between gap-1 font-semibold text-[11px] truncate">
                            <span className="truncate">{apt.title}</span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {hasPhotos && <ImageIcon className="w-2.5 h-2.5 text-indigo-600" />}
                              {hasVideos && <VideoIcon className="w-2.5 h-2.5 text-rose-500" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                            <span>
                              {apt.startTime} - {apt.endTime}
                            </span>
                            {apt.media.length > 0 && <span>{apt.media.length} anexo(s)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
