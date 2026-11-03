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
import { Clock, MapPin, CalendarDays, ChevronRight, ChevronLeft } from 'lucide-react';
import { getMemberConfig, DEFAULT_MEMBERS } from '../data/mockEvents';

const START_HOUR = 7;
const END_HOUR = 23;
const HOUR_HEIGHT = 52; // Altura optimizada para vista móvil y desktop

export default function WeekView({ 
  selectedDate, 
  onSelectDate, 
  events = [], 
  onEventClick, 
  onSlotClick,
  members = DEFAULT_MEMBERS
}) {
  const scrollContainerRef = useRef(null);
  const headerScrollRef = useRef(null);
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

  // Sincronizar scroll horizontal del header con el cuerpo
  const handleBodyScroll = (e) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
    // Detectar si está viendo el fin de semana
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

  // Scroll vertical inicial a las 08:00
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

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden relative">
      {/* Barra de control rápido: Lunes a Viernes / Sábado y Domingo */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Semana:</span>
          <span>{weekendVisible ? 'Fin de Semana (S - D)' : 'Días de Semana (L - V)'}</span>
        </div>

        {/* Botón switch para saltar entre L-V y S-D en móvil */}
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
          {/* Columna de hora */}
          <div className="w-10 sm:w-12 shrink-0 p-2 text-center text-xs font-bold text-slate-400 border-r border-slate-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>

          {/* 7 Columnas de días (cada día = exactamente 1/5 de la pantalla visible) */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, i) => {
              const isCurrentToday = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              const isWeekendDay = i >= 5; // Sábado y Domingo

              return (
                <button
                  key={i}
                  onClick={() => onSelectDate(day)}
                  className={`py-2 px-0.5 sm:px-1 text-center border-r border-slate-200 last:border-r-0 transition-colors cursor-pointer group hover:bg-slate-100/70
                    ${isSelected ? 'bg-indigo-50/50' : ''}
                    ${isWeekendDay ? 'bg-slate-100/50' : ''}
                  `}
                >
                  <div className={`text-[10px] font-bold uppercase ${isWeekendDay ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {format(day, 'EEE', { locale: es })}
                  </div>
                  <div className="flex items-center justify-center mt-0.5">
                    <span className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-105
                      ${isCurrentToday 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : isSelected 
                          ? 'bg-slate-900 text-white' 
                          : 'text-slate-700'
                      }
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sección All-Day si existen */}
      {weekDays.some(day => {
        const dEvents = eventsByDay[format(day, 'yyyy-MM-dd')] || [];
        return dEvents.some(e => e.isAllDay);
      }) && (
        <div className="overflow-hidden border-b border-slate-200 bg-slate-100/60 py-1">
          <div className="flex w-[calc(40px+((100%-40px)/5)*7)] lg:w-full">
            <div className="w-10 sm:w-12 shrink-0 text-[9px] uppercase font-bold text-slate-400 text-center self-center">
              Día
            </div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((day, i) => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const allDayEvents = (eventsByDay[dayKey] || []).filter(e => e.isAllDay);
                return (
                  <div key={i} className="px-0.5 sm:px-1 border-r border-slate-200 last:border-r-0 space-y-1">
                    {allDayEvents.map(ev => {
                      const cfg = getMemberConfig(ev.member, members);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => onEventClick(ev)}
                          className={`truncate rounded px-1 py-0.5 text-[9px] font-bold cursor-pointer hover:opacity-90 ${cfg.color}`}
                        >
                          {ev.title}
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

      {/* Cuadrícula de horas y eventos con scroll horizontal sincronizado */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleBodyScroll}
        className="flex-1 overflow-auto relative divide-y divide-slate-100"
      >
        <div className="flex w-[calc(40px+((100%-40px)/5)*7)] lg:w-full relative">
          
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

          {/* 7 Columnas de días (5 en pantalla + 2 en scroll lateral) */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, dayIndex) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = (eventsByDay[dayKey] || []).filter(e => !e.isAllDay);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentToday = isToday(day);
              const isWeekendDay = dayIndex >= 5;

              return (
                <div
                  key={dayIndex}
                  className={`relative border-r border-slate-200/80 last:border-r-0 transition-colors
                    ${isSelected ? 'bg-indigo-50/20' : ''}
                    ${isCurrentToday ? 'bg-indigo-50/10' : ''}
                    ${isWeekendDay ? 'bg-slate-50/40' : ''}
                  `}
                >
                  {hours.map(hour => (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      onClick={() => {
                        const timeStr = `${String(hour).padStart(2, '0')}:00`;
                        onSlotClick({ date: dayKey, time: timeStr });
                      }}
                      className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors cursor-pointer group relative"
                    >
                      <span className="hidden group-hover:block absolute top-0.5 right-0.5 text-[9px] text-indigo-400 font-bold">
                        +
                      </span>
                    </div>
                  ))}

                  {/* Eventos */}
                  {dayEvents.map(event => {
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
