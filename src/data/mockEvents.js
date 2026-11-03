// Configuración con los 5 integrantes de la familia + Familia

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

  // Fallbacks por nombres directos
  const lower = String(memberId).toLowerCase();
  if (lower.includes('santi') || lower.includes('papa') || lower.includes('esposo')) return list.find(m => m.id === 'member-1') || list[2];
  if (lower.includes('lu') || lower.includes('mama') || lower.includes('esposa')) return list.find(m => m.id === 'member-2') || list[3];
  if (lower.includes('bru')) return list.find(m => m.id === 'member-3') || list[4];
  if (lower.includes('ama')) return list.find(m => m.id === 'member-4') || list[5];
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
  const today = new Date();

  const formatDate = (offsetDays) => {
    const target = new Date(today);
    target.setDate(today.getDate() + offsetDays);
    const ty = target.getFullYear();
    const tm = String(target.getMonth() + 1).padStart(2, '0');
    const td = String(target.getDate()).padStart(2, '0');
    return `${ty}-${tm}-${td}`;
  };

  return [
    {
      id: 'mock-1',
      title: 'Entrenamiento & Gym',
      date: formatDate(0), // Hoy
      startTime: '07:30',
      endTime: '08:30',
      isAllDay: false,
      member: 'member-1',
      category: 'Salud',
      location: 'SportClub',
      source: 'local'
    },
    {
      id: 'mock-2',
      title: 'Desayuno y organización semanal',
      date: formatDate(0),
      startTime: '08:45',
      endTime: '09:30',
      isAllDay: false,
      member: 'family',
      category: 'Familia',
      location: 'Casa',
      source: 'local'
    },
    {
      id: 'mock-3',
      title: 'Fútbol / Deporte Bru',
      date: formatDate(0),
      startTime: '17:00',
      endTime: '18:15',
      isAllDay: false,
      member: 'member-3',
      category: 'Deportes',
      location: 'Club',
      source: 'local'
    },
    {
      id: 'mock-4',
      title: 'Pilates / Yoga Lu',
      date: formatDate(1), // Mañana
      startTime: '08:00',
      endTime: '09:15',
      isAllDay: false,
      member: 'member-2',
      category: 'Salud',
      location: 'Estudio Mandala',
      source: 'local'
    },
    {
      id: 'mock-5',
      title: 'Actividad / Danza Ama',
      date: formatDate(1),
      startTime: '16:00',
      endTime: '17:15',
      isAllDay: false,
      member: 'member-4',
      category: 'Actividades',
      location: 'Academia',
      source: 'local'
    },
    {
      id: 'mock-6',
      title: 'Control pediatra Indi',
      date: formatDate(2),
      startTime: '10:00',
      endTime: '11:00',
      isAllDay: false,
      member: 'member-5',
      category: 'Médico',
      location: 'Consultorio pediátrico',
      source: 'local'
    },
    {
      id: 'mock-7',
      title: 'Cena juntos Santi & Lu',
      date: formatDate(3),
      startTime: '20:30',
      endTime: '22:30',
      isAllDay: false,
      member: 'family',
      category: 'Pareja',
      location: 'Restaurante',
      source: 'local'
    },
    {
      id: 'mock-8',
      title: 'Partido de pádel Santi',
      date: formatDate(4),
      startTime: '19:00',
      endTime: '20:30',
      isAllDay: false,
      member: 'member-1',
      category: 'Deportes',
      location: 'Canchas del Parque',
      source: 'local'
    },
    {
      id: 'mock-9',
      title: 'Cumpleaños infantil Bru & Ama',
      date: formatDate(5),
      startTime: '16:00',
      endTime: '19:00',
      isAllDay: false,
      member: 'family',
      category: 'Social',
      location: 'Salón de Fiestas',
      source: 'local'
    },
    {
      id: 'mock-10',
      title: 'Almuerzo domingo en familia',
      date: formatDate(6),
      startTime: '13:00',
      endTime: '16:00',
      isAllDay: false,
      member: 'family',
      category: 'Familia',
      location: 'Casa abuelos',
      source: 'local'
    }
  ];
}
