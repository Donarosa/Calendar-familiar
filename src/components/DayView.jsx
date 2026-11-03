import React from 'react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, MapPin, AlignLeft, Plus, Calendar } from 'lucide-react';
import { getMemberConfig, DEFAULT_MEMBERS } from '../data/mockEvents';

export default function DayView({ 
  selectedDate, 
  events = [], 
  onEventClick, 
  onAddEvent,
  members = DEFAULT_MEMBERS 
}) {
  const dayKey = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = events.filter(e => e.date === dayKey);
  const isCurrentToday = isToday(selectedDate);

  const sortedEvents = [...dayEvents].sort((a, b) => {
    return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
  });

  const memberCounts = dayEvents.reduce((acc, ev) => {
    acc[ev.member] = (acc[ev.member] || 0) + 1;
    return acc;
  }, {});

  const filterableMembers = members.filter(m => m.id !== 'all');

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Cabecera del día compacta */}
      <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            {isCurrentToday ? 'Hoy' : format(selectedDate, 'EEEE', { locale: es })}
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize">
            {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
          </h2>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            ({dayEvents.length} {dayEvents.length === 1 ? 'actividad' : 'actividades'})
          </span>
        </div>

        <button
          onClick={() => onAddEvent({ date: dayKey, time: '10:00' })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar a hoy</span>
        </button>
      </div>

      {/* Mini resumen de integrantes en el día */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto text-xs">
        {filterableMembers.map(member => {
          const count = memberCounts[member.id] || 0;
          return (
            <div 
              key={member.id}
              className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 shrink-0 transition-opacity
                ${count > 0 ? member.lightBg : 'bg-white border-slate-200/80 opacity-50'}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${member.color.split(' ')[0]}`} />
              <span className="font-bold">{member.name}</span>
              <span className="text-[10px] px-1.5 rounded-full font-bold bg-white/80">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeline y Detalle de Horas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No hay actividades agendadas</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4">
              Día libre o sin eventos programados.
            </p>
            <button
              onClick={() => onAddEvent({ date: dayKey, time: '09:00' })}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar actividad</span>
            </button>
          </div>
        ) : (
          <div className="relative pl-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-3">
            {sortedEvents.map(event => {
              const cfg = getMemberConfig(event.member, members);
              return (
                <div 
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="relative group cursor-pointer"
                >
                  <div className={`absolute -left-5 top-3.5 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${cfg.color.split(' ')[0]}`} />

                  <div className={`p-3.5 rounded-xl border shadow-xs transition-all duration-150 group-hover:shadow-md ${cfg.lightBg}`}>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${cfg.badge}`}>
                          {cfg.name}
                        </span>
                        {event.category && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-white/70 px-1.5 py-0.2 rounded border border-slate-200">
                            {event.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span>{event.isAllDay ? 'Día completo' : `${event.startTime} - ${event.endTime}`}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {event.title}
                    </h4>

                    {event.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed flex items-start gap-1.5">
                        <AlignLeft className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span>{event.description}</span>
                      </p>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-2 pt-2 border-t border-slate-200/50">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
