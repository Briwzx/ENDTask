import React from 'react';

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

export function ConflictModal({ conflicto, onResolve, onCancel, setToast, recomendado }) {
  if (!conflicto) return null;

  const horasLibres = conflicto.limite - conflicto.actual;
  const diaRec = recomendado?.dia || "";
  const mesRec = recomendado?.mes || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-red-100 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm border border-red-100">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Sobrecarga Detectada</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            El día <span className="font-bold text-gray-700">{conflicto.fecha}</span> supera tu límite diario de <span className="font-bold text-red-500">{conflicto.limite}h</span>.
            Actualmente tienes <span className="font-bold">{conflicto.actual}h</span> planificadas e intentas sumar <span className="font-bold">{conflicto.horasIntentadas}h</span> con <em>"{conflicto.subtarea.nombre}"</em>.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Estrategias de Solución</p>
          
          {/* Opción 1: Mover */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-yellow-300 transition-colors">
            <p className="text-sm font-bold text-gray-700 mb-2">
              Opción A: Mover a otro día {recomendado && <span className="text-xs text-yellow-600 ml-1">(Recomendado)</span>}
            </p>
            <div className="flex gap-2">
              <select id="modal-move-day" defaultValue={diaRec} className="flex-1 bg-white rounded-xl px-3 py-2 text-sm text-gray-700 outline-none border border-gray-200">
                <option value="">Nuevo Día</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select id="modal-move-month" defaultValue={mesRec} className="flex-1 bg-white rounded-xl px-3 py-2 text-sm text-gray-700 outline-none border border-gray-200">
                <option value="">Mes</option>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <button 
                onClick={() => {
                  const d = document.getElementById("modal-move-day").value;
                  const m = document.getElementById("modal-move-month").value;
                  if (d && m) onResolve("mover", `${d} ${m}`);
                  else if (setToast) setToast({ message: "⚠️ Por favor, selecciona un día y un mes para reubicar la tarea.", type: "error" });
                }}
                className="px-4 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Opción 2: Reducir (Solo si quedan horas libres) */}
          {horasLibres > 0 ? (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-yellow-300 transition-colors">
              <p className="text-sm font-bold text-gray-700 mb-2">Opción B: Reducir horas estimadas</p>
              <div className="flex gap-2">
                <input 
                  id="modal-reduce-hours"
                  type="number" 
                  min="1" 
                  max={horasLibres}
                  defaultValue={horasLibres}
                  className="flex-1 bg-white rounded-xl px-3 py-2 text-sm text-gray-700 outline-none border border-gray-200"
                />
                <button 
                  onClick={() => {
                    const h = document.getElementById("modal-reduce-hours").value;
                    if (h) onResolve("reducir", h);
                  }}
                  className="px-4 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
              <p className="text-sm font-bold text-red-700">Has alcanzado el límite máximo de horas.</p>
              <p className="text-xs text-red-600 mt-1">No puedes reducir más estas horas en este día. Debes moverla a otra fecha obligatoriamente.</p>
            </div>
          )}
        </div>

        <button
          onClick={onCancel}
          className="mt-6 w-full py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
