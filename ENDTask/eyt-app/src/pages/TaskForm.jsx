import { useState, useEffect } from "react";
import { tasksAPI } from "../utils/api";

const ESTADOS     = ["Pendiente", "En progreso", "Completada", "Cancelada"];
const PRIORIDADES = ["Baja", "Media", "Alta", "Critica"];
const MESES       = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS        = Array.from({ length: 31 }, (_, i) => i + 1);
const COLORES     = { "Critica":"#e05252","Alta":"#e09052","Media":"#c8a84b","Baja":"#52a8e0" };

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}:</label>
      <div className="relative">
        <select value={value} onChange={onChange}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all cursor-pointer">
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
  const [showForm, setShowForm]           = useState(false);
  const [etiquetas, setEtiquetas]         = useState([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [loading, setLoading]             = useState(false);
  const [tareas, setTareas]               = useState([]);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", estado: "", prioridad: "",
    inicioMes: "", inicioDia: "", finMes: "", finDia: "",
  });

  useEffect(() => {
    tasksAPI.getAll()
      .then((data) => setTareas(data.tareas || []))
      .catch((err) => console.error("Error cargando tareas:", err));
  }, []);

  const ch = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const agregarEtiqueta = () => {
    const val = nuevaEtiqueta.trim();
    if (val && !etiquetas.includes(val)) {
      setEtiquetas([...etiquetas, val]);
      setNuevaEtiqueta("");
    }
  };

  const buildDate = (dia, mes) => {
    if (!dia || !mes) return null;
    const m = String(MESES.indexOf(mes) + 1).padStart(2, "0");
    const d = String(dia).padStart(2, "0");
    return `${new Date().getFullYear()}-${m}-${d}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { alert("El nombre es requerido."); return; }
    setLoading(true);
    try {
      const data = await tasksAPI.create({
        titulo:      form.nombre,
        descripcion: form.descripcion,
        estado:      form.estado    || "Pendiente",
        prioridad:   form.prioridad || "Media",
        fechaInicio: buildDate(form.inicioDia, form.inicioMes),
        fechaFin:    buildDate(form.finDia,    form.finMes),
        etiquetas,
      });
      setTareas((prev) => [data.tarea, ...prev]);
      if (onTaskCreated) onTaskCreated(data.tarea);
      setForm({ nombre:"", descripcion:"", estado:"", prioridad:"", inicioMes:"", inicioDia:"", finMes:"", finDia:"" });
      setEtiquetas([]);
      setShowForm(false);
    } catch (error) {
      alert("Error al guardar tarea: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-center mb-6">
        <button onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg hover:scale-110 transition-transform"
          style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
          {showForm ? "-" : "+"}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-lg" style={{ color: "#c8a84b" }}>Crear nueva Tarea</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">x</button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Nombre:</label>
              <input type="text" required value={form.nombre} onChange={ch("nombre")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Descripcion:</label>
              <textarea rows={4} value={form.descripcion} onChange={ch("descripcion")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Estado"    value={form.estado}    onChange={ch("estado")}    options={ESTADOS} />
              <SelectField label="Prioridad" value={form.prioridad} onChange={ch("prioridad")} options={PRIORIDADES} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-black text-gray-700 border-b border-blue-400 pb-1">Fecha</span>
                {[["Inicio","inicioDia","inicioMes"],["Fin","finDia","finMes"]].map(([lbl,dF,mF]) => (
                  <div key={lbl} className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{lbl}:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[[dF,DIAS,"Dia"],[mF,MESES,"Mes"]].map(([field,opts,ph]) => (
                        <div key={field} className="relative">
                          <select value={form[field]} onChange={ch(field)}
                            className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer">
                            <option value="">{ph}</option>
                            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Etiquetas:</label>
                <div className="bg-gray-100 rounded-xl p-3 min-h-24 flex flex-wrap gap-2 content-start">
                  {etiquetas.map((tag) => (
                    <span key={tag} onClick={() => setEtiquetas(etiquetas.filter((e) => e !== tag))}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white cursor-pointer hover:opacity-80"
                      style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
                      {tag} x
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={nuevaEtiqueta}
                    onChange={(e) => setNuevaEtiqueta(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarEtiqueta())}
                    placeholder="Nueva etiqueta..."
                    className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all" />
                  <button type="button" onClick={agregarEtiqueta}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>+</button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-widest shadow-md active:scale-95 transition-transform disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
              {loading ? "GUARDANDO..." : "GUARDAR TAREA"}
            </button>
          </form>
        </div>
      )}
      {tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
          <p className="text-sm font-semibold">No hay tareas aun. Crea la primera!</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Tareas ({tareas.length})</h3>
          {tareas.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl shadow p-4 flex items-start gap-4">
              <div className="w-2 self-stretch rounded-full flex-shrink-0"
                style={{ background: COLORES[t.prioridad] || "#c8a84b" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-gray-800 text-sm truncate">{t.titulo}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                    style={{ background: "#f0e8c8", color: "#a8882a" }}>{t.estado}</span>
                </div>
                {t.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.descripcion}</p>}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {t.fechaFin && <span className="text-xs text-gray-400">Vence: {new Date(t.fechaFin).toLocaleDateString("es-CO")}</span>}
                  {t.etiquetas?.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-lg text-white font-semibold"
                      style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
