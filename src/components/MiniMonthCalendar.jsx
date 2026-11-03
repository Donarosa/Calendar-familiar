import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberConfig } from '../data/mockEvents';

export default function MiniMonthCalendar({ selectedDate, onSelectDate, events = [], members = [], holidays = {} }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    onSelectDate(today);
  };

  const getEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.date === dayStr);
  };

  return (
    <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex items-center gap-0.5">
          <button 
            onClick={prevMonth}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Mes anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={goToToday}
            className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded"
          >
            Hoy
          </button>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Mes siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
        <span>L</span>
        <span>M</span>
        <span>X</span>
        <span>J</span>
        <span>V</span>
        <span>S</span>
        <span>D</span>
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentToday = isToday(day);
          const isMonthDay = isSameMonth(day, currentMonth);
          const dayEvents = getEventsForDay(day);
          const dayKey = format(day, 'yyyy-MM-dd');
          const isHoliday = Boolean(holidays[dayKey]);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              title={isHoliday ? `Feriado: ${holidays[dayKey]?.name}` : undefined}
              className={`relative flex flex-col items-center justify-center h-7 rounded-lg text-xs font-medium transition-colors
                ${!isMonthDay ? 'text-slate-300' : isHoliday ? 'text-rose-700 bg-red-50/80 font-bold' : 'text-slate-700'}
                ${isSelected 
                  ? 'bg-indigo-600 text-white font-bold !text-white' 
                  : isCurrentToday 
                    ? 'border border-indigo-600 text-indigo-600 font-bold bg-indigo-50/50' 
                    : 'hover:bg-slate-100'
                }
              `}
            >
              <span className="text-[11px] leading-none">{format(day, 'd')}</span>

              {/* Indicadores de eventos */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0.5 flex items-center justify-center gap-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => {
                    const cfg = getMemberConfig(ev.member, members);
                    return (
                      <span
                        key={i}
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : cfg.color.split(' ')[0]}`}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
