import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, User, Tag, Trash2 } from 'lucide-react';
import { DEFAULT_MEMBERS } from '../data/mockEvents';

export default function EventModal({ 
  isOpen, 
  onClose, 
  event, 
  initialData, 
  onSave, 
  onDelete,
  members = DEFAULT_MEMBERS 
}) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    isAllDay: false,
    member: 'family',
    category: 'General',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        date: event.date || '',
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        isAllDay: Boolean(event.isAllDay),
        member: event.member || 'family',
        category: event.category || 'General',
        location: event.location || '',
        description: event.description || ''
      });
    } else if (initialData) {
      setFormData({
        title: '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.time || '09:00',
        endTime: '10:00',
        isAllDay: false,
        member: 'family',
        category: 'General',
        location: '',
        description: ''
      });
    }
  }, [event, initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...(event || {}),
      id: event?.id || `local-event-${Date.now()}`,
      ...formData,
      rawPerson: members.find(m => m.id === formData.member)?.name || formData.member
    });
    onClose();
  };

  const assignableMembers = members.filter(m => m.id !== 'all');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {event ? 'Editar Actividad' : 'Nueva Actividad'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto max-h-[75vh]">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Nombre de la actividad *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pediatra, Fútbol, Clase de Inglés, Cena..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 font-semibold text-slate-800 placeholder:text-slate-400 text-sm"
            />
          </div>

          {/* Integrante / Quién participa */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              ¿Quién participa?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {assignableMembers.map(member => (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => setFormData({ ...formData, member: member.id })}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all text-center truncate
                    ${formData.member === member.id 
                      ? `${member.color} ring-2 ring-offset-1 ring-indigo-500 shadow-xs` 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y Horas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Inicio
              </label>
              <input
                type="time"
                disabled={formData.isAllDay}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Fin
              </label>
              <input
                type="time"
                disabled={formData.isAllDay}
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-40"
              />
            </div>
          </div>

          {/* Todo el día toggle */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="isAllDay" className="text-xs font-medium text-slate-600 select-none cursor-pointer">
              Día completo (sin horario fijo)
            </label>
          </div>

          {/* Ubicación y Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Ubicación
              </label>
              <input
                type="text"
                placeholder="Ej: Club, Clínica, Colegio..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="General">General</option>
                <option value="Salud">Salud & Médico</option>
                <option value="Colegio">Colegio / Escuela</option>
                <option value="Deportes">Deportes & Gym</option>
                <option value="Familia">Familia & Hogar</option>
                <option value="Amigos">Social & Cumpleaños</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
              Notas
            </label>
            <textarea
              rows={2}
              placeholder="Detalles o recordatorios..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {event ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
