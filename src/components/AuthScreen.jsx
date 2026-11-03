import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CalendarDays, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function AuthScreen({ onAuthenticate }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.trim() === 'India2026') {
      setError(false);
      onAuthenticate();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 antialiased font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Calendario Familiar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Ingresa la contraseña familiar para acceder en este dispositivo
          </p>
        </div>

        {/* Formulario de contraseña */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Contraseña de acceso
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Ingresa la contraseña..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2
                  ${error 
                    ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-rose-400/40' 
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-800'
                  }
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1 animate-in fade-in">
                <span>⚠️ Contraseña incorrecta. Intenta nuevamente.</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <span>Acceder al Calendario</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Nota al pie */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Acceso privado protegido • Santi, Lu, Bru, Ama, Indi</span>
        </div>
      </div>
    </div>
  );
}
