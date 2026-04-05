import { useState, useEffect } from "react";
import { getCourses, addCourse, deleteCourse } from "../utils/storage";
import { ConfirmModal } from "../components/ConfirmModal";

const COLORES_CURSOS = [
  "#e05252",
  "#e09052",
  "#c8a84b",
  "#52a8e0",
  "#52e0a0",
  "#9052e0",
];

export function AddCurse() {
  const [cursos, setCursos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nombreCurso, setNombreCurso] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState(null);

  // Cargar cursos desde Supabase
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setLoading(true);
        const cursosSaved = await getCourses();
        setCursos(cursosSaved);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCursos();
  }, []);

  const agregarCurso = async (e) => {
    e.preventDefault();
    const nombre = nombreCurso.trim();
    if (!nombre) return;

    const nuevoCurso = {
      nombre,
      color: COLORES_CURSOS[colorIndex]
    };

    try {
      const data = await addCourse(nuevoCurso);
      setCursos([...cursos, data]);
      setNombreCurso("");
      setColorIndex(0);
      setShowForm(false);
    } catch (error) {
      console.error("Error al agregar curso:", error);
      alert("Lo sentimos, tuvimos un problema al guardar tu curso. Por favor, intenta de nuevo.");
    }
  };

  const confirmarEliminar = (id) => {
    setCursoToDelete(id);
    setConfirmOpen(true);
  };

  const ejecutarEliminar = async () => {
    if (!cursoToDelete) return;
    try {
      await deleteCourse(cursoToDelete);
      setCursos(cursos.filter((c) => c.id !== cursoToDelete));
      setConfirmOpen(false);
      setCursoToDelete(null);
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      alert("Lo sentimos, no pudimos eliminar el curso. Verifica tu conexión a internet.");
    }
  };

  return (
    <div className="p-8">
      <ConfirmModal 
        isOpen={confirmOpen}
        title="Eliminar Curso"
        message="¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer."
        onConfirm={ejecutarEliminar}
        onCancel={() => {
          setConfirmOpen(false);
          setCursoToDelete(null);
        }}
      />
      {/* Botón para agregar curso */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg hover:scale-110 transition-transform"
          style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}
          title="Crear nuevo curso"
        >
          {showForm ? "−" : "+"}
        </button>
      </div>

      {/* Formulario para agregar curso */}
      {showForm && (
        <div
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto mb-8"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-lg" style={{ color: "#c8a84b" }}>
              Nuevo Curso
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={agregarCurso} className="flex flex-col gap-4">
            {/* Nombre del curso */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Nombre del curso:
              </label>
              <input
                type="text"
                required
                value={nombreCurso}
                onChange={(e) => setNombreCurso(e.target.value)}
                placeholder="Ej: Matemáticas II"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none border border-transparent focus:border-yellow-400 focus:bg-white transition-all"
              />
            </div>

            {/* Selector de color */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Color:
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORES_CURSOS.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setColorIndex(index)}
                    className={`w-8 h-8 rounded-full transition-all ${colorIndex === index ? "ring-2 ring-offset-2" : "hover:scale-110"
                      }`}
                    style={{
                      background: color,
                      ringColor: color,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Botón guardar */}
            <button
              type="submit"
              className="mt-2 w-full py-3 rounded-xl text-sm font-bold text-white tracking-widest shadow-md active:scale-95 transition-transform"
              style={{
                background: "linear-gradient(135deg, #c8a84b, #a8882a)",
              }}
            >
              GUARDAR CURSO
            </button>
          </form>
        </div>
      )}

      {/* Lista de cursos */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
          Mis Cursos ({cursos.length})
        </h3>

        {cursos.length === 0 ? (
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
                d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.253s4.5 10 10 10 10-4.5 10-10S17.5 6.253 12 6.253z"
              />
            </svg>
            <p className="text-sm font-semibold">Sin cursos aún. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className="bg-white rounded-2xl shadow p-5 flex flex-col gap-3"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ background: curso.color }}
                  />
                  <button
                    onClick={() => confirmarEliminar(curso.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <p className="font-bold text-gray-800">{curso.nombre}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Creado: {new Date(curso.fecha).toLocaleDateString("es-CO")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
