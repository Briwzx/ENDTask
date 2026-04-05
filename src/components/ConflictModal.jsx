import React from 'react';

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

export function ConflictModal({ conflicto, onResolve, onCancel, showToast, recomendado }) {
  if (!conflicto) return null;

  const horasLibres = conflicto.limite - conflicto.actual;
  const diaRec = recomendado?.dia || "";
  const mesRec = recomendado?.mes || "";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-[32px] shadow-premium p-10 max-w-lg w-full border border-border animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-red-50 text-status-error rounded-full flex items-center justify-center text-4xl mb-6 border-4 border-red-100 shadow-sm">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-dark tracking-tight mb-2">Sobrecarga Detectada</h2>
          <p className="text-muted text-sm leading-relaxed px-4">
            El día <span className="font-bold text-dark">{conflicto.fecha}</span> supera tu límite diario de <span className="font-bold text-status-error">{conflicto.limite}h</span>.
            Actualmente tienes <span className="font-bold text-dark">{conflicto.actual}h</span> planificadas e intentas sumar <span className="font-bold text-dark">{conflicto.horasIntentadas}h</span> con <em>"{conflicto.subtarea.nombre}"</em>.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Opciones de Solución</p>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          
          {/* Opción 1: Mover */}
          <div className="group bg-bg p-6 rounded-3xl border border-border hover:border-primary-light transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-dark">
                A: Mover a otro día
              </p>
              {recomendado && (
                <span className="text-[10px] bg-primary text-white font-black px-2 py-1 rounded-full tracking-widest animate-pulse">
                  RECOMENDADO
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <select 
                  id="modal-move-day" 
                  defaultValue={diaRec} 
                  className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-dark outline-none border border-border focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Día</option>
                  {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex-[1.5] relative">
                <select 
                  id="modal-move-month" 
                  defaultValue={mesRec} 
                  className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-dark outline-none border border-border focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Mes</option>
                  {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button 
                onClick={() => {
                  const d = document.getElementById("modal-move-day").value;
                  const m = document.getElementById("modal-move-month").value;
                  if (d && m) onResolve("mover", `${d} ${m}`);
                  else if (showToast) showToast("Por favor, selecciona día y mes.", "error");
                }}
                className="px-6 bg-primary text-white rounded-xl text-xs font-black tracking-widest hover:bg-primary-light transition-all shadow-md active:scale-95"
              >
                MOVER
              </button>
            </div>
          </div>

          {/* Opción 2: Reducir */}
          {horasLibres > 0 ? (
            <div className="group bg-bg p-6 rounded-3xl border border-border hover:border-primary-light transition-all duration-300 shadow-sm hover:shadow-md">
              <p className="text-sm font-bold text-dark mb-4">B: Reducir horas estimadas</p>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input 
                    id="modal-reduce-hours"
                    type="number" 
                    min="1" 
                    max={horasLibres}
                    defaultValue={horasLibres}
                    className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-dark outline-none border border-border focus:border-primary transition-all shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">h</span>
                </div>
                <button 
                  onClick={() => {
                    const h = document.getElementById("modal-reduce-hours").value;
                    if (h) onResolve("reducir", h);
                  }}
                  className="px-6 bg-dark text-white rounded-xl text-xs font-black tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                >
                  APLICAR
                </button>
              </div>
              <p className="text-[10px] text-muted mt-3 font-semibold">
                * Máximo permitido para este día: <span className="text-primary">{horasLibres}h</span>
              </p>
            </div>
          ) : (
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-start gap-4">
              <span className="text-xl">🚫</span>
              <div>
                <p className="text-sm font-bold text-status-error mb-1">Agenda Llena</p>
                <p className="text-[11px] text-red-600 leading-relaxed font-semibold">
                  No quedan horas disponibles hoy. Debes mover esta subtarea a otra fecha obligatoriamente.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onCancel}
          className="mt-8 w-full py-4 rounded-2xl text-xs font-black text-muted hover:text-dark hover:bg-bg transition-all tracking-[0.2em] border border-transparent hover:border-border"
        >
          CANCELAR OPERACIÓN
        </button>
      </div>
    </div>
  );
}
