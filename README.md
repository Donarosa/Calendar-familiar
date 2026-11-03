# Calendario Familiar Compartido (Frontend para Google Sheets)

Frontend web diseñado específicamente para organizar la vida familiar y de pareja en conjunto con tu esposa, conectado con Google Sheets.

## ✨ Características Principales

1. **Vista Semanal Completa**:
   - Cuadrícula de Lunes a Domingo con franjas horarias de 07:00 a 23:00.
   - Bloques con altura proporcional a la duración del evento.
   - Colores diferenciados por integrante de la familia (Él, Ella, Ambos/Pareja, Hijos).
   - Zona superior para eventos de día completo ("All-day").

2. **Miniatura de Mes (Mini Calendar)**:
   - Navegación rápida entre meses.
   - Indicadores de puntos de colores según quién tiene actividades ese día.
   - Selector interactivo de fecha con botón directo a "Hoy".

3. **Detalle del Día y Horas**:
   - Timeline cronológico con tarjetas descriptivas de cada actividad.
   - Resumen estadístico del día por participante.
   - Ubicación, notas ampliadas y categoría.

4. **Filtros por Integrante de la Familia**:
   - Ver todo el calendario o filtrar solo por **Él (Esposo)**, **Ella (Esposa)**, **Juntos / Pareja** o **Hijos / Escuela**.

5. **Sincronización Inteligente con Google Sheets**:
   - Conexión directa mediante la URL proporcionada: `https://docs.google.com/spreadsheets/d/1E5nYSiCUmRTKA7dBB02QtNVWumMVynuKvsP-zausIN4/edit?usp=sharing`.
   - Soporte para detección automática de columnas (`Fecha`, `Hora Inicio`, `Hora Fin`, `Actividad`, `Quién`, `Categoría`, `Ubicación`, `Notas`).
   - Modo con caché y persistencia local (`LocalStorage`) para acceso instantáneo.

---

## 🚀 Cómo ejecutar el proyecto

El servidor ya se encuentra activo en tu entorno local:
- **URL**: `http://localhost:5180/`

Si deseas detenerlo o volverlo a iniciar en cualquier momento:
```bash
cd /Users/macbook/.gemini/antigravity/scratch/family-calendar
npm run dev
```

Para generar la versión de producción:
```bash
npm run build
```

---

## 📋 Configuración del Google Sheet para Lectura Pública

Para que el navegador pueda leer directamente tu Google Sheet sin restricciones:
1. Abre tu hoja en Google Sheets: [Tu Google Sheet](https://docs.google.com/spreadsheets/d/1E5nYSiCUmRTKA7dBB02QtNVWumMVynuKvsP-zausIN4/edit?usp=sharing).
2. Haz click en el botón azul **"Compartir"** arriba a la derecha.
3. En **"Acceso general"**, cambia de *"Restringido"* a **"Cualquier persona que tenga el vínculo"** con rol de **Lector**.
4. Haz click en el botón **Google Sheet** en la barra superior de la aplicación y pulsa **"Sincronizar"**.
