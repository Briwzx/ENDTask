import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconLogout } from "../components/Icons";
import { logoutUser, getCurrentUserProfile, getTasks, getCourses } from "../utils/storage";
import { TaskForm } from "./TaskForm";
import { Rendimiento } from "./Rendimiento";
import { AddCurse } from "./AddCurse";
import { Perfil } from "./Perfil";
import { Configuracion } from "./Configuracion";

const NAV_ITEMS = ["TAREAS", "CURSOS", "RENDIMIENTO", "PERFIL", "CONFIGURACIÓN"];

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("TAREAS");

  const [tareas, setTareas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [vencen, setVencen] = useState(0);

  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        setUser(userProfile);

        // Cargar datos reales desde DB
        const [tareasDB, cursosDB] = await Promise.all([
          getTasks(),
          getCourses()
        ]);

        setTareas(tareasDB);
        setCursos(cursosDB);
        setVencen(tareasDB.filter((t) => t.vence && t.estado !== "Completada").length);
      } catch (error) {
        console.error('Error loading data:', error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndData();
  }, [navigate]);

  const handleTaskCreated = async () => {
    // Recargar tareas
    const tareasDB = await getTasks();
    setTareas(tareasDB);
    setVencen(tareasDB.filter((t) => t.vence && t.estado !== "Completada").length);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if logout fails, redirect to login
      navigate("/login");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Cargando...</div>
    </div>;
  }

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
              className={`text-left px-3 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${activeNav === item
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
            {activeNav === "TAREAS" && "TASK"}
            {activeNav === "CURSOS" && "CURSOS"}
            {activeNav === "RENDIMIENTO" && "DASHBOARD"}
            {activeNav === "PERFIL" && "PERFIL"}
            {activeNav === "CONFIGURACIÓN" && "CONFIGURACIÓN"}
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
          <TaskForm user={user} onTaskCreated={handleTaskCreated} />
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
          <Perfil 
            user={user} 
            onUpdateUser={setUser} 
            tareasCount={tareas.length} 
            cursosCount={cursos.length} 
          />
        )}

        {/* ── CONFIGURACIÓN ── */}
        {activeNav === "CONFIGURACIÓN" && (
          <Configuracion user={user} onUpdateUser={setUser} />
        )}
      </main>
    </div>
  );
}
