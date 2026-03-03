import { useState } from "react";

const ESTADOS     = ["Pendiente", "En progreso", "Completada", "Cancelada"];
const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"];
const MESES       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS        = Array.from({ length: 31 }, (_, i) => i + 1);

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}:</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">Selecciona</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function TaskForm({ onTaskCreated }) {
  const [showForm, setShowForm]         = useState(false);
  const [etiquetas, setEtiquetas]       = useState([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [form, setForm] = useState({
    nombre: "", descripcion: "",
    estado: "", prioridad: "",
    inicioMes: "", inicioDia: "",
    finMes: "",   finDia: "",
  });

  const ch = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const agregarEtiqueta = () => {
    const val = nuevaEtiqueta.trim();
    if (val && !etiquetas.includes(val)) {
      setEtiquetas([...etiquetas, val]);
      setNuevaEtiqueta("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { alert("El nombre es requerido."); return; }

    const tarea = {
      id:          Date.now(),
      titulo:      form.nombre,
      descripcion: form.descripcion,
      estado:      form.estado    || "Pendiente",
      prioridad:   form.prioridad || "Media",
      inicio:      form.inicioMes && form.inicioDia ? `${form.inicioDia} ${form.inicioMes}` : "—",
      fin:         form.finMes    && form.finDia    ? `${form.finDia} ${form.finMes}`       : "—",
      etiquetas,
      fecha:       new Date().toLocaleDateString("es-CO"),
      vence:       form.prioridad === "Crítica" || form.prioridad === "Alta",
      completada:  false,
    };

    const prev = JSON.parse(localStorage.getItem("eyt_tasks") || "[]");
    localStorage.setItem("eyt_tasks", JSON.stringify([...prev, tarea]));

    if (onTaskCreated) onTaskCreated(tarea);

    setForm({ nombre:"", descripcion:"", estado:"", prioridad:"", inicioMes:"", inicioDia:"", finMes:"", finDia:"" });
    setEtiquetas([]);
    setShowForm(false);
  };

  return (
    <div className="p-8">
      {/* Botón + */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg hover:scale-110 transition-transform"
          style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}
          title="Crear nueva tarea"
        >
          {showForm ? "−" : "+"}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-lg" style={{ color: "#c8a84b" }}>
              Crear nueva Tarea
            </h2>
            <button onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Nombre:</label>
              <input
                type="text" required value={form.nombre} onChange={ch("nombre")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Descripción:</label>
              <textarea
                rows={4} value={form.descripcion} onChange={ch("descripcion")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Estado + Prioridad */}
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Estado"    value={form.estado}    onChange={ch("estado")}    options={ESTADOS} />
              <SelectField label="Prioridad" value={form.prioridad} onChange={ch("prioridad")} options={PRIORIDADES} />
            </div>

            {/* Fechas + Etiquetas */}
            <div className="grid grid-cols-2 gap-6">

              {/* Fechas */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-black text-gray-700 border-b border-blue-400 pb-1">Fecha</span>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Inicio:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select value={form.inicioDia} onChange={ch("inicioDia")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer">
                        <option value="">Día</option>
                        {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="relative">
                      <select value={form.inicioMes} onChange={ch("inicioMes")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer">
                        <option value="">Mes</option>
                        {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Fin:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select value={form.finDia} onChange={ch("finDia")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer">
                        <option value="">Día</option>
                        {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="relative">
                      <select value={form.finMes} onChange={ch("finMes")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer">
                        <option value="">Mes</option>
                        {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Etiquetas */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Etiquetas:</label>
                <div className="bg-gray-100 rounded-xl p-3 min-h-24 flex flex-wrap gap-2 content-start">
                  {etiquetas.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => setEtiquetas(etiquetas.filter((e) => e !== tag))}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}
                      title="Click para quitar"
                    >
                      {tag} ✕
                    </span>
                  ))}
                </div>
                {/* Input nueva etiqueta */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevaEtiqueta}
                    onChange={(e) => setNuevaEtiqueta(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarEtiqueta())}
                    placeholder="Nueva etiqueta..."
                    className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={agregarEtiqueta}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform"
                    style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Botón guardar */}
            <button
              type="submit"
              className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-widest shadow-md active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}
            >
              GUARDAR TAREA
            </button>
          </form>
        </div>
      )}

      {/* Lista de tareas creadas */}
      <TareasList />
    </div>
  );
}

// ── Lista de tareas guardadas ─────────────────────────────────────
function TareasList() {
  const tareas = JSON.parse(localStorage.getItem("eyt_tasks") || "[]");

  if (tareas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm font-semibold">No hay tareas aún. ¡Crea la primera!</p>
      </div>
    );
  }

  const COLORES_PRIORIDAD = {
    "Crítica": "#e05252",
    "Alta":    "#e09052",
    "Media":   "#c8a84b",
    "Baja":    "#52a8e0",
  };

  return (
    <div className="mt-6 max-w-2xl mx-auto flex flex-col gap-3">
      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Tareas creadas</h3>
      {tareas.map((t) => (
        <div key={t.id} className="bg-white rounded-2xl shadow p-4 flex items-start gap-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div className="w-2 self-stretch rounded-full flex-shrink-0"
            style={{ background: COLORES_PRIORIDAD[t.prioridad] || "#c8a84b" }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-gray-800 text-sm truncate">{t.titulo}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                style={{ background: "#f0e8c8", color: "#a8882a" }}>
                {t.estado}
              </span>
            </div>
            {t.descripcion && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.descripcion}</p>
            )}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-gray-400">📅 {t.inicio} → {t.fin}</span>
              {t.etiquetas?.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-lg text-white font-semibold"
                  style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
