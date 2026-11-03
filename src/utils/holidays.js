// Servicio de Feriados Argentinos (API pública de Nager.Date desde public-apis)

const HOLIDAYS_CACHE_KEY = 'family_calendar_ar_holidays_';

// Feriados base de Argentina (fallback inmediato sin demoras de red)
const FALLBACK_AR_HOLIDAYS_2026 = [
  { date: '2026-01-01', localName: 'Año Nuevo' },
  { date: '2026-02-16', localName: 'Carnaval' },
  { date: '2026-02-17', localName: 'Carnaval' },
  { date: '2026-03-24', localName: 'Día de la Memoria por la Verdad y la Justicia' },
  { date: '2026-04-02', localName: 'Día del Veterano y de los Caídos en Malvinas' },
  { date: '2026-04-03', localName: 'Viernes Santo' },
  { date: '2026-05-01', localName: 'Día del Trabajador' },
  { date: '2026-05-25', localName: 'Día de la Revolución de Mayo' },
  { date: '2026-06-15', localName: 'Paso a la Inmortalidad de Güemes' },
  { date: '2026-06-20', localName: 'Paso a la Inmortalidad de Belgrano' },
  { date: '2026-07-09', localName: 'Día de la Independencia' },
  { date: '2026-08-17', localName: 'Paso a la Inmortalidad de San Martín' },
  { date: '2026-10-12', localName: 'Día del Respeto a la Diversidad Cultural' },
  { date: '2026-11-23', localName: 'Día de la Soberanía Nacional' },
  { date: '2026-12-08', localName: 'Inmaculada Concepción de María' },
  { date: '2026-12-25', localName: 'Navidad' }
];

export async function fetchArgentinaHolidays(year = 2026) {
  const cacheKey = `${HOLIDAYS_CACHE_KEY}${year}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        // En background actualizamos por si cambiaron
        updateHolidaysCache(year, cacheKey);
        return parsed;
      }
    } catch (e) {
      console.warn('Error leyendo caché de feriados:', e);
    }
  }

  return await updateHolidaysCache(year, cacheKey);
}

async function updateHolidaysCache(year, cacheKey) {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/AR`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const holidaysMap = {};
    data.forEach(item => {
      holidaysMap[item.date] = {
        date: item.date,
        name: item.localName || item.name,
        isHoliday: true
      };
    });

    localStorage.setItem(cacheKey, JSON.stringify(holidaysMap));
    return holidaysMap;
  } catch (err) {
    console.warn('Usando feriados de contingencia para Argentina:', err.message);
    const fallbackMap = {};
    FALLBACK_AR_HOLIDAYS_2026.forEach(item => {
      fallbackMap[item.date] = {
        date: item.date,
        name: item.localName,
        isHoliday: true
      };
    });
    return fallbackMap;
  }
}
