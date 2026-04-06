import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconUser, IconLogout } from "../components/Icons";
import { useModal } from "../hooks/useModal";
import { logoutUser, getCurrentUserProfile, getTasks, getCourses } from "../utils/storage";
import { TaskForm } from "./TaskForm";
import { Rendimiento } from "./Rendimiento";
import { AddCourse } from "./AddCourse";
import { Perfil } from "./Perfil";
import { Configuracion } from "./Configuracion";

const NAV_ITEMS = ["TAREAS", "CURSOS", "RENDIMIENTO", "PERFIL", "CONFIGURACIÓN"];

export function Dashboard() {
  const navigate = useNavigate();
  const { showModal } = useModal();
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
        
        // Calcular tareas por vencer (próximas 48h)
        const ahora = new Date();
        const dentro48h = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);
        
        const count = tareasDB.filter((t) => {
          if (t.estado === "Completada") return false;
          if (!t.fin || t.fin === "—") return false;
          
          const parts = t.fin.split(" ");
          if (parts.length !== 2) return false;
          const dia = parseInt(parts[0]);
          const mesIdx = MESES_ES.indexOf(parts[1]);
          if (isNaN(dia) || mesIdx === -1) return false;
          
          const fechaVence = new Date(ahora.getFullYear(), mesIdx, dia);
          // Si la fecha ya pasó este año, asumimos que es del próximo (opcional, pero razonable)
          // Pero para 48h, simplemente comparamos rangos
          return fechaVence > ahora && fechaVence <= dentro48h;
        }).length;
        
        setVencen(count);
      } catch (error) {
        console.error('Error loading data:', error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUserAndData();
  }, [navigate]);

  const MESES_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const handleTaskCreated = async () => {
    // Recargar tareas
    const tareasDB = await getTasks();
    setTareas(tareasDB);
    
    const ahora = new Date();
    const dentro48h = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);
    const count = tareasDB.filter((t) => {
      if (t.estado === "Completada") return false;
      if (!t.fin || t.fin === "—") return false;
      const parts = t.fin.split(" ");
      if (parts.length === 2) {
        const dia = parseInt(parts[0]);
        const mesIdx = MESES_ES.indexOf(parts[1]);
        if (!isNaN(dia) && mesIdx !== -1) {
          const fechaVence = new Date(ahora.getFullYear(), mesIdx, dia);
          return fechaVence > ahora && fechaVence <= dentro48h;
        }
      }
      return false;
    }).length;
    setVencen(count);
  };

  const handleLogout = () => {
    showModal({
      type: "warning",
      title: "¿Cerrar sesión?",
      subtitle: "¿Estás seguro de que deseas salir del Gestor de Tareas?",
      showCancelButton: true,
      confirmText: "SALIR",
      onConfirm: async () => {
        try {
          await logoutUser();
          navigate("/login");
        } catch (error) {
          navigate("/login");
        }
      }
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Cargando...</div>
    </div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden flex-col md:flex-row" style={{ fontFamily: "'Roboto', sans-serif" }}>

      {/* ── Sidebar (Desktop) ─────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-36 flex-shrink-0 flex-col bg-white border-r border-gray-100"
        style={{ boxShadow: "2px 0 12px rgba(0,0,0,0.04)" }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-8">
          <span
            className="text-2xl font-black tracking-tight text-primary"
            style={{ letterSpacing: "-1px" }}
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
              className={`text-left px-4 py-3 rounded-xl text-[11px] font-bold tracking-widest transition-all ${activeNav === item
                ? "text-primary bg-primary-mist border-r-4 border-primary"
                : "text-muted hover:text-dark hover:bg-bg"
                }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Usuario + Cerrar sesión */}
        <div className="px-4 pb-6 flex flex-col items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-mist text-primary"
          >
            <IconUser />
          </div>
          <span className="text-xs text-gray-500 font-semibold text-center leading-tight">
            {user?.nombre_completo || "Cargando perfil..."}
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

      {/* ── Barra de Navegación Móvil (Bottom Nav) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 flex justify-around items-center px-2 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            className={`flex flex-col items-center gap-1 transition-all ${activeNav === item ? "text-primary" : "text-muted"}`}
          >
            <span className="text-[9px] font-bold tracking-tighter uppercase">{item}</span>
            {activeNav === item && <div className="w-1 h-1 rounded-full bg-primary" />}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="text-muted hover:text-red-500 flex flex-col items-center gap-1"
        >
          <IconLogout />
        </button>
      </nav>

      {/* ── Contenido principal ─────────────────────────────────── */}
      <main
        className="flex-1 overflow-auto bg-bg pb-20 md:pb-0"
      >
        {/* Barra superior */}
        <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border bg-surface sticky top-0 z-10 shadow-sm">
          <h2 className="text-sm font-bold tracking-widest text-dark uppercase">
            {activeNav === "TAREAS" && "🚀 PANEL DE CONTROL"}
            {activeNav === "CURSOS" && "📚 MIS CURSOS TOP"}
            {activeNav === "RENDIMIENTO" && "📈 RENDIMIENTO ELITE"}
            {activeNav === "PERFIL" && "👤 MI PERFIL"}
            {activeNav === "CONFIGURACIÓN" && "⚙️ AJUSTES PRO"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
              Por Vencer
            </span>
            {vencen > 0 && (
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#E53935] shadow-sm ml-1"
              >
                {vencen > 99 ? "99+" : vencen}
              </span>
            )}
          </div>
        </div>

        {/* ── TAREAS ── */}
        {activeNav === "TAREAS" && (
          <TaskForm user={user} onTaskCreated={handleTaskCreated} />
        )}

        {/* ── CURSOS ── */}
        {activeNav === "CURSOS" && (
          <AddCourse />
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
