import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Grid, 
  Plus, 
  FileSpreadsheet, 
  CalendarDays,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Header({ 
  currentDate, 
  onPrev, 
  onNext, 
  onToday, 
  activeView, 
  onChangeView, 
  onOpenNewEvent, 
  onOpenSheetsModal,
  syncStatus,
  isSidebarOpen,
  onToggleSidebar,
  onLogout
}) {
  const getPeriodLabel = () => {
    if (activeView === 'day') {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: es });
    }
    if (activeView === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM yyyy", { locale: es })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: es });
  };

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 select-none">
      {/* Lado izquierdo: Botón Menú Móvil + Título limpio + Navegación */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Toggle Sidebar en móvil/tablet */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title={isSidebarOpen ? "Cerrar panel" : "Abrir miniatura y filtros"}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo minimalista sin textos sobrantes */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm sm:text-base hidden sm:inline">
            Calendario Familiar
          </span>
        </div>

        {/* Navegación temporal rápida */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl shrink-0">
          <button
            onClick={onPrev}
            className="p-1 sm:p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-2 sm:px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={onNext}
            className="p-1 sm:p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            title="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Etiqueta del período */}
        <div className="text-xs sm:text-sm font-bold text-slate-800 capitalize truncate hidden md:block">
          {getPeriodLabel()}
        </div>
      </div>

      {/* Lado derecho: Selector de vistas + Botones de acción compactos */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Selector de vistas */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
          <button
            onClick={() => onChangeView('week')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all
              ${activeView === 'week' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
            `}
            title="Vista Semanal"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Semana</span>
          </button>

          <button
            onClick={() => onChangeView('day')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all
              ${activeView === 'day' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
            `}
            title="Detalle del Día y Horas"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Día</span>
          </button>

          <button
            onClick={() => onChangeView('month')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all
              ${activeView === 'month' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}
            `}
            title="Vista Mensual"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mes</span>
          </button>
        </div>

        {/* Botón Sheet compacto */}
        <button
          onClick={onOpenSheetsModal}
          className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5
            ${syncStatus === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }
          `}
          title="Conexión Google Sheets"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span className="hidden md:inline">Sheet</span>
          <span className={`w-2 h-2 rounded-full ${syncStatus === 'success' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        </button>

        {/* Botón Nueva Actividad */}
        <button
          onClick={onOpenNewEvent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>

        {/* Bloquear / Cerrar sesión */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Bloquear acceso en este dispositivo"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
