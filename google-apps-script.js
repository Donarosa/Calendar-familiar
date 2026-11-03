/**
 * CÓDIGO PARA TU GOOGLE SHEET (Backend / Base de Datos Automática)
 * 
 * ¿Cómo instalarlo en 1 minuto?
 * 1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/1E5nYSiCUmRTKA7dBB02QtNVWumMVynuKvsP-zausIN4/edit
 * 2. Ve al menú superior: Extensiones > Apps Script.
 * 3. Borra todo lo que haya y pega este código completo.
 * 4. Haz clic en "Implementar" (arriba a la derecha) > "Nueva implementación".
 * 5. Selecciona Tipo: "Aplicación web".
 * 6. En "Ejecutar como": selecciona "Yo".
 * 7. En "Quién tiene acceso": selecciona "Cualquier persona".
 * 8. Haz clic en "Implementar", autoriza los permisos y copia la URL generada.
 * 9. Pega esa URL en el botón "Sheet" de tu aplicación web.
 * 
 * ¡Listo! Tu Google Sheet funcionará como base de datos en la nube. 
 * Tú y tu esposa sólo usan la app y se sincroniza en vivo sin tocar la hoja de cálculo.
 */

function setupHeadersIfNeeded(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'ID',
      'Fecha',
      'Hora Inicio',
      'Hora Fin',
      'Actividad',
      'Quién',
      'Categoría',
      'Ubicación',
      'Notas',
      'EsDiaCompleto'
    ]);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  setupHeadersIfNeeded(sheet);
  
  var rows = sheet.getDataRange().getValues();
  var events = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[1] && !row[4]) continue; // Sin fecha ni título
    
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
    
    // Buscar si ya existe por ID
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(ev.id)) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (action === 'delete') {
      if (rowIndex > 1) {
        sheet.deleteRow(rowIndex);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, deleted: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Si es save (crear o actualizar)
    var rowValues = [
      ev.id,
      ev.date,
      ev.startTime || '',
      ev.endTime || '',
      ev.title,
      ev.member || 'family',
      ev.category || 'General',
      ev.location || '',
      ev.description || '',
      Boolean(ev.isAllDay)
    ];
    
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
}
