import React, { useState } from 'react';
import { Users, Edit2, Check, X } from 'lucide-react';
import MiniMonthCalendar from './MiniMonthCalendar';

export default function Sidebar({
  selectedDate,
  onSelectDate,
  events = [],
  members = [],
  holidays = {},
  selectedMember,
  onSelectMember,
  onUpdateMemberName,
  isOpenOnMobile,
  onCloseMobile
}) {
  const [editingId, setEditingId] = useState(null);
  const [tempName, setTempName] = useState('');

  const startEdit = (e, member) => {
    e.stopPropagation();
    setEditingId(member.id);
    setTempName(member.name);
  };

  const saveEdit = (e, memberId) => {
    e.stopPropagation();
    if (tempName.trim()) {
      onUpdateMemberName(memberId, tempName.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Backdrop en móvil */}
      {isOpenOnMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:static top-[53px] bottom-0 left-0 z-40 lg:z-auto
        w-72 sm:w-80 lg:w-72 shrink-0 bg-slate-100 lg:bg-transparent p-3 sm:p-4 lg:p-0
        space-y-3 overflow-y-auto transition-transform duration-200 ease-in-out
        ${isOpenOnMobile ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* 1. Miniatura de Mes requerida */}
        <MiniMonthCalendar
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            onSelectDate(d);
            if (isOpenOnMobile) onCloseMobile();
          }}
          events={events}
          members={members}
          holidays={holidays}
        />

        {/* 2. Filtro y Nombres de los 5 integrantes + Familia */}
        <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Integrantes</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              (click para filtrar)
            </span>
          </div>

          <div className="space-y-1">
            {members.map(member => {
              const isSelected = selectedMember === member.id;
              const isEditing = editingId === member.id;
              const count = member.id === 'all' 
                ? events.length 
                : events.filter(e => e.member === member.id).length;

              return (
                <div
                  key={member.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectMember(member.id);
                      if (isOpenOnMobile) onCloseMobile();
                    }
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none
                    ${isSelected 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${member.color.split(' ')[0]}`} />

                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          autoFocus
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(e, member.id);
                            if (e.key === 'Escape') cancelEdit(e);
                          }}
                          className="w-full px-1.5 py-0.5 text-xs rounded border border-indigo-400 text-slate-900 bg-white focus:outline-none"
                        />
                        <button 
                          onClick={(e) => saveEdit(e, member.id)}
                          className="p-1 text-emerald-500 hover:text-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="truncate">{member.name}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Botón para renombrar el integrante */}
                      {member.id !== 'all' && (
                        <button
                          onClick={(e) => startEdit(e, member)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition-opacity
                            ${isSelected ? 'text-slate-300' : 'text-slate-400'}
                          `}
                          title="Cambiar nombre"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}

                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold
                        ${isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}
                      `}>
                        {count}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
