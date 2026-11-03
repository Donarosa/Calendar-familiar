import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberConfig, DEFAULT_MEMBERS } from '../data/mockEvents';

export default function MonthView({ 
  selectedDate, 
  onSelectDate, 
  events = [], 
  onEventClick, 
  onSlotClick,
  members = DEFAULT_MEMBERS,
  holidays = {}
}) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date === dayStr);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Cabecera de días */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <span key={d} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {d}
          </span>
        ))}
      </div>

      {/* Cuadrícula */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6 divide-x divide-y divide-slate-100 overflow-y-auto">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentToday = isToday(day);
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const dayEvents = getEventsForDay(day);
          const dayStr = format(day, 'yyyy-MM-dd');
          const holiday = holidays[dayStr];

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`p-1 sm:p-1.5 min-h-[70px] sm:min-h-[85px] flex flex-col justify-between transition-colors cursor-pointer group hover:bg-slate-50
                ${holiday ? 'bg-red-50/70 border-red-200' : !isCurrentMonth ? 'bg-slate-50/40 opacity-40' : 'bg-white'}
                ${isSelected ? 'bg-indigo-50/20 ring-1 ring-inset ring-indigo-500' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full
                  ${holiday 
                    ? 'bg-rose-500 text-white shadow-2xs' 
                    : isCurrentToday 
                      ? 'bg-indigo-600 text-white' 
                      : isSelected 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-700'
                  }
                `}>
                  {format(day, 'd')}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick({ date: dayStr, time: '10:00' });
                  }}
                  className="hidden group-hover:flex w-4 h-4 rounded hover:bg-slate-200 text-slate-500 items-center justify-center text-[10px]"
                  title="Añadir"
                >
                  +
                </button>
              </div>

              {holiday && (
                <div className="text-[8px] font-black uppercase text-rose-700 bg-red-100/90 px-1 py-0.2 rounded truncate my-0.5">
                  🇦🇷 {holiday.name}
                </div>
              )}

              {/* Eventos del día */}
              <div className="flex-1 mt-0.5 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map(event => {
                  const cfg = getMemberConfig(event.member, members);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`truncate rounded px-1 py-0.2 text-[9px] font-semibold border ${cfg.lightBg}`}
                    >
                      <span className="font-bold mr-0.5">{event.startTime || ''}</span>
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-slate-400 font-bold pl-0.5">
                    +{dayEvents.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
