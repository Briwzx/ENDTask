import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconLogout } from "../components/Icons";
import { clearSession, getSession } from "../utils/storage";
import { TaskForm }    from "./TaskForm";
import { Rendimiento } from "./Rendimiento";
import { AddCurse }    from "./AddCurse";

const NAV_ITEMS = ["TAREAS", "CURSOS", "RENDIMIENTO", "PERFIL"];

export function Dashboard() {
  const navigate = useNavigate();
  const user = getSession();
  const [activeNav, setActiveNav] = useState("TAREAS");

  // Contar tareas por vencer desde localStorage
  const getTareas   = () => JSON.parse(localStorage.getItem("eyt_tasks") || "[]");
  const [tareas, setTareas] = useState(getTareas);
  const vencen = tareas.filter((t) => t.vence && t.estado !== "Completada").length;

  const handleTaskCreated = (nuevaTarea) => {
    setTareas(getTareas());
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ fontFamily: "'Roboto', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="w-36 flex-shrink-0 flex flex-col bg-white border-r border-gray-100"
        style={{ boxShadow: "2px 0 12px rgba(0,0,0,0.04)" }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-8">
          <span
            className="text-2xl font-black tracking-tight"
            style={{ color: "#c8a84b", letterSpacing: "-1px" }}
          >
            EYT
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-1 flex-1 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`text-left px-3 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${
                activeNav === item
                  ? "text-gray-900 bg-amber-50 border-l-2"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
              style={activeNav === item ? { borderColor: "#c8a84b" } : {}}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Usuario + Cerrar sesión */}
        <div className="px-4 pb-6 flex flex-col items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "#f0e8c8" }}
          >
            <IconUser />
          </div>
          <span className="text-xs text-gray-500 font-semibold text-center leading-tight">
            {user.nombre} {user.apellido}
          </span>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors mt-1"
          >
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ─────────────────────────────────── */}
      <main
        className="flex-1 overflow-auto"
        style={{ background: "linear-gradient(180deg, #fdfaf3 0%, #e8dba8 100%)" }}
      >
        {/* Barra superior */}
        <div className="flex items-center justify-between px-10 py-5 border-b border-amber-100 bg-white bg-opacity-70 sticky top-0 z-10">
          <h2 className="text-base font-black tracking-widest text-gray-700">
            {activeNav === "TAREAS"       && "TASK"}
            {activeNav === "CURSOS"       && "CURSOS"}
            {activeNav === "RENDIMIENTO"  && "DASHBOARD"}
            {activeNav === "PERFIL"       && "PERFIL"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
              Por Vencer
            </span>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "#e05252" }}
            >
              {vencen}
            </span>
          </div>
        </div>

        {/* ── TAREAS ── */}
        {activeNav === "TAREAS" && (
          <TaskForm onTaskCreated={handleTaskCreated} />
        )}

        {/* ── CURSOS ── */}
        {activeNav === "CURSOS" && (
          <AddCurse />
        )}

        {/* ── RENDIMIENTO ── */}
        {activeNav === "RENDIMIENTO" && (
          <Rendimiento user={user} />
        )}

        {/* ── PERFIL ── */}
        {activeNav === "PERFIL" && (
          <div className="p-10">
            <div className="max-w-sm bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black"
                  style={{ background: "#f0e8c8", color: "#a8882a" }}
                >
                  {user.nombre[0]}{user.apellido[0]}
                </div>
                <div>
                  <p className="font-black text-gray-800 text-lg">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Teléfono</p>
                  <p className="font-semibold text-gray-700">{user.telefono}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Año Nac.</p>
                  <p className="font-semibold text-gray-700">{user.anio}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tareas creadas</p>
                  <p className="font-semibold text-gray-700">
                    {JSON.parse(localStorage.getItem("eyt_tasks") || "[]").length}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Cursos registrados</p>
                  <p className="font-semibold text-gray-700">
                    {JSON.parse(localStorage.getItem("eyt_courses") || "[]").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
