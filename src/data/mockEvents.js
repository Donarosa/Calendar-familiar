// Configuración de los 5 integrantes de la familia + Familia

export const DEFAULT_MEMBERS = [
  { id: 'all', name: 'Todos', color: 'bg-slate-700 text-white', border: 'border-slate-300' },
  { id: 'family', name: 'Familia', color: 'bg-indigo-600 text-white', lightBg: 'bg-indigo-50 border-indigo-200 text-indigo-950', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'member-1', name: 'Santi', color: 'bg-sky-500 text-white', lightBg: 'bg-sky-50 border-sky-200 text-sky-950', badge: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'member-2', name: 'Lu', color: 'bg-rose-500 text-white', lightBg: 'bg-rose-50 border-rose-200 text-rose-950', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'member-3', name: 'Bru', color: 'bg-emerald-600 text-white', lightBg: 'bg-emerald-50 border-emerald-200 text-emerald-950', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'member-4', name: 'Ama', color: 'bg-amber-500 text-white', lightBg: 'bg-amber-50 border-amber-200 text-amber-950', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'member-5', name: 'Indi', color: 'bg-purple-600 text-white', lightBg: 'bg-purple-50 border-purple-200 text-purple-950', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
];

export function getMemberConfig(memberId, customMembers = DEFAULT_MEMBERS) {
  const list = customMembers && customMembers.length ? customMembers : DEFAULT_MEMBERS;
  const found = list.find(m => m.id === memberId);
  if (found) return found;

  const lower = String(memberId).toLowerCase();
  if (lower.includes('santi') || lower.includes('papa')) return list.find(m => m.id === 'member-1') || list[2];
  if (lower.includes('lu') || lower.includes('mama')) return list.find(m => m.id === 'member-2') || list[3];
  if (lower.includes('bru')) return list.find(m => m.id === 'member-3') || list[4];
  if (lower.includes('ama') || lower.includes('amador')) return list.find(m => m.id === 'member-4') || list[5];
  if (lower.includes('indi')) return list.find(m => m.id === 'member-5') || list[6];
  if (lower.includes('familia') || lower.includes('todos') || lower.includes('juntos')) return list.find(m => m.id === 'family') || list[1];

  return {
    id: memberId,
    name: memberId,
    color: 'bg-slate-600 text-white',
    lightBg: 'bg-slate-50 border-slate-200 text-slate-800',
    badge: 'bg-slate-100 text-slate-700 border-slate-200'
  };
}

export function generateInitialEvents() {
  const events = [
    // --- Santi: Jueves 05 ---
    {
      id: 'event-santi-psicologa-nov05',
      title: 'Psicóloga',
      date: '2026-11-05',
      startTime: '09:00',
      endTime: '10:00',
      isAllDay: false,
      isMilestone: false,
      member: 'member-1',
      category: 'Salud',
      location: '',
      description: 'Sesión con Psicóloga',
      source: 'initial'
    },
    {
      id: 'event-santi-cardio-nov05',
      title: 'Cardio',
      date: '2026-11-05',
      startTime: '14:30',
      endTime: '17:30',
      isAllDay: false,
      isMilestone: false,
      member: 'member-1',
      category: 'Salud',
      location: '',
      description: 'Estudio / Entrenamiento de Cardio',
      source: 'initial'
    },

    // --- Amador (Ama): Viernes 06 ---
    {
      id: 'event-ama-oculista-nov06',
      title: 'Oculista Amador',
      date: '2026-11-06',
      startTime: '08:30',
      endTime: '09:30',
      isAllDay: false,
      isMilestone: false,
      member: 'member-4',
      category: 'Salud',
      location: 'Consultorio Oftalmológico',
      description: 'Consulta con oculista para Amador',
      source: 'initial'
    },

    // --- Santi: Miércoles 18 ---
    {
      id: 'event-santi-proctologo-nov18',
      title: 'Proctólogo',
      date: '2026-11-18',
      startTime: '10:40',
      endTime: '11:30',
      isAllDay: false,
      isMilestone: false,
      member: 'member-1',
      category: 'Salud',
      location: 'Consultorio Médico',
      description: 'Turno médico proctólogo',
      source: 'initial'
    },

    // --- Santi: Jueves 19 ---
    {
      id: 'event-santi-traumatologo-nov19',
      title: 'Traumatólogo',
      date: '2026-11-19',
      startTime: '16:10',
      endTime: '17:00',
      isAllDay: false,
      isMilestone: false,
      member: 'member-1',
      category: 'Salud',
      location: 'Consultorio Médico',
      description: 'Consulta con traumatólogo',
      source: 'initial'
    },

    // --- Familia: Sábado 21 (Pinta todo el día completo) ---
    {
      id: 'event-familia-casamiento-nov21',
      title: 'Casamiento',
      date: '2026-11-21',
      startTime: '',
      endTime: '',
      isAllDay: true,
      isMilestone: false, // Pinta todo el día
      member: 'family',
      category: 'Familia',
      location: 'Salón de Fiestas',
      description: 'Casamiento todo el día en familia',
      source: 'initial'
    },

    // --- Ejemplo de Hito especial: Fin de clases el 18-12 ---
    {
      id: 'event-hito-fin-clases',
      title: 'Fin de clases',
      date: '2026-12-18',
      startTime: '',
      endTime: '',
      isAllDay: true,
      isMilestone: true, // Hito para la barra superior
      member: 'family',
      category: 'Colegio',
      location: '',
      description: 'Último día de clases de los chicos',
      source: 'initial'
    }
  ];

  // --- Santi: Todos los martes y jueves de noviembre RUN 17:00 a 18:30 ---
  const runDates = [
    '2026-11-03',
    '2026-11-05',
    '2026-11-10',
    '2026-11-12',
    '2026-11-17',
    '2026-11-19',
    '2026-11-24',
    '2026-11-26',
  ];

  runDates.forEach((dateStr) => {
    events.push({
      id: `event-santi-run-${dateStr}`,
      title: 'RUN',
      date: dateStr,
      startTime: '17:00',
      endTime: '18:30',
      isAllDay: false,
      isMilestone: false,
      member: 'member-1',
      category: 'Deportes',
      location: '',
      description: 'Entrenamiento de running',
      source: 'initial'
    });
  });

  return events;
}
