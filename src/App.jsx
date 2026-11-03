import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import WeekView from './components/WeekView';
import DayView from './components/DayView';
import MonthView from './components/MonthView';
import EventModal from './components/EventModal';
import SheetsConfigModal from './components/SheetsConfigModal';
import { generateInitialEvents, DEFAULT_MEMBERS } from './data/mockEvents';
import { syncFromDatabase, saveToDatabase, DEFAULT_SHEET_URL } from './utils/googleSheets';
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, format } from 'date-fns';

const STORAGE_KEY_EVENTS = 'family_calendar_events_v8';
const STORAGE_KEY_URL = 'family_calendar_sheet_url_v8';
const STORAGE_KEY_MEMBERS = 'family_calendar_members_v8';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState('week'); // 'week' | 'day' | 'month'
  const [selectedMember, setSelectedMember] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para móviles

  // 5 Integrantes + Familia (Personalizables)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) return parsed;
      } catch (e) {
        console.error('Error al leer integrantes:', e);
      }
    }
    return DEFAULT_MEMBERS;
  });

  // Guardar integrantes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }, [members]);

  const handleUpdateMemberName = (id, newName) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  // URL de la base de datos (Google Sheet o Apps Script)
  const [sheetUrl, setSheetUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SHEET_URL;
  });

  // Eventos
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error al leer eventos guardados:', e);
      }
    }
    return generateInitialEvents();
  });

  // Estados de sincronización
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Modales
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [slotData, setSlotData] = useState(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_URL, sheetUrl);
  }, [sheetUrl]);

  // Sincronizar desde la base de datos
  const handleSyncWithSheet = async (targetUrl = sheetUrl) => {
    setSyncStatus('loading');
    setSyncError(null);

    try {
      const result = await syncFromDatabase(targetUrl);
      if (result.success && result.events.length > 0) {
        setEvents(result.events);
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.warn('Sincronización:', err.message);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  useEffect(() => {
    handleSyncWithSheet(sheetUrl);
  }, []);

  // Navegación temporal
  const handlePrev = () => {
    if (activeView === 'day') setSelectedDate(d => subDays(d, 1));
    else if (activeView === 'week') setSelectedDate(d => subWeeks(d, 1));
    else setSelectedDate(d => subMonths(d, 1));
  };

  const handleNext = () => {
    if (activeView === 'day') setSelectedDate(d => addDays(d, 1));
    else if (activeView === 'week') setSelectedDate(d => addWeeks(d, 1));
    else setSelectedDate(d => addMonths(d, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Filtrado de eventos por integrante
  const filteredEvents = useMemo(() => {
    if (selectedMember === 'all') return events;
    return events.filter(e => e.member === selectedMember);
  }, [events, selectedMember]);

  // Guardar evento (crear o editar) y enviarlo a la base de datos de fondo
  const handleSaveEvent = async (savedEvent) => {
    setEvents(prev => {
      const index = prev.findIndex(e => e.id === savedEvent.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedEvent;
        return updated;
      }
      return [savedEvent, ...prev];
    });

    // Guardado en la base de datos remota
    saveToDatabase(sheetUrl, savedEvent, 'save');
  };

  // Eliminar evento
  const handleDeleteEvent = async (eventId) => {
    const toDelete = events.find(e => e.id === eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    if (toDelete) {
      saveToDatabase(sheetUrl, toDelete, 'delete');
    }
  };

  const handleOpenNewEvent = (customSlot = null) => {
    setEditingEvent(null);
    setSlotData(customSlot || {
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '10:00'
    });
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setSlotData(null);
    setIsEventModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased">
      {/* 1. Header ultra compacto y responsive */}
      <Header
        currentDate={selectedDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenNewEvent={() => handleOpenNewEvent()}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        syncStatus={syncStatus}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* 2. Área principal: Sidebar + Calendario */}
      <main className="flex-1 p-2 sm:p-3 lg:p-4 flex flex-col lg:flex-row gap-3 max-w-[1920px] w-full mx-auto overflow-hidden">
        {/* Sidebar con Miniatura de Mes + 5 Integrantes y Familia */}
        <Sidebar
          selectedDate={selectedDate}
          onSelectDate={(newDate) => setSelectedDate(newDate)}
          events={events}
          members={members}
          selectedMember={selectedMember}
          onSelectMember={setSelectedMember}
          onUpdateMemberName={handleUpdateMemberName}
          isOpenOnMobile={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Contenedor del Calendario: aprovecha el 100% de la pantalla */}
        <section className="flex-1 flex flex-col h-[calc(100vh-68px)] min-h-[500px]">
          {activeView === 'week' && (
            <WeekView
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setActiveView('day');
              }}
              events={filteredEvents}
              members={members}
              onEventClick={handleEventClick}
              onSlotClick={(slot) => handleOpenNewEvent(slot)}
            />
          )}

          {activeView === 'day' && (
            <DayView
              selectedDate={selectedDate}
              events={filteredEvents}
              members={members}
              onEventClick={handleEventClick}
              onAddEvent={(slot) => handleOpenNewEvent(slot)}
            />
          )}

          {activeView === 'month' && (
            <MonthView
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setActiveView('week');
              }}
              events={filteredEvents}
              members={members}
              onEventClick={handleEventClick}
              onSlotClick={(slot) => handleOpenNewEvent(slot)}
            />
          )}
        </section>
      </main>

      {/* Modal de Crear / Editar Actividad */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={editingEvent}
        initialData={slotData}
        members={members}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Modal de Conexión de Google Sheet */}
      <SheetsConfigModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        sheetUrl={sheetUrl}
        onUpdateSheetUrl={setSheetUrl}
        onSync={handleSyncWithSheet}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        error={syncError}
      />
    </div>
  );
}
