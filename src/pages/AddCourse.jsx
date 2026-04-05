import { useState, useEffect } from "react";
import { getCourses, addCourse, deleteCourse } from "../utils/storage";
import { useToast } from "../hooks/useToast";
import { useModal } from "../hooks/useModal";
import { translateSupabaseError } from "../utils/errors";

const COLORES_CURSOS = [
  "#e05252",
  "#e09052",
  "#c8a84b",
  "#52a8e0",
  "#52e0a0",
  "#9052e0",
];

export function AddCourse() {
  const { showToast } = useToast();
  const { showModal } = useModal();
  const [cursos, setCursos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nombreCurso, setNombreCurso] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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
    if (!nombre) {
      showToast("Por favor escriba el nombre del curso", "error");
      return;
    }

    const nuevoCurso = {
      nombre,
      color: COLORES_CURSOS[colorIndex]
    };

    try {
      setLoading(true);
      const cursoGuardado = await addCourse(nuevoCurso);
      setCursos([...cursos, cursoGuardado]);
      setNombreCurso("");
      setColorIndex(0);
      setShowForm(false);
      showModal({
        type: "success",
        title: "¡Curso creado!",
        subtitle: "El curso fue agregado a tu lista."
      });
    } catch (error) {
      const msg = translateSupabaseError(error);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminar = (id) => {
    showModal({
      type: "warning",
      title: "¿Eliminar curso?",
      subtitle: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmText: "ELIMINAR",
      onConfirm: () => ejecutarEliminar(id)
    });
  };

  const ejecutarEliminar = async (id) => {
    try {
      await deleteCourse(id);
      setCursos(cursos.filter((c) => c.id !== id));
      showToast("Curso eliminado correctamente", "success");
    } catch (error) {
      const msg = translateSupabaseError(error);
      showToast(msg, "error");
    }
  };

  return (
    <div className="p-8">
      {/* Botón para agregar curso */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-premium hover:scale-110 transition-transform bg-primary"
          title="Crear nuevo curso"
        >
          {showForm ? "\u2212" : "+"}
        </button>
      </div>

      {/* Formulario para agregar curso */}
      {showForm && (
        <div
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto mb-8"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl text-primary">
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
                placeholder="Ej: Matem\xe1ticas II"
                className="input-standard"
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
              className="btn-primary"
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
