// Utilidades para usar Google Sheet como Base de Datos pura en la nube

export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1E5nYSiCUmRTKA7dBB02QtNVWumMVynuKvsP-zausIN4/edit?usp=sharing';

export function extractSheetId(url) {
  if (!url) return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url.trim();
}

export function extractGid(url) {
  if (!url) return '0';
  const match = url.match(/[#&?]gid=([0-9]+)/);
  return match ? match[1] : '0';
}

// Verifica si la URL configurada es una API Web de Apps Script
export function isAppsScriptUrl(url) {
  return typeof url === 'string' && url.includes('script.google.com/macros/s/');
}

// Sincronizar (Leer base de datos)
export async function syncFromDatabase(urlOrId) {
  if (!urlOrId) throw new Error('No hay URL configurada');

  // Si es Apps Script Web App (API directa)
  if (isAppsScriptUrl(urlOrId)) {
    const res = await fetch(urlOrId);
    if (!res.ok) throw new Error(`HTTP ${res.status} al conectar con la base de datos.`);
    const data = await res.json();
    if (data.events && Array.isArray(data.events)) {
      return { success: true, events: data.events };
    }
  }

  // Si es URL estándar de Google Sheet (lectura directa vía GViz / CSV export)
  const sheetId = extractSheetId(urlOrId);
  const gid = extractGid(urlOrId);

  const urlsToTry = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`)}`
  ];

  let lastError = null;
  for (const u of urlsToTry) {
    try {
      const response = await fetch(u);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();

      if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com')) {
        throw new Error('Permisos de lectura requeridos: configura la hoja en "Cualquier persona con el vínculo puede ver".');
      }

      const rows = parseCSV(text);
      if (rows.length === 0) throw new Error('La base de datos está vacía.');

      const events = mapRowsToEvents(rows);
      return { success: true, events };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo conectar a la base de datos de Google Sheets.');
}

// Guardar / Actualizar evento en la base de datos (Apps Script)
export async function saveToDatabase(apiUrl, event, action = 'save') {
  if (!isAppsScriptUrl(apiUrl)) {
    // Si no tiene URL de script, guardará en local
    return { success: true, localOnly: true };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Evita preflight CORS estricto en Apps Script
      },
      body: JSON.stringify({
        action: action, // 'save' | 'delete'
        event: event
      })
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.warn('Error guardando en la base de datos remota:', err);
    return { success: false, error: err.message };
  }
}

// Parseador CSV para cuando se lee directo del Sheet
export function parseCSV(text) {
  const lines = [];
  let row = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== '') lines.push(row);
  return lines;
}

function normalizeHeader(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeDate(rawDate) {
  if (!rawDate) return null;
  const str = rawDate.trim();
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const parts = str.split('-');
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(str)) {
    const parts = str.split(/[\/\-\.]/);
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return null;
}

export function normalizeTime(rawTime) {
  if (!rawTime) return '';
  const str = rawTime.trim().toLowerCase();
  if (str === 'todo el dia' || str === 'all day') return '';

  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return `${match24[1].padStart(2, '0')}:${match24[2]}`;
  }

  const matchAmPm = str.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)$/);
  if (matchAmPm) {
    let h = parseInt(matchAmPm[1], 10);
    const m = matchAmPm[2] ? matchAmPm[2] : '00';
    if (matchAmPm[3] === 'pm' && h < 12) h += 12;
    if (matchAmPm[3] === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  return str.padStart(5, '0');
}

export function mapRowsToEvents(rows) {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map(h => normalizeHeader(h));
  const findIdx = (keys) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const titleIdx = findIdx(['titulo', 'title', 'actividad', 'evento', 'nombre']);
  const dateIdx = findIdx(['fecha', 'date', 'dia']);
  const startIdx = findIdx(['inicio', 'start', 'hora inicio', 'hora', 'desde']);
  const endIdx = findIdx(['fin', 'end', 'hora fin', 'hasta']);
  const personIdx = findIdx(['quien', 'persona', 'integrante', 'miembro', 'responsable']);
  const catIdx = findIdx(['categoria', 'tipo', 'tag']);
  const descIdx = findIdx(['descripcion', 'nota', 'notas', 'detalle']);
  const locIdx = findIdx(['lugar', 'ubicacion', 'donde']);

  const events = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every(c => !c || !c.trim())) continue;

    const formattedDate = normalizeDate(dateIdx !== -1 ? row[dateIdx] : row[0]);
    if (!formattedDate) continue;

    const rawTitle = titleIdx !== -1 ? row[titleIdx] : (row[1] || 'Sin título');
    const startTime = normalizeTime(startIdx !== -1 ? row[startIdx] : '');
    let endTime = normalizeTime(endIdx !== -1 ? row[endIdx] : '');
    const rawPerson = personIdx !== -1 ? row[personIdx] : '';

    if (startTime && !endTime) {
      const [h, m] = startTime.split(':').map(Number);
      endTime = `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    // Normalizar integrante entre los 5 (Santi, Lu, Bru, Ama, Indi) + Familia
    let member = 'family';
    const p = (rawPerson || '').toLowerCase();
    if (p.includes('santi') || p.includes('papa') || p.includes('esposo')) {
      member = 'member-1';
    } else if (p.includes('lu') || p.includes('mama') || p.includes('esposa')) {
      member = 'member-2';
    } else if (p.includes('bru')) {
      member = 'member-3';
    } else if (p.includes('ama')) {
      member = 'member-4';
    } else if (p.includes('indi')) {
      member = 'member-5';
    } else if (p.includes('familia') || p.includes('todos') || p.includes('juntos') || p.includes('ambos')) {
      member = 'family';
    } else if (rawPerson) {
      member = rawPerson;
    }

    events.push({
      id: `sheet-${i}-${Date.now()}`,
      title: rawTitle.trim(),
      date: formattedDate,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      isAllDay: !startTime,
      member: member,
      rawPerson: rawPerson.trim(),
      category: catIdx !== -1 ? row[catIdx] : 'General',
      location: locIdx !== -1 ? row[locIdx] : '',
      description: descIdx !== -1 ? row[descIdx] : '',
      source: 'sheet'
    });
  }

  return events;
}
