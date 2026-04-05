import { useState, useEffect } from "react";
import { Toast } from "../components/Toast";
import { getCourses, getTasks, addTask } from "../utils/storage";
import { ConfirmModal } from "../components/ConfirmModal";
import { ConflictModal } from "../components/ConflictModal";
import { AlertModal } from "../components/AlertModal";

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

const encontrarDiaRecomendado = (fechaOriginal, mapaHoras, limite) => {
  if (!fechaOriginal || fechaOriginal === "—") return null;
  const [diaStr, mesStr] = fechaOriginal.split(" ");
  const d = parseInt(diaStr);
  const mIdx = MESES.indexOf(mesStr);
  if (isNaN(d) || mIdx === -1) return null;
  
  const date = new Date(new Date().getFullYear(), mIdx, d + 1);
  for (let i = 0; i < 14; i++) {
    const tempDia = date.getDate();
    const tempMes = MESES[date.getMonth()];
    const fechaString = `${tempDia} ${tempMes}`;
    const cargaEseDia = Number(mapaHoras[fechaString] || 0);
    if (cargaEseDia < limite) {
      return { dia: tempDia.toString(), mes: tempMes };
    }
    date.setDate(date.getDate() + 1);
  }
  return null;
};

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

export function TaskForm({ user, onTaskCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [conflicto, setConflicto] = useState(null);
  const [pendingTask, setPendingTask] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [toast, setToast] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });
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

  // Cargar cursos y tareas desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cursosSaved, tareasSaved] = await Promise.all([
          getCourses(),
          getTasks()
        ]);
        setCursos(cursosSaved);
        setTareas(tareasSaved);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  const ch = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    if (['inicioDia', 'inicioMes', 'finDia', 'finMes'].includes(f)) setError("");
  };

  const getMonthIndex = (mes) => MESES.indexOf(mes);

  const validateDates = () => {
    const { inicioDia, inicioMes, finDia, finMes } = form;
    
    // Si no se llenó nada, mostrar alerta (a menos que permitas tareas sin fecha, pero el usuario pidió alerta)
    if (!inicioDia || !inicioMes || !finDia || !finMes) {
      setAlert({
        isOpen: true,
        title: "Fechas incompletas",
        message: "Por favor, completa todas las fechas de inicio y entrega para la tarea."
      });
      return false;
    }

    const startMonth = getMonthIndex(inicioMes);
    const endMonth = getMonthIndex(finMes);
    const startDay = parseInt(inicioDia);
    const endDay = parseInt(finDia);

    if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
      setAlert({
        isOpen: true,
        title: "Error en fechas",
        message: "La fecha de entrega debe ser posterior a la fecha de inicio."
      });
      return false;
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setAlert({ 
        isOpen: true, 
        title: "Faltan datos", 
        message: "Por favor, ingresa un nombre para la tarea antes de guardar." 
      });
      return;
    }
    if (!validateDates()) return;

    const limitHours = Number(user?.settings?.limite_diario || 6);

    // Verificar si hay subtareas incompletas (que tengan algo pero no todo)
    const haySubtareaIncompleta = subtareasFormulario.some(s => 
      (s.nombre.trim() || s.dia || s.mes || s.horas) && 
      !(s.nombre.trim() && s.dia && s.mes && s.horas)
    );

    if (haySubtareaIncompleta) {
      setAlert({
        isOpen: true,
        title: "Subtareas incompletas",
        message: "Una o más subtareas tienen campos vacíos. Por favor, complétalas o elimínalas antes de guardar la tarea."
      });
      return;
    }

    const todasLasSubtareasCandidatas = [
      ...subtareas,
      ...subtareasFormulario
        .filter(s => s.nombre.trim() && s.dia && s.mes && s.horas)
        .map((s, i) => ({
          id: Date.now() + i,
          nombre: s.nombre.trim(),
          fecha: `${s.dia} ${s.mes}`,
          horas: parseInt(s.horas),
          estado: "Pendiente"
        }))
    ];

    const tareaTemplate = {
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
      vence: form.prioridad === "Crítica" || form.prioridad === "Alta",
      completada: false,
      subtareas: todasLasSubtareasCandidatas,
    };

    checkAndSaveTask(tareaTemplate, limitHours);
  };

  const checkAndSaveTask = async (tarea, limitHours) => {
    // Validación de sobrecarga
    const horasPorDia = {};

    // Sumar horas de tareas existentes
    tareas.forEach(t => {
      if (t.subtareas && !t.completada && t.estado !== "Completada") {
        t.subtareas.forEach(sub => {
          if (sub.estado !== "Completada" && sub.fecha) {
            horasPorDia[sub.fecha] = Number(horasPorDia[sub.fecha] || 0) + Number(sub.horas || 0);
          }
        });
      }
    });

    // Sumar horas de la nueva tarea y buscar conflictos
    let conflictoEncontrado = null;

    // Check pending subtasks backwards or mapping to keep reference
    for (let c = 0; c < tarea.subtareas.length; c++) {
      const sub = tarea.subtareas[c];
      if (sub.fecha && sub.horas > 0) {
        const currentDayTotal = Number(horasPorDia[sub.fecha] || 0);
        const newTotal = currentDayTotal + Number(sub.horas || 0);

        if (newTotal > Number(limitHours)) {
          conflictoEncontrado = {
            subtarea: sub,
            index: c,
            fecha: sub.fecha,
            exceso: newTotal - limitHours,
            actual: currentDayTotal,
            limite: limitHours,
            horasIntentadas: sub.horas
          };
          break; // Stop at first conflict
        } else {
          horasPorDia[sub.fecha] = newTotal;
        }
      }
    }

    if (conflictoEncontrado) {
      const diaRec = encontrarDiaRecomendado(conflictoEncontrado.fecha, horasPorDia, limitHours);
      setConflicto({ ...conflictoEncontrado, recomendado: diaRec });
      setPendingTask(tarea);
      return;
    }

    // No conflictos, guardar
    try {
      const data = await addTask(tarea);
      const nuevasTareas = [...tareas, data];
      setTareas(nuevasTareas);

      if (onTaskCreated) onTaskCreated(data);

      setToast({ message: "✨ ¡Excelente! La tarea se ha guardado correctamente.", type: "success" });
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
      setConflicto(null);
      setPendingTask(null);
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      setToast({ message: "❌ Lo sentimos, hubo un problema al guardar la tarea. Por favor, intenta de nuevo.", type: "error" });
    }
  };

  const resolverConflicto = (estrategia, nuevoValor) => {
    if (!pendingTask || !conflicto) return;

    const nuevaTarea = { ...pendingTask };
    const nuevasSubtareas = [...nuevaTarea.subtareas];
    const subIdx = conflicto.index;

    if (estrategia === "mover") {
      nuevasSubtareas[subIdx] = { ...nuevasSubtareas[subIdx], fecha: nuevoValor };
    } else if (estrategia === "reducir") {
      nuevasSubtareas[subIdx] = { ...nuevasSubtareas[subIdx], horas: Number(nuevoValor) };
    }

    nuevaTarea.subtareas = nuevasSubtareas;
    setConflicto(null);

    const limitHours = user?.settings?.limite_diario || 6;
    checkAndSaveTask(nuevaTarea, limitHours);
  };

  return (
    <div className="p-8">
      <Toast message={toast?.message} type={toast?.type} />
      {/* Botón + */}
      <div className="flex flex-col items-center justify-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-12 h-12 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg hover:scale-110 transition-transform"
          style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}
          title="Crear nueva tarea"
        >
          {showForm ? "−" : "+"}
        </button>
        {tareas.length === 0 && !showForm && (
          <div className="mt-3 bg-yellow-100 text-yellow-800 px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-sm font-black tracking-widest uppercase">
              Crear Tarea
            </span>
          </div>
        )}
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

            {/* Sección de Fechas */}
            <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Planificación de Fechas
                </span>

                <button
                  type="button"
                  onClick={setDesdeHoy}
                  className="text-[10px] font-black px-3 py-1.5 rounded-xl text-white uppercase tracking-widest hover:scale-105 transition-transform"
                  style={{
                    background: "linear-gradient(135deg, #c8a84b, #a8882a)",
                  }}
                >
                  Establecer desde hoy
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Inicio de tarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    📅 Fecha de Inicio:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        value={form.inicioDia}
                        onChange={ch("inicioDia")}
                        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-amber-100 focus:border-yellow-400 transition-all cursor-pointer shadow-sm"
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
                        value={form.inicioMes}
                        onChange={ch("inicioMes")}
                        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-amber-100 focus:border-yellow-400 transition-all cursor-pointer shadow-sm"
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
                  </div>
                </div>

                {/* Fecha de Entrega */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    🏁 Fecha de Entrega:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        value={form.finDia}
                        onChange={ch("finDia")}
                        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-amber-100 focus:border-yellow-400 transition-all cursor-pointer shadow-sm"
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
                        value={form.finMes}
                        onChange={ch("finMes")}
                        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none appearance-none border border-amber-100 focus:border-yellow-400 transition-all cursor-pointer shadow-sm"
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
                  </div>
                </div>
              </div>
              {error && <p className="text-red-500 text-[10px] font-bold mt-1 text-center bg-red-50 py-1 rounded-lg border border-red-100">{error}</p>}
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
                    <div className="grid grid-cols-6 gap-2 items-center">
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

      <ConflictModal
        conflicto={conflicto}
        recomendado={conflicto?.recomendado}
        onResolve={resolverConflicto}
        onCancel={() => {
          setConflicto(null);
          setPendingTask(null);
        }}
        setToast={setToast}
      />

      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
      />

      {/* Lista de tareas creadas */}
      <TareasList tareas={tareas} setTareas={setTareas} user={user} />
    </div>
  );
}

// ── Lista de tareas guardadas ─────────────────────────────────────
function TareasList({ tareas, setTareas, user }) {
  const [expanded, setExpanded] = useState({});
  const [nuevasSubtareasPorTarea, setNuevasSubtareasPorTarea] = useState({});
  const [toast, setToast] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [editingDate, setEditingDate] = useState({ id: null, type: null, subId: null });
  const [editDateForm, setEditDateForm] = useState({ dia: "", mes: "" });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: null, tareaId: null, subtareaId: null });
  const [conflicto, setConflicto] = useState(null);
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "" });
  const [pendingSubtaskData, setPendingSubtaskData] = useState(null);
  const [editingHours, setEditingHours] = useState({ id: null, subId: null });
  const [editHoursForm, setEditHoursForm] = useState("");
  const limitHours = Number(user?.settings?.limite_diario || 6);

  useEffect(() => {
    // We can also fetch courses here or receive them as props, but since they may change we re-fetch them.
    // In a real app we'd likely use React Context, but we fetch them to keep it simple.
    import("../utils/storage").then(m => m.getCourses().then(setCursos));
  }, []);

  const obtenerColorCurso = (nombreCurso) => {
    const curso = cursos.find((c) => c.nombre === nombreCurso);
    return curso ? curso.color : null;
  };

  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case "Completada": return "#52C452";
      case "En progreso": return "#F59E0B"; // Amber-500
      case "Cancelada": return "#EF4444"; // Red-500
      case "Pendiente": return "#3B82F6"; // Blue-500
      default: return "#3B82F6";
    }
  };

  const cambiarEstadoTarea = async (id, nuevoEstado) => {
    try {
      const isCompletada = nuevoEstado === "Completada";
      const tareaOriginal = tareas.find(t => t.id === id);
      const nuevasSubtareas = isCompletada && tareaOriginal?.subtareas
        ? tareaOriginal.subtareas.map(s => ({ ...s, estado: "Completada" }))
        : tareaOriginal?.subtareas || [];

      await import("../utils/storage").then(m => m.updateTask(id, {
        estado: nuevoEstado,
        subtareas: nuevasSubtareas
      }));

      const nuevasTareas = tareas.map(t => t.id === id ? { ...t, estado: nuevoEstado, subtareas: nuevasSubtareas } : t);
      setTareas(nuevasTareas);
      const emojis = { "Completada": "✅", "En progreso": "⚙️", "Cancelada": "❌", "Pendiente": "⏳" };
      setToast({ message: `${emojis[nuevoEstado]} Estado actualizado a: ${nuevoEstado}`, type: "success" });
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      console.error(error);
      setToast({ message: "❌ No pudimos actualizar la tarea. Por favor, verifica tu conexión.", type: "error" });
    }
  };

  const cambiarEstadoSubtarea = async (tareaId, subtareaId, nuevoEstado) => {
    try {
      const tarea = tareas.find(t => t.id === tareaId);
      if (!tarea) return;

      const nuevasSubtareas = tarea.subtareas.map(s => s.id === subtareaId ? { ...s, estado: nuevoEstado } : s);
      await import("../utils/storage").then(m => m.updateTask(tareaId, { subtareas: nuevasSubtareas }));

      const nuevasTareas = tareas.map(t => t.id === tareaId ? { ...t, subtareas: nuevasSubtareas } : t);
      setTareas(nuevasTareas);
      const emojis = { "Completada": "✅", "En progreso": "⚙️", "Cancelada": "❌", "Pendiente": "⏳" };
      setToast({ message: `${emojis[nuevoEstado]} Subtarea: ${nuevoEstado}`, type: "success" });
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmarEliminarSubtarea = (tareaId, subtareaId) => {
    setConfirmDelete({ isOpen: true, type: 'subtarea', tareaId, subtareaId });
  };

  const ejecutarEliminarSubtarea = async (tareaId, subtareaId) => {
    try {
      const tarea = tareas.find(t => t.id === tareaId);
      if (!tarea) return;

      const nuevasSubtareas = tarea.subtareas.filter(s => s.id !== subtareaId);
      await import("../utils/storage").then(m => m.updateTask(tareaId, { subtareas: nuevasSubtareas }));

      const nuevasTareas = tareas.map(t => t.id === tareaId ? { ...t, subtareas: nuevasSubtareas } : t);
      setTareas(nuevasTareas);
      setToast({ message: "❌ Subtarea eliminada.", type: "success" });
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  const checkAndAddSubtarea = async (tareaId, nuevaSub) => {
    const fecha = `${nuevaSub.dia} ${nuevaSub.mes}`;
    const horasNuevas = parseInt(nuevaSub.horas) || 0;

    // Forzar re-obtención para evitar estado local desactualizado
    let latestTasks = tareas;
    let latestLimit = limitHours;
    try {
      const { getTasks, getCurrentUserProfile } = await import("../utils/storage");
      const [tasks, profile] = await Promise.all([getTasks(), getCurrentUserProfile()]);
      latestTasks = tasks;
      latestLimit = Number(profile?.settings?.limite_diario || 6);
    } catch (e) { console.error(e); }

    const limitNum = latestLimit;

    // Validación de sobrecarga
    let totalHorasDia = 0;
    latestTasks.forEach(t => {
      if (t.subtareas && t.estado !== "Completada") {
        t.subtareas.forEach(sub => {
          if (sub.estado !== "Completada" && sub.fecha === fecha) {
            totalHorasDia += Number(sub.horas || 0);
          }
        });
      }
    });

    const totalFinal = Number(totalHorasDia) + Number(horasNuevas);

    if (totalFinal > limitNum) {
      // Create a temporary hours map for calculation
      const tempHoras = {};
      latestTasks.forEach(t => {
        if (t.subtareas && t.estado !== "Completada") {
          t.subtareas.forEach(s => {
            if (s.estado !== "Completada" && s.fecha) {
              tempHoras[s.fecha] = Number(tempHoras[s.fecha] || 0) + Number(s.horas || 0);
            }
          });
        }
      });
      const rec = encontrarDiaRecomendado(fecha, tempHoras, limitNum);

      setConflicto({
        subtarea: { nombre: nuevaSub.nombre.trim(), dia: nuevaSub.dia, mes: nuevaSub.mes, horas: horasNuevas, id: Date.now() },
        index: null,
        fecha: fecha,
        exceso: totalFinal - limitNum,
        actual: totalHorasDia,
        limite: limitNum,
        horasIntentadas: horasNuevas,
        recomendado: rec
      });
      setPendingSubtaskData({ type: 'add', tareaId, nuevaSub });
      return;
    }

    try {
      const tarea = tareas.find(t => t.id === tareaId);
      if (!tarea) return;

      const subtareasActuales = tarea.subtareas || [];
      const nuevasSubtareas = [...subtareasActuales, { id: Date.now(), nombre: nuevaSub.nombre.trim(), fecha, horas: horasNuevas, estado: "Pendiente" }];

      await import("../utils/storage").then(m => m.updateTask(tareaId, { subtareas: nuevasSubtareas }));

      const nuevasTareas = tareas.map(t => t.id === tareaId ? { ...t, subtareas: nuevasSubtareas } : t);
      setTareas(nuevasTareas);
      setNuevasSubtareasPorTarea(prev => ({ ...prev, [tareaId]: { nombre: "", dia: "", mes: "", horas: "" } }));
      setToast({ message: "➕ Subtarea agregada exitosamente!", type: "success" });
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  const agregarSubtareaExistente = async (tareaId) => {
    const nuevaSub = nuevasSubtareasPorTarea[tareaId];
    if (!nuevaSub || !nuevaSub.nombre.trim() || !nuevaSub.dia || !nuevaSub.mes || !nuevaSub.horas) {
      setAlert({
        isOpen: true,
        title: "Datos incompletos",
        message: "Asegúrate de llenar el nombre, fecha y horas de la subtarea."
      });
      return;
    }
    checkAndAddSubtarea(tareaId, nuevaSub);
  };

  const confirmarEliminarTarea = (id) => {
    setConfirmDelete({ isOpen: true, type: 'tarea', tareaId: id, subtareaId: null });
  };

  const ejecutarEliminarTarea = async (id) => {
    try {
      await import("../utils/storage").then(m => m.deleteTask(id));
      const nuevasTareas = tareas.filter(t => t.id !== id);
      setTareas(nuevasTareas);
      setToast({ message: "🗑️ Tarea eliminada correctamente.", type: "success" });
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.type === 'tarea') {
      ejecutarEliminarTarea(confirmDelete.tareaId);
    } else if (confirmDelete.type === 'subtarea') {
      ejecutarEliminarSubtarea(confirmDelete.tareaId, confirmDelete.subtareaId);
    }
    setConfirmDelete({ isOpen: false, type: null, tareaId: null, subtareaId: null });
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

  const startEditDate = (e, tarea, subId = null) => {
    e.stopPropagation();
    let fecha = subId ? tarea.subtareas.find(s => s.id === subId).fecha : tarea.fin;
    if (fecha && fecha !== "—") {
      const [d, m] = fecha.split(" ");
      setEditDateForm({ dia: d, mes: m });
    } else {
      setEditDateForm({ dia: "", mes: "" });
    }
    setEditingDate({ id: tarea.id, type: subId ? 'subtarea' : 'tarea', subId });
  };

  const checkAndSaveEditedDate = async (editingDateObj, editDateFormObj, overridedSub = null) => {
    const nuevaFecha = `${editDateFormObj.dia} ${editDateFormObj.mes}`;

    try {
      if (editingDateObj.type === 'tarea') {
        await import("../utils/storage").then(m => m.updateTask(editingDateObj.id, { fin: nuevaFecha }));
        setTareas(tareas.map(t => t.id === editingDateObj.id ? { ...t, fin: nuevaFecha } : t));
        setToast({ message: "📅 Fecha de tarea reprogramada exitosamente", type: "success" });
      } else {
        const tarea = tareas.find(t => t.id === editingDateObj.id);
        const subOriginal = overridedSub || tarea.subtareas.find(s => s.id === editingDateObj.subId);

        // Validación de sobrecarga para cambio de fecha de subtarea
        let totalHorasDia = 0;
        tareas.forEach(t => {
          if (t.subtareas && t.estado !== "Completada") {
            t.subtareas.forEach(sub => {
              // No sumar la propia subtarea siendo editada
              if (sub.id === editingDateObj.subId) return;
              if (sub.estado !== "Completada" && sub.fecha === nuevaFecha) {
                totalHorasDia += Number(sub.horas || 0);
              }
            });
          }
        });

        const horasNuevas = parseInt(subOriginal?.horas) || 0;
        if (totalHorasDia + horasNuevas > limitHours) {
          // Calculate temporary hours map
          const tempHoras = {};
          tareas.forEach(t => {
            if (t.subtareas && t.estado !== "Completada") {
              t.subtareas.forEach(s => {
                if (s.id === editingDateObj.subId) return;
                if (s.estado !== "Completada" && s.fecha) {
                  tempHoras[s.fecha] = Number(tempHoras[s.fecha] || 0) + Number(s.horas || 0);
                }
              });
            }
          });
          const rec = encontrarDiaRecomendado(nuevaFecha, tempHoras, limitHours);

          setConflicto({
            subtarea: subOriginal,
            index: null,
            fecha: nuevaFecha,
            exceso: totalHorasDia + horasNuevas - limitHours,
            actual: totalHorasDia,
            limite: limitHours,
            horasIntentadas: horasNuevas,
            recomendado: rec
          });
          setPendingSubtaskData({ type: 'edit', editingDateObj, editDateFormObj, subOriginal });
          return;
        }

        const nuevasSubtareas = tarea.subtareas.map(s => s.id === editingDateObj.subId ? { ...s, fecha: nuevaFecha, horas: horasNuevas } : s);
        await import("../utils/storage").then(m => m.updateTask(editingDateObj.id, { subtareas: nuevasSubtareas }));
        setTareas(tareas.map(t => t.id === editingDateObj.id ? { ...t, subtareas: nuevasSubtareas } : t));
        setToast({ message: "📅 Fecha de subtarea reprogramada exitosamente", type: "success" });
      }
      setTimeout(() => setToast(null), 2500);
      setEditingDate({ id: null, type: null, subId: null });
    } catch (error) {
      console.error(error);
      setToast({ message: "❌ Error al reprogramar fecha", type: "error" });
    }
  };

  const startEditHours = (e, tarea, subId) => {
    e.stopPropagation();
    const sub = tarea.subtareas.find(s => s.id === subId);
    setEditHoursForm(sub.horas.toString());
    setEditingHours({ id: tarea.id, subId });
  };

  const cancelEditHours = (e) => {
    if (e) e.stopPropagation();
    setEditingHours({ id: null, subId: null });
    setEditHoursForm("");
  };

  const saveEditedHours = async (e) => {
    if (e) e.stopPropagation();
    const hNuevas = parseInt(editHoursForm);
    if (isNaN(hNuevas) || hNuevas < 1) return;

    const { id, subId } = editingHours;
    const tarea = tareas.find(t => t.id === id);
    const subOriginal = tarea.subtareas.find(s => s.id === subId);
    
    // Reutilizamos checkAndSaveEditedDate con un objeto dummy
    const dummyDateObj = { id, type: 'subtarea', subId };
    const [d, m] = subOriginal.fecha.split(" ");
    const dummyDateForm = { dia: d, mes: m };
    const overridedSub = { ...subOriginal, horas: hNuevas };

    await checkAndSaveEditedDate(dummyDateObj, dummyDateForm, overridedSub);
    setEditingHours({ id: null, subId: null });
  };

  const saveEditedDate = async (e) => {
    e.stopPropagation();
    if (!editDateForm.dia || !editDateForm.mes) return;
    checkAndSaveEditedDate(editingDate, editDateForm);
  };

  const resolverConflictoList = (estrategia, nuevoValor) => {
    if (!conflicto || !pendingSubtaskData) return;

    setConflicto(null);

    if (pendingSubtaskData.type === 'add') {
      const { tareaId, nuevaSub } = pendingSubtaskData;
      let resSub = { ...nuevaSub };
      if (estrategia === "mover") {
        const [d, m] = nuevoValor.split(" ");
        resSub.dia = d;
        resSub.mes = m;
      } else if (estrategia === "reducir") {
        resSub.horas = Number(nuevoValor);
      }
      checkAndAddSubtarea(tareaId, resSub);
    } else if (pendingSubtaskData.type === 'edit') {
      const { editingDateObj, editDateFormObj, subOriginal } = pendingSubtaskData;
      let resEditDateForm = { ...editDateFormObj };
      let updatedSubOriginal = { ...subOriginal };

      if (estrategia === "mover") {
        const [d, m] = nuevoValor.split(" ");
        resEditDateForm.dia = d;
        resEditDateForm.mes = m;
        checkAndSaveEditedDate(editingDateObj, resEditDateForm, updatedSubOriginal);
      } else if (estrategia === "reducir") {
        updatedSubOriginal.horas = Number(nuevoValor);
        checkAndSaveEditedDate(editingDateObj, editDateFormObj, updatedSubOriginal);
      }
    }
  };

  // Función para categorizar las tareas de forma granular
  const categorizarTareas = (tareasLista) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const categorias = {
      vencidas: [],
      hoy: [],
      mañana: [],
      proximas: {} // Agrupadas por fecha específica
    };

    const ordenar = (arr) => arr.sort((a, b) => {
      const fechaA = parsearFecha(a.fin);
      const fechaB = parsearFecha(b.fin);
      if (fechaA && fechaB) {
        if (fechaA.getTime() !== fechaB.getTime()) {
          return fechaA.getTime() - fechaB.getTime();
        }
      }
      const horasA = a.subtareas?.reduce((sum, s) => Number(sum) + Number(s.horas || 0), 0) || 0;
      const horasB = b.subtareas?.reduce((sum, s) => Number(sum) + Number(s.horas || 0), 0) || 0;
      return Number(horasB) - Number(horasA);
    });

    tareasLista.forEach(tarea => {
      const fecha = parsearFecha(tarea.fin);
      if (!fecha) {
        // Tareas sin fecha van al final de proximas o una categoría especial
        const key = "Sin fecha";
        if (!categorias.proximas[key]) categorias.proximas[key] = [];
        categorias.proximas[key].push(tarea);
        return;
      }

      const fechaCopia = new Date(fecha);
      fechaCopia.setHours(0, 0, 0, 0);

      if (fechaCopia < hoy) {
        categorias.vencidas.push(tarea);
      } else if (fechaCopia.getTime() === hoy.getTime()) {
        categorias.hoy.push(tarea);
      } else if (fechaCopia.getTime() === mañana.getTime()) {
        categorias.mañana.push(tarea);
      } else {
        const key = tarea.fin; // Usamos el string original "dia mes" como llave
        if (!categorias.proximas[key]) categorias.proximas[key] = [];
        categorias.proximas[key].push(tarea);
      }
    });

    categorias.vencidas = ordenar(categorias.vencidas);
    categorias.hoy = ordenar(categorias.hoy);
    categorias.mañana = ordenar(categorias.mañana);
    
    // Las próximas ya están agrupadas, pero podemos ordenar las llaves
    return categorias;
  };

  // Función para obtener color de fondo según estado
  const getBgColorEstado = (estado) => {
    switch (estado) {
      case "Completada": return "bg-green-50 border-l-4 border-green-400";
      case "En progreso": return "bg-amber-50 border-l-4 border-amber-400";
      case "Cancelada": return "bg-red-50 border-l-4 border-red-400";
      case "Pendiente": return "bg-blue-50 border-l-4 border-blue-400";
      default: return "bg-blue-50 border-l-4 border-blue-400";
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
      <ConflictModal
        conflicto={conflicto}
        recomendado={conflicto?.recomendado}
        onResolve={resolverConflictoList}
        onCancel={() => {
          setConflicto(null);
          setPendingSubtaskData(null);
        }}
        setToast={setToast}
      />
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.type === 'tarea' ? 'Eliminar Tarea' : 'Eliminar Subtarea'}
        message={confirmDelete.type === 'tarea'
          ? "¿Estás seguro de que deseas eliminar esta tarea completa? Todas sus subtareas también se borrarán."
          : "¿Estás seguro de que deseas eliminar esta subtarea? Esta acción no se puede deshacer."}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, type: null, tareaId: null, subtareaId: null })}
      />
      <Toast message={toast?.message} type={toast?.type} />
      <AlertModal
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        onConfirm={() => setAlert({ ...alert, isOpen: false })}
      />

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
                      style={{ background: getColorEstado(t.estado) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden max-w-[70%]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nuevoEstado = t.estado === "Completada" ? "Pendiente" : "Completada";
                              cambiarEstadoTarea(t.id, nuevoEstado);
                            }}
                            className={`flex flex-shrink-0 w-5 h-5 rounded-full border-2 items-center justify-center transition-colors ${t.estado === "Completada"
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-gray-300 hover:border-green-400 bg-white"
                              }`}
                            title={t.estado === "Completada" ? "Marcar como pendiente" : "Marcar como completada"}
                          >
                            {t.estado === "Completada" && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <p className={`font-bold text-sm truncate transition-all ${t.estado === "Completada" ? "text-gray-400 line-through" : "text-gray-800"
                            }`}>
                            {t.titulo}
                          </p>
                        </div>
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
                              confirmarEliminarTarea(t.id);
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
                      {t.subtareas && t.subtareas.length > 0 && (() => {
                        const totalSub = t.subtareas.length;
                        const compSub = t.subtareas.filter(s => s.estado === "Completada" || s.estado === "Completado").length;
                        const percent = Math.round((compSub / totalSub) * 100);
                        return (
                          <div className="mt-3 flex items-center gap-3 w-full max-w-xs bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Progreso:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${percent}%`, background: "linear-gradient(135deg, #52c452, #3da13d)" }}
                              ></div>
                            </div>
                            <span className="text-xs font-black text-green-600">{percent}%</span>
                          </div>
                        );
                      })()}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {editingDate.id === t.id && editingDate.type === 'tarea' ? (
                          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-yellow-300" onClick={e => e.stopPropagation()}>
                            <span className="text-xs font-bold text-gray-600">Fin:</span>
                            <select value={editDateForm.dia} onChange={e => setEditDateForm({ ...editDateForm, dia: e.target.value })} className="text-xs px-1 py-0.5 rounded outline-none w-12 cursor-pointer bg-white">
                              <option value="">Día</option>
                              {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select value={editDateForm.mes} onChange={e => setEditDateForm({ ...editDateForm, mes: e.target.value })} className="text-xs px-1 py-0.5 rounded outline-none w-20 cursor-pointer bg-white">
                              <option value="">Mes</option>
                              {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <button type="button" onClick={saveEditedDate} className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-bold hover:bg-green-600">✓</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setEditingDate({ id: null, type: null, subId: null }) }} className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded font-bold hover:bg-gray-500">✕</button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 flex items-center gap-1 group bg-gray-50 px-2 py-1 rounded">
                            📅 {t.inicio} → {t.fin}
                            <button type="button" onClick={(e) => startEditDate(e, t)} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity ml-1 bg-blue-50 rounded-full w-5 h-5 flex items-center justify-center" title="Reprogramar entrega">✏️</button>
                          </span>
                        )}
                        {t.curso && (
                          <span
                            className="text-xs px-3 py-1 rounded-lg text-white font-semibold"
                            style={{ background: obtenerColorCurso(t.curso) || "#c8a84b" }}
                          >
                            📚 {t.curso}
                          </span>
                        )}
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
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nuevoEstado = sub.estado === "Completada" ? "Pendiente" : "Completada";
                                    cambiarEstadoSubtarea(t.id, sub.id, nuevoEstado);
                                  }}
                                  className={`flex flex-shrink-0 w-4 h-4 rounded-full border-2 items-center justify-center transition-colors ${sub.estado === "Completada"
                                      ? "bg-green-500 border-green-500 text-white"
                                      : "border-gray-300 hover:border-green-400 bg-white"
                                    }`}
                                  title={sub.estado === "Completada" ? "Marcar como pendiente" : "Marcar como completada"}
                                >
                                  {sub.estado === "Completada" && (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                                <span className={`flex-1 text-xs transition-all ${sub.estado === "Completada" ? "text-gray-400 line-through" : "text-gray-700"
                                  }`}>
                                  {sub.nombre}
                                </span>
                                {editingDate.id === t.id && editingDate.subId === sub.id ? (
                                  <div className="flex items-center gap-1 scale-95" onClick={e => e.stopPropagation()}>
                                    <select value={editDateForm.dia} onChange={e => setEditDateForm({ ...editDateForm, dia: e.target.value })} className="text-xs px-1 py-0.5 rounded border outline-none w-10">
                                      <option value="">Día</option>
                                      {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select value={editDateForm.mes} onChange={e => setEditDateForm({ ...editDateForm, mes: e.target.value })} className="text-xs px-1 py-0.5 rounded border outline-none w-16">
                                      <option value="">Mes</option>
                                      {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <button type="button" onClick={saveEditedDate} className="text-green-500 hover:text-green-600 font-bold ml-1">✓</button>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditingDate({ id: null, type: null, subId: null }) }} className="text-gray-500 hover:text-gray-600 font-bold ml-1">✕</button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 flex items-center gap-1 group">
                                    📅 {sub.fecha}
                                    <button type="button" onClick={(e) => startEditDate(e, t, sub.id)} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity" title="Reprogramar subtarea">✏️</button>
                                  </span>
                                )}
                                {editingHours.id === t.id && editingHours.subId === sub.id ? (
                                  <div className="flex items-center gap-1 scale-95" onClick={e => e.stopPropagation()}>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      value={editHoursForm} 
                                      onChange={e => setEditHoursForm(e.target.value)} 
                                      className="text-[10px] px-1 py-0.5 rounded border outline-none w-10 bg-white font-bold"
                                    />
                                    <span className="text-[10px] font-bold text-gray-500">h</span>
                                    <button type="button" onClick={saveEditedHours} className="text-green-500 hover:text-green-600 font-bold ml-1">✓</button>
                                    <button type="button" onClick={cancelEditHours} className="text-gray-500 hover:text-gray-600 font-bold ml-1">✕</button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 flex items-center gap-1 group">
                                    ⏱️ {sub.horas}h
                                    <button type="button" onClick={(e) => startEditHours(e, t, sub.id)} className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity" title="Editar horas">✏️</button>
                                  </span>
                                )}
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
                                    confirmarEliminarSubtarea(t.id, sub.id);
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
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Agregar subtarea:</p>
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                          <span className="text-[10px] font-black text-amber-600 uppercase">Límite Diario: {limitHours}h</span>
                          {/* Pequeño calculador de carga en tiempo real */}
                          {(() => {
                            const subForm = nuevasSubtareasPorTarea[t.id];
                            if (subForm?.dia && subForm?.mes) {
                               const dateKey = `${subForm.dia} ${subForm.mes}`;
                               let load = 0;
                               tareas.forEach(tk => {
                                 (tk.subtareas || []).forEach(s => {
                                   if (s.fecha === dateKey && s.estado !== "Completada") load += Number(s.horas || 0);
                                 });
                               });
                               const nextLoad = load + Number(subForm.horas || 0);

                               let levelLabel = "Baja 🟢";
                               let colorClass = "text-green-600";
                               
                               if (nextLoad > limitHours) {
                                 levelLabel = "Sobrecarga 🔴";
                                 colorClass = "text-red-600";
                               } else if (nextLoad > limitHours * 0.85) {
                                 levelLabel = "Alta 🟠";
                                 colorClass = "text-orange-500";
                               } else if (nextLoad > limitHours * 0.5) {
                                 levelLabel = "Media 🟡";
                                 colorClass = "text-yellow-600";
                               }

                               return (
                                 <div className="flex items-center gap-2 ml-2 border-l border-amber-200 pl-2">
                                   <span className={`text-[10px] font-black uppercase ${colorClass}`}>
                                     Carga: {levelLabel} ({nextLoad}h / {limitHours}h)
                                   </span>
                                 </div>
                               );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-2 items-center">
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
          <div className="flex flex-col gap-8">
            {renderCategoria("🔴 Vencidas", "⚠️", categorizado.vencidas, "red")}
            {renderCategoria("📅 Hoy", "⭐", categorizado.hoy, "blue")}
            {renderCategoria("🌅 Mañana", "🕒", categorizado.mañana, "amber")}
            
            {/* Próximas agrupadas por fecha */}
            {Object.keys(categorizado.proximas)
              .sort((a, b) => {
                if (a === "Sin fecha") return 1;
                if (b === "Sin fecha") return -1;
                const dateA = parsearFecha(a);
                const dateB = parsearFecha(b);
                return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
              })
              .map(fechaKey => 
                renderCategoria(`🔮 ${fechaKey}`, "🚀", categorizado.proximas[fechaKey], "indigo")
              )
            }

            {categorizado.vencidas.length === 0 && 
             categorizado.hoy.length === 0 && 
             categorizado.mañana.length === 0 && 
             Object.keys(categorizado.proximas).length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-semibold">
                  No hay tareas aún. ¡Crea la primera!
                </p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
