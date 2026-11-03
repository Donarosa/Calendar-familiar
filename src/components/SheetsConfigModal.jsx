import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Database, Copy, Check, Sparkles } from 'lucide-react';
import { DEFAULT_SHEET_URL } from '../utils/googleSheets';

export default function SheetsConfigModal({ 
  isOpen, 
  onClose, 
  sheetUrl, 
  onUpdateSheetUrl, 
  onSync, 
  syncStatus, 
  lastSyncTime,
  error 
}) {
  const [urlInput, setUrlInput] = useState(sheetUrl || DEFAULT_SHEET_URL);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndSync = (e) => {
    e.preventDefault();
    onUpdateSheetUrl(urlInput);
    onSync(urlInput);
  };

  const handleCopyScript = () => {
    const scriptCode = `function setupHeadersIfNeeded(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Actividad', 'Quién', 'Categoría', 'Ubicación', 'Notas', 'EsDiaCompleto']);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  setupHeadersIfNeeded(sheet);
  var rows = sheet.getDataRange().getValues();
  var events = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[1] && !row[4]) continue;
    var d = row[1];
    var formattedDate = d instanceof Date ? Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(d);
    events.push({
      id: String(row[0] || ('sheet-' + i)),
      date: formattedDate,
      startTime: String(row[2] || '09:00'),
      endTime: String(row[3] || '10:00'),
      title: String(row[4] || 'Sin título'),
      member: String(row[5] || 'family'),
      rawPerson: String(row[5] || 'Familia'),
      category: String(row[6] || 'General'),
      location: String(row[7] || ''),
      description: String(row[8] || ''),
      isAllDay: row[9] === true || String(row[9]).toLowerCase() === 'true'
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true, events: events }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    setupHeadersIfNeeded(sheet);
    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'save';
    var ev = data.event;
    var rows = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(ev.id)) {
        rowIndex = i + 1;
        break;
      }
    }
    if (action === 'delete') {
      if (rowIndex > 1) sheet.deleteRow(rowIndex);
      return ContentService.createTextOutput(JSON.stringify({ success: true, deleted: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var rowValues = [ev.id, ev.date, ev.startTime || '', ev.endTime || '', ev.title, ev.member || 'family', ev.category || 'General', ev.location || '', ev.description || '', Boolean(ev.isAllDay)];
    if (rowIndex > 1) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, saved: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Base de Datos en la Nube</h3>
              <p className="text-[11px] text-slate-500">Google Sheet como almacén automático para ti y tu esposa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Formulario */}
          <form onSubmit={handleSaveAndSync} className="space-y-2.5">
            <label className="block text-xs font-bold uppercase text-slate-600">
              URL del Google Sheet o de la API Web
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... o https://script.google.com/..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                disabled={syncStatus === 'loading'}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'loading' ? 'animate-spin' : ''}`} />
                <span>{syncStatus === 'loading' ? 'Cargando...' : 'Sincronizar'}</span>
              </button>
            </div>

            {syncStatus === 'success' && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Base de datos sincronizada ({lastSyncTime || 'Recién'})</span>
              </div>
            )}

            {syncStatus === 'error' && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Modo local activo</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Para que la app lea y escriba directamente en el Sheet de fondo sin tocarlo, instala el script automático abajo.
                </p>
              </div>
            )}
          </form>

          {/* Guía de 1 minuto para activar la API en el Sheet */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Conectar Google Sheet como Base de Datos
              </span>
              <button
                type="button"
                onClick={handleCopyScript}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                En tu Google Sheet, ve a: <strong>Extensiones &gt; Apps Script</strong>.
              </li>
              <li>
                Pega el código copiado arriba.
              </li>
              <li>
                Haz clic en <strong>Implementar &gt; Nueva implementación</strong> (Tipo: <em>"Aplicación web"</em>, Acceso: <em>"Cualquier persona"</em>).
              </li>
              <li>
                Pega el enlace que te dé en el campo de arriba.
              </li>
            </ol>
            <p className="text-[11px] text-slate-500 font-medium">
              💡 Así tú y tu esposa solo interactúan con esta app y el Google Sheet se actualiza solo en segundo plano.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
