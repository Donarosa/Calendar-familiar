import React, { useMemo, useRef, useEffect, useState } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MapPin, CalendarDays, Flag, Sparkles } from 'lucide-react';
import { getMemberConfig, DEFAULT_MEMBERS } from '../data/mockEvents';

const START_HOUR = 7;
const END_HOUR = 23;
const HOUR_HEIGHT = 52;

export default function WeekView({ 
  selectedDate, 
  onSelectDate, 
  events = [], 
  onEventClick, 
  onSlotClick,
  members = DEFAULT_MEMBERS,
  holidays = {}
}) {
  const scrollContainerRef = useRef(null);
  const headerScrollRef = useRef(null);
  const milestoneScrollRef = useRef(null);
  const [weekendVisible, setWeekendVisible] = useState(false);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const hours = useMemo(() => {
    const list = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, []);

  const handleBodyScroll = (e) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
    if (milestoneScrollRef.current) {
      milestoneScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
    if (e.target.scrollLeft > 60) {
      setWeekendVisible(true);
    } else {
      setWeekendVisible(false);
    }
  };

  const scrollToWeekend = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollToWeekdays = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 1 * HOUR_HEIGHT;
    }
  }, []);

  const eventsByDay = useMemo(() => {
    const map = {};
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      map[dayKey] = events.filter(e => e.date === dayKey);
    });
    return map;
  }, [weekDays, events]);

  const getMinutesFromStart = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + (m || 0);
    const startMinutes = START_HOUR * 60;
    return Math.max(0, totalMinutes - startMinutes);
  };

  const getDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 60;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
    return Math.max(30, Math.min(diff, 360));
  };

  // ¿Hay algún hito registrado en esta semana?
  const hasMilestonesThisWeek = useMemo(() => {
    return weekDays.some(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      return (eventsByDay[dayKey] || []).some(e => e.isMilestone);
    });
  }, [weekDays, eventsByDay]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden relative">
      {/* Barra de control rápido: Lunes a Viernes / Sábado y Domingo */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Semana:</span>
          <span>{weekendVisible ? 'Fin de Semana (S - D)' : 'Días de Semana (L - V)'}</span>
        </div>

        <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg shadow-2xs">
          <button
            onClick={scrollToWeekdays}
            className={`px-2 py-0.5 rounded font-bold text-[11px] transition-all ${!weekendVisible ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            L - V
          </button>
          <button
            onClick={scrollToWeekend}
            className={`px-2 py-0.5 rounded font-bold text-[11px] transition-all ${weekendVisible ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            S - D
          </button>
        </div>
      </div>

      {/* Header fijo de los días */}
      <div 
        ref={headerScrollRef}
        className="overflow-hidden border-b border-slate-200 bg-slate-50/90 sticky top-0 z-20"
      >
        <div className="flex w-[calc(40px+((100%-40px)/5)*7)] lg:w-full">
          <div className="w-10 sm:w-12 shrink-0 p-2 text-center text-xs font-bold text-slate-400 border-r border-slate-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, i) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const isCurrentToday = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              const isWeekendDay = i >= 5;
              const holiday = holidays[dayKey];

              return (
                <button
                  key={i}
                  onClick={() => onSelectDate(day)}
                  className={`py-2 px-0.5 sm:px-1 text-center border-r border-slate-200 last:border-r-0 transition-colors cursor-pointer group hover:bg-slate-100/70
                    ${holiday ? 'bg-red-50/90 text-red-900 border-r-red-200' : ''}
                    ${isSelected && !holiday ? 'bg-indigo-50/50' : ''}
                    ${isWeekendDay && !holiday ? 'bg-slate-100/50' : ''}
                  `}
                >
                  <div className={`text-[10px] font-bold uppercase truncate
                    ${holiday ? 'text-red-700 font-black' : isWeekendDay ? 'text-indigo-600' : 'text-slate-500'}
                  `}>
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className="flex items-center justify-center mt-0.5">
                    <span className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-105
                      ${holiday 
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : isCurrentToday 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : isSelected 
                            ? 'bg-slate-900 text-white' 
                            : 'text-slate-700'
                      }
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Etiqueta de feriado argentino */}
                  {holiday && (
                    <div className="text-[8px] font-black uppercase tracking-tight text-rose-700 bg-red-100/90 px-1 py-0.2 rounded mt-0.5 truncate max-w-full" title={`Feriado Nacional: ${holiday.name}`}>
                      🇦🇷 {holiday.name}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Franja superior exclusiva para HITOS */}
      {hasMilestonesThisWeek && (
        <div 
          ref={milestoneScrollRef}
          className="overflow-hidden border-b border-amber-200/80 bg-amber-50/60 py-1"
        >
          <div className="flex w-[calc(40px+((100%-40px)/5)*7)] lg:w-full">
            <div className="w-10 sm:w-12 shrink-0 text-[9px] uppercase font-bold text-amber-800 text-center self-center flex items-center justify-center gap-0.5">
              <Flag className="w-2.5 h-2.5 text-amber-600" />
              <span>Hito</span>
            </div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((day, i) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const milestones = (eventsByDay[dayKey] || []).filter(e => e.isMilestone);
                return (
                  <div key={i} className="px-0.5 sm:px-1 border-r border-amber-200/50 last:border-r-0 space-y-1">
                    {milestones.map(ev => {
                      return (
                        <div
                          key={ev.id}
                          onClick={() => onEventClick(ev)}
                          className={`truncate rounded px-1.5 py-0.5 text-[9px] font-bold cursor-pointer hover:opacity-90 shadow-2xs border border-amber-300 bg-amber-100 text-amber-900 flex items-center gap-1`}
                          title={`Hito: ${ev.title}`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cuadrícula de horas y eventos */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleBodyScroll}
        className="flex-1 overflow-auto relative divide-y divide-slate-100"
      >
        <div className="flex w-[calc(40px+((100%-40px)/5)*7)] lg:w-full relative min-h-full">
          
          {/* Columna fija de horas */}
          <div className="w-10 sm:w-12 shrink-0 border-r border-slate-200 bg-slate-50/60 select-none">
            {hours.map(hour => (
              <div 
                key={hour} 
                style={{ height: `${HOUR_HEIGHT}px` }} 
                className="text-right pr-1 text-[10px] sm:text-[11px] font-semibold text-slate-400 relative -top-2"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* 7 Columnas de días */}
          <div className="flex-1 grid grid-cols-7 relative">
            {weekDays.map((day, dayIndex) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const holiday = holidays[dayKey];
              const allDayEvents = (eventsByDay[dayKey] || []).filter(e => e.isAllDay && !e.isMilestone);
              const timedEvents = (eventsByDay[dayKey] || []).filter(e => !e.isAllDay);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentToday = isToday(day);
              const isWeekendDay = dayIndex >= 5;

              return (
                <div
                  key={dayIndex}
                  className={`relative border-r border-slate-200/80 last:border-r-0 transition-colors
                    ${holiday ? 'bg-red-50/65 border-r-red-200/70' : ''}
                    ${!holiday && isSelected ? 'bg-indigo-50/20' : ''}
                    ${!holiday && isCurrentToday ? 'bg-indigo-50/10' : ''}
                    ${!holiday && isWeekendDay ? 'bg-slate-50/30' : ''}
                  `}
                >
                  {/* Marca de agua / Cinta de feriado de fondo si es feriado */}
                  {holiday && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 select-none z-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-red-400/50 bg-red-100/40 px-2 py-0.5 rounded text-center">
                        Feriado Nacional
                      </div>
                      <div className="text-[11px] font-black text-red-500/25 text-center leading-tight">
                        {holiday.name}
                      </div>
                      <div className="text-[9px] font-bold text-red-400/40 text-center">
                        🇦🇷 No laborable
                      </div>
                    </div>
                  )}

                  {/* Líneas de horas */}
                  {hours.map(hour => (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      onClick={() => {
                        const timeStr = `${String(hour).padStart(2, '0')}:00`;
                        onSlotClick({ date: dayKey, time: timeStr });
                      }}
                      className={`border-b transition-colors cursor-pointer group relative
                        ${holiday ? 'border-red-100/70 hover:bg-red-100/40' : 'border-slate-100 hover:bg-indigo-50/30'}
                      `}
                    >
                      <span className="hidden group-hover:block absolute top-0.5 right-0.5 text-[9px] text-indigo-400 font-bold">
                        +
                      </span>
                    </div>
                  ))}

                  {/* EVENTO DE TODO EL DÍA: PINTA LA COLUMNA COMPLETA */}
                  {allDayEvents.map(event => {
                    const cfg = getMemberConfig(event.member, members);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={`absolute inset-x-0.5 top-0 bottom-0 rounded-xl p-2.5 cursor-pointer border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] flex flex-col justify-between z-10
                          ${cfg.lightBg} shadow-sm border-indigo-300 bg-gradient-to-b from-indigo-50/95 via-indigo-100/70 to-indigo-50/95
                        `}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${cfg.badge} truncate`}>
                              {cfg.name}
                            </span>
                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-indigo-700 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                              Todo el día
                            </span>
                          </div>

                          <h3 className="text-xs sm:text-base font-black text-slate-900 leading-snug mt-1">
                            {event.title}
                          </h3>

                          {event.description && (
                            <p className="text-[10px] sm:text-xs text-slate-700 mt-2 font-medium leading-relaxed bg-white/60 p-2 rounded-lg border border-indigo-100">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-indigo-200/60 mt-auto">
                          {event.location && (
                            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-700 truncate">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          <div className="text-[9px] font-extrabold text-indigo-600/90 tracking-wider text-center py-1 bg-white/80 rounded-md shadow-2xs">
                            📅 DÍA COMPLETO
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Eventos con horario fijo */}
                  {timedEvents.map(event => {
                    const minutesFromStart = getMinutesFromStart(event.startTime);
                    const durationMinutes = getDurationMinutes(event.startTime, event.endTime);
                    
                    const topPx = (minutesFromStart / 60) * HOUR_HEIGHT;
                    const heightPx = (durationMinutes / 60) * HOUR_HEIGHT;
                    const cfg = getMemberConfig(event.member, members);

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        style={{
                          top: `${topPx}px`,
                          height: `${Math.max(heightPx - 2, 24)}px`,
                        }}
                        className={`absolute left-0.5 right-0.5 rounded-md p-1 cursor-pointer shadow-2xs border transition-all duration-150 hover:shadow-md hover:z-20 hover:scale-[1.01] flex flex-col justify-between overflow-hidden
                          ${cfg.lightBg}
                        `}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-0.5 mb-0.5">
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${cfg.badge} truncate max-w-[70%]`}>
                              {cfg.name}
                            </span>
                            <span className="text-[8px] font-bold opacity-75 shrink-0">
                              {event.startTime}
                            </span>
                          </div>
                          <h4 className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2">
                            {event.title}
                          </h4>
                        </div>

                        {heightPx > 46 && event.location && (
                          <div className="flex items-center gap-0.5 text-[8px] opacity-75 mt-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
