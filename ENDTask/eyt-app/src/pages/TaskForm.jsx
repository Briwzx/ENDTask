import { useState, useEffect } from "react";
import { Toast } from "../components/Toast";

const ESTADOS = ["Pendiente", "En progreso", "Completada", "Cancelada"];
const PRIORIDADES = ["Baja", "Media", "Alta", "Crítica"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
        {label}:
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all cursor-pointer"
        >
          <option value="">Selecciona</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export function TaskForm({ onTaskCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [etiquetas, setEtiquetas] = useState([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [error, setError] = useState("");
  const [cursos, setCursos] = useState([]);
  const [toast, setToast] = useState(null);
  const [tareas, setTareas] = useState(JSON.parse(localStorage.getItem("eyt_tasks") || "[]"));
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
    prioridad: "",
    curso: "",
    inicioMes: "",
    inicioDia: "",
    finMes: "",
    finDia: "",
  });
  const [subtareas, setSubtareas] = useState([]);
  const [subtareasFormulario, setSubtareasFormulario] = useState([]);

  // Cargar cursos desde localStorage
  useEffect(() => {
    const cursosSaved = JSON.parse(localStorage.getItem("eyt_courses") || "[]");
    setCursos(cursosSaved);
  }, []);

  const ch = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    if (['inicioDia', 'inicioMes', 'finDia', 'finMes'].includes(f)) setError("");
  };

  const getMonthIndex = (mes) => MESES.indexOf(mes);

  const validateDates = () => {
    const { inicioDia, inicioMes, finDia, finMes } = form;
    if (!inicioDia || !inicioMes || !finDia || !finMes) return true; // If not all selected, allow (maybe warn later)

    const startMonth = getMonthIndex(inicioMes);
    const endMonth = getMonthIndex(finMes);
    const startDay = parseInt(inicioDia);
    const endDay = parseInt(finDia);

    if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
      setError("La fecha de entrega no puede ser anterior a la fecha de inicio.");
      return false;
    }
    setError("");
    return true;
  };

  const setDesdeHoy = () => {
    const hoy = new Date();
    const dia = hoy.getDate();
    const mesIndex = hoy.getMonth(); // 0 - 11

    setForm((prev) => ({
      ...prev,
      inicioDia: dia,
      inicioMes: MESES[mesIndex],
    }));
  };

  const agregarEtiqueta = () => {
    const val = nuevaEtiqueta.trim();
    if (val && !etiquetas.includes(val)) {
      setEtiquetas([...etiquetas, val]);
      setNuevaEtiqueta("");
    }
  };


  const actualizarSubtareaForm = (index, field, value) => {
    const newForm = [...subtareasFormulario];
    newForm[index] = { ...newForm[index], [field]: value };
    setSubtareasFormulario(newForm);
  };

  const eliminarSubtareaFormulario = (index) => {
    setSubtareasFormulario(subtareasFormulario.filter((_, idx) => idx !== index));
  };

  const eliminarSubtarea = (id) => {
    setSubtareas(subtareas.filter(s => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setToast({ message: "❌ El nombre es requerido.", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (!validateDates()) return;

    const tarea = {
      id: Date.now(),
      titulo: form.nombre,
      descripcion: form.descripcion,
      estado: form.estado || "Pendiente",
      prioridad: form.prioridad || "Media",
      curso: form.curso || null,
      inicio:
        form.inicioMes && form.inicioDia
          ? `${form.inicioDia} ${form.inicioMes}`
          : "—",
      fin: form.finMes && form.finDia ? `${form.finDia} ${form.finMes}` : "—",
      etiquetas,
      fecha: new Date().toLocaleDateString("es-CO"),
      vence: form.prioridad === "Crítica" || form.prioridad === "Alta",
      completada: false,
      subtareas,
    };

    const prev = JSON.parse(localStorage.getItem("eyt_tasks") || "[]");
    const nuevasTareas = [...prev, tarea];
    localStorage.setItem("eyt_tasks", JSON.stringify(nuevasTareas));
    setTareas(nuevasTareas);

    if (onTaskCreated) onTaskCreated(tarea);
    
    setToast({ message: "✨ ¡Tarea creada exitosamente!", type: "success" });
    setTimeout(() => setToast(null), 3000);

    setForm({
      nombre: "",
      descripcion: "",
      estado: "",
      prioridad: "",
      curso: "",
      inicioMes: "",
      inicioDia: "",
      finMes: "",
      finDia: "",
    });
    setEtiquetas([]);
    setSubtareas([]);
    setSubtareasFormulario([]);
    setNuevaEtiqueta("");
    setError("");
    setShowForm(false);
  };

  return (
    <div className="p-8">
      <Toast message={toast?.message} type={toast?.type} />
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
        <div
          className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl mx-auto"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-lg" style={{ color: "#c8a84b" }}>
              Crear nueva Tarea
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Nombre:
              </label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={ch("nombre")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all"
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Descripción:
              </label>
              <textarea
                rows={4}
                value={form.descripcion}
                onChange={ch("descripcion")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Estado + Prioridad + Curso */}
            <div className="grid grid-cols-3 gap-4">
              <SelectField
                label="Estado"
                value={form.estado}
                onChange={ch("estado")}
                options={ESTADOS}
              />
              <SelectField
                label="Prioridad"
                value={form.prioridad}
                onChange={ch("prioridad")}
                options={PRIORIDADES}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Curso:
                </label>
                <div className="relative">
                  <select
                    value={form.curso}
                    onChange={ch("curso")}
                    className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Sin curso</option>
                    {cursos.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Fechas + Etiquetas */}
            <div className="grid grid-cols-2 gap-6">
              {/* Fechas */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-blue-400 pb-1">
                  <span className="text-sm font-black text-gray-700">
                    Fecha
                  </span>

                  <button
                    type="button"
                    onClick={setDesdeHoy}
                    className="text-xs font-bold px-3 py-1 rounded-lg text-white hover:scale-105 transition-transform"
                    style={{
                      background: "linear-gradient(135deg, #c8a84b, #a8882a)",
                    }}
                  >
                    Desde hoy
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Inicio de tarea:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        value={form.inicioDia}
                        onChange={ch("inicioDia")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                      >
                        <option value="">Día</option>
                        {DIAS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    <div className="relative">
                      <select
                        value={form.inicioMes}
                        onChange={ch("inicioMes")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                      >
                        <option value="">Mes</option>
                        {MESES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Fecha de Entrega:
                  </label>
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        value={form.finDia}
                        onChange={ch("finDia")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                      >
                        <option value="">Día</option>
                        {DIAS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    <div className="relative">
                      <select
                        value={form.finMes}
                        onChange={ch("finMes")}
                        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                      >
                        <option value="">Mes</option>
                        {MESES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Etiquetas */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Etiquetas:
                </label>
                <div className="bg-gray-100 rounded-xl p-3 min-h-24 flex flex-wrap gap-2 content-start">
                  {etiquetas.map((tag) => (
                    <span
                      key={tag}
                      onClick={() =>
                        setEtiquetas(etiquetas.filter((e) => e !== tag))
                      }
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        background: "linear-gradient(135deg, #c8a84b, #a8882a)",
                      }}
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
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), agregarEtiqueta())
                    }
                    placeholder="Nueva etiqueta..."
                    className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={agregarEtiqueta}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform"
                    style={{
                      background: "linear-gradient(135deg, #c8a84b, #a8882a)",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Subtareas */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-blue-400 pb-1">
                <span className="text-sm font-black text-gray-700">
                  Subtareas
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {subtareas.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <span className="flex-1 text-sm text-gray-700">{sub.nombre}</span>
                    <span className="text-xs text-gray-500">📅 {sub.fecha}</span>
                    <span className="text-xs text-gray-500">⏱️ {sub.horas}h</span>
                    <button
                      type="button"
                      onClick={() => eliminarSubtarea(sub.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {subtareasFormulario.map((sub, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className="grid grid-cols-5 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre subtarea"
                        value={sub.nombre}
                        onChange={(e) => actualizarSubtareaForm(idx, "nombre", e.target.value)}
                        className="col-span-2 bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all"
                      />
                      <div className="relative">
                        <select
                          value={sub.dia}
                          onChange={(e) => actualizarSubtareaForm(idx, "dia", e.target.value)}
                          className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                        >
                          <option value="">Día</option>
                          {DIAS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <div className="relative">
                        <select
                          value={sub.mes}
                          onChange={(e) => actualizarSubtareaForm(idx, "mes", e.target.value)}
                          className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                        >
                          <option value="">Mes</option>
                          {MESES.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Horas"
                        value={sub.horas}
                        onChange={(e) => actualizarSubtareaForm(idx, "horas", e.target.value)}
                        className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all"
                      />
                      <div className="flex gap-1 justify-end items-center">
                        <button
                          type="button"
                          onClick={() => eliminarSubtareaFormulario(idx)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform bg-red-500 hover:bg-red-600"
                          title="Eliminar subtarea"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSubtareasFormulario([...subtareasFormulario, { nombre: "", dia: "", mes: "", horas: "" }])}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl hover:scale-110 transition-transform mx-auto"
                  style={{
                    background: "linear-gradient(135deg, #c8a84b, #a8882a)",
                  }}
                  title="Agregar otra subtarea vacía"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botón guardar */}
            <button
              type="submit"
              className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-widest shadow-md active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(135deg, #c8a84b, #a8882a)",
              }}
            >
              GUARDAR TAREA
            </button>
          </form>
        </div>
      )}

      {/* Lista de tareas creadas */}
      <TareasList tareas={tareas} setTareas={setTareas} />
    </div>
  );
}

// ── Lista de tareas guardadas ─────────────────────────────────────
function TareasList({ tareas, setTareas }) {
  const [expanded, setExpanded] = useState({});
  const [nuevasSubtareasPorTarea, setNuevasSubtareasPorTarea] = useState({});
  const [toast, setToast] = useState(null);
  const cursos = JSON.parse(localStorage.getItem("eyt_courses") || "[]");

  const obtenerColorCurso = (nombreCurso) => {
    const curso = cursos.find((c) => c.nombre === nombreCurso);
    return curso ? curso.color : null;
  };

  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getColorEstado = (estado) => {
    switch(estado) {
      case "Completada": return "#52c452";
      case "En progreso": return "#c8a84b";
      case "Cancelada": return "#e05252";
      default: return "#d1d5db";
    }
  };

  const cambiarEstadoTarea = (id, nuevoEstado) => {
    const nuevasTareas = tareas.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t);
    setTareas(nuevasTareas);
    localStorage.setItem("eyt_tasks", JSON.stringify(nuevasTareas));
    const emojis = { "Completada": "✅", "En progreso": "⚙️", "Cancelada": "❌", "Pendiente": "⏳" };
    setToast({ message: `${emojis[nuevoEstado]} Estado actualizado a ${nuevoEstado}`, type: "success" });
    setTimeout(() => setToast(null), 2500);
  };

  const cambiarEstadoSubtarea = (tareaId, subtareaId, nuevoEstado) => {
    const nuevasTareas = tareas.map(t => {
      if (t.id === tareaId) {
        return {
          ...t,
          subtareas: t.subtareas.map(s => s.id === subtareaId ? { ...s, estado: nuevoEstado } : s)
        };
      }
      return t;
    });
    setTareas(nuevasTareas);
    localStorage.setItem("eyt_tasks", JSON.stringify(nuevasTareas));
    const emojis = { "Completada": "✅", "En progreso": "⚙️", "Cancelada": "❌", "Pendiente": "⏳" };
    setToast({ message: `${emojis[nuevoEstado]} Subtarea: ${nuevoEstado}`, type: "success" });
    setTimeout(() => setToast(null), 2500);
  };

  const eliminarSubtareaExistente = (tareaId, subtareaId) => {
    const nuevasTareas = tareas.map(t => {
      if (t.id === tareaId) {
        return {
          ...t,
          subtareas: t.subtareas.filter(s => s.id !== subtareaId)
        };
      }
      return t;
    });
    setTareas(nuevasTareas);
    localStorage.setItem("eyt_tasks", JSON.stringify(nuevasTareas));
    setToast({ message: "❌ Subtarea eliminada.", type: "success" });
    setTimeout(() => setToast(null), 2500);
  };

  const agregarSubtareaExistente = (tareaId) => {
    const nuevaSub = nuevasSubtareasPorTarea[tareaId];
    if (nuevaSub && nuevaSub.nombre.trim() && nuevaSub.dia && nuevaSub.mes && nuevaSub.horas) {
      const nuevasTareas = tareas.map(t => {
        if (t.id === tareaId) {
          const subtareasActuales = t.subtareas || [];
          return {
            ...t,
            subtareas: [...subtareasActuales, { id: Date.now(), nombre: nuevaSub.nombre.trim(), fecha: `${nuevaSub.dia} ${nuevaSub.mes}`, horas: parseInt(nuevaSub.horas), estado: "Pendiente" }]
          };
        }
        return t;
      });
      setTareas(nuevasTareas);
      localStorage.setItem("eyt_tasks", JSON.stringify(nuevasTareas));
      setNuevasSubtareasPorTarea(prev => ({ ...prev, [tareaId]: { nombre: "", dia: "", mes: "", horas: "" } }));
      setToast({ message: "➕ Subtarea agregada exitosamente!", type: "success" });
      setTimeout(() => setToast(null), 2500);
    }
  };

  const eliminarTarea = (id) => {
    const nuevasTareas = tareas.filter(t => t.id !== id);
    setTareas(nuevasTareas);
    localStorage.setItem("eyt_tasks", JSON.stringify(nuevasTareas));
    setToast({ message: "🗑️ Tarea eliminada correctamente.", type: "success" });
    setTimeout(() => setToast(null), 2500);
  };

  const actualizarNuevaSubtarea = (tareaId, field, value) => {
    setNuevasSubtareasPorTarea(prev => ({
      ...prev,
      [tareaId]: { ...prev[tareaId] || { nombre: "", dia: "", mes: "", horas: "" }, [field]: value }
    }));
  };

  // Función para convertir "día mes" a Date objeto
  const parsearFecha = (fechaStr) => {
    if (!fechaStr || fechaStr === "—") return null;
    const [dia, mes] = fechaStr.split(" ");
    const mesIndex = MESES.indexOf(mes);
    if (mesIndex === -1 || !dia) return null;
    const hoy = new Date();
    return new Date(hoy.getFullYear(), mesIndex, parseInt(dia));
  };

  // Función para categorizar las tareas
  const categorizarTareas = (tareasLista) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const vencidas = [];
    const hoytareas = [];
    const proximas = [];

    tareasLista.forEach(tarea => {
      const fecha = parsearFecha(tarea.fin);
      if (!fecha) return;
      
      const fechaCopia = new Date(fecha);
      fechaCopia.setHours(0, 0, 0, 0);
      
      if (fechaCopia < hoy) {
        vencidas.push(tarea);
      } else if (fechaCopia.getTime() === hoy.getTime()) {
        hoytareas.push(tarea);
      } else {
        proximas.push(tarea);
      }
    });

    // Ordenar cada categoría por fecha y luego por horas
    const ordenar = (arr) => arr.sort((a, b) => {
      const fechaA = parsearFecha(a.fin);
      const fechaB = parsearFecha(b.fin);
      if (fechaA && fechaB) {
        if (fechaA.getTime() !== fechaB.getTime()) {
          return fechaA.getTime() - fechaB.getTime();
        }
      }
      // Si empate, ordenar por horas estimadas
      const horasA = a.subtareas?.reduce((sum, s) => sum + (s.horas || 0), 0) || 0;
      const horasB = b.subtareas?.reduce((sum, s) => sum + (s.horas || 0), 0) || 0;
      return horasB - horasA;
    });

    return {
      vencidas: ordenar(vencidas),
      hoy: ordenar(hoytareas),
      proximas: ordenar(proximas)
    };
  };

  // Función para obtener color de fondo según estado
  const getBgColorEstado = (estado) => {
    switch(estado) {
      case "Completada": return "bg-green-50 border-l-4 border-green-400";
      case "En progreso": return "bg-amber-50 border-l-4 border-amber-400";
      case "Cancelada": return "bg-red-50 border-l-4 border-red-400";
      default: return "bg-gray-50 border-l-4 border-gray-300";
    }
  };

  if (tareas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
        <svg
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm font-semibold">
          No hay tareas aún. ¡Crea la primera!
        </p>
      </div>
    );
  }

  const COLORES_PRIORIDAD = {
    Crítica: "#e05252",
    Alta: "#e09052",
    Media: "#c8a84b",
    Baja: "#52a8e0",
  };

  return (
    <div className="mt-6 max-w-2xl mx-auto flex flex-col gap-6">
      <Toast message={toast?.message} type={toast?.type} />
      
      {/* Información de orden */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-3">
        <p className="text-xs font-semibold text-blue-800">
          📋 Las tareas se organizan por: <span className="font-bold">Fecha de vencimiento</span>
        </p>
      </div>

      {(() => {
        const categorizado = categorizarTareas(tareas);
        
        const renderCategoria = (titulo, icono, tareasList, colorBorde) => {
          if (tareasList.length === 0) return null;
          
          return (
            <div key={titulo} className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <span>{icono}</span> {titulo} ({tareasList.length})
              </h3>
              {tareasList.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl shadow p-4 flex flex-col gap-2 cursor-pointer transition-all ${getBgColorEstado(t.estado)}`}
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  onClick={() => toggleExpanded(t.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-2 self-stretch rounded-full flex-shrink-0"
                      style={{ background: COLORES_PRIORIDAD[t.prioridad] || "#c8a84b" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {t.titulo}
                        </p>
                        <div className="flex items-center gap-2">
                          <select
                            value={t.estado}
                            onChange={(e) => cambiarEstadoTarea(t.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs px-2 py-0.5 rounded-full font-semibold outline-none text-white"
                            style={{ background: getColorEstado(t.estado) }}
                          >
                            {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                          </select>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarTarea(t.id);
                            }}
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
                            title="Eliminar tarea"
                          >
                            🗑️
                          </button>
                          <span className="text-xs text-gray-400">
                            {expanded[t.id] ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>
                      {t.descripcion && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {t.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-xs text-gray-400">
                          📅 {t.inicio} → {t.fin}
                        </span>
                        {t.curso && (
                          <span
                            className="text-xs px-3 py-1 rounded-lg text-white font-semibold"
                            style={{ background: obtenerColorCurso(t.curso) || "#c8a84b" }}
                          >
                            📚 {t.curso}
                          </span>
                        )}
                        {t.etiquetas?.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-lg text-white font-semibold"
                            style={{
                              background: "linear-gradient(135deg, #c8a84b, #a8882a)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {expanded[t.id] && (
                    <div className="mt-2 pl-6 border-l-2 border-gray-200">
                      {t.subtareas && t.subtareas.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Subtareas:</p>
                          <div className="flex flex-col gap-2 mb-3">
                            {t.subtareas.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                <span className="flex-1 text-xs text-gray-700">{sub.nombre}</span>
                                <span className="text-xs text-gray-500">📅 {sub.fecha}</span>
                                <span className="text-xs text-gray-500">⏱️ {sub.horas}h</span>
                                <select
                                  value={sub.estado}
                                  onChange={(e) => cambiarEstadoSubtarea(t.id, sub.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                className="text-xs px-2 py-0.5 rounded font-semibold outline-none text-white"
                                style={{ background: getColorEstado(sub.estado) }}
                                >
                                  {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                                </select>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarSubtareaExistente(t.id, sub.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold text-sm"
                                  title="Eliminar subtarea"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Agregar subtarea:</p>
                      <div className="grid grid-cols-5 gap-2">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={nuevasSubtareasPorTarea[t.id]?.nombre || ""}
                          onChange={(e) => actualizarNuevaSubtarea(t.id, "nombre", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="col-span-2 bg-gray-100 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all"
                        />
                        <div className="relative">
                          <select
                            value={nuevasSubtareasPorTarea[t.id]?.dia || ""}
                            onChange={(e) => actualizarNuevaSubtarea(t.id, "dia", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-gray-100 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                          >
                            <option value="">Día</option>
                            {DIAS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="relative">
                          <select
                            value={nuevasSubtareasPorTarea[t.id]?.mes || ""}
                            onChange={(e) => actualizarNuevaSubtarea(t.id, "mes", e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-gray-100 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer"
                          >
                            <option value="">Mes</option>
                            {MESES.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <input
                          type="number"
                          placeholder="Horas"
                          value={nuevasSubtareasPorTarea[t.id]?.horas || ""}
                          onChange={(e) => actualizarNuevaSubtarea(t.id, "horas", e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-gray-100 rounded-lg px-2 py-1.5 text-xs text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all"
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              agregarSubtareaExistente(t.id);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform"
                            style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}
                            title="Agregar subtarea"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        };

        return (
          <>
            {renderCategoria("🔴 Vencidas", "⚠️", categorizado.vencidas, "red")}
            {renderCategoria("📅 Hoy", "⭐", categorizado.hoy, "blue")}
            {renderCategoria("🔮 Próximas", "🚀", categorizado.proximas, "green")}
            {categorizado.vencidas.length === 0 && categorizado.hoy.length === 0 && categorizado.proximas.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-semibold">
                  No hay tareas aún. ¡Crea la primera!
                </p>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
