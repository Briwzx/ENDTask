import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  isWithinInterval, 
  format,
  startOfToday,
  addHours
} from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../utils/supabase';
import { getTasks, getCourses } from '../utils/storage';
import { translateSupabaseError } from '../utils/errors';
import { useToast } from '../hooks/useToast';

// ── Íconos de las tarjetas stat ───────────────────────────────────
const IconColaborador = () => (
  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);
const IconDepartamento = () => (
  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4" />
  </svg>
);
const IconTareas = () => (
  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// ── Página de Rendimiento ─────────────────────────────────────────
export function Rendimiento({ user }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    completadas: 0,
    enProgreso: 0,
    pendientes: 0,
    porVencer: 0
  });

  const chartColors = ["#3b8de0", "#e040c8", "#c840e0", "#40c8e0"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 4. Query sin filtro de fecha (trae todo)
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('id, titulo, estado, completada, fecha')
          .eq('user_id', user.id)
          .order('fecha', { ascending: true });

        if (error) throw error;

        // 1. Imprimir datos crudos para verificar
        console.log('tareas raw:', tasks);
        if (tasks.length > 0) {
          console.log('fecha ejemplo:', tasks[0]?.fecha);
        }

        setTareas(tasks);

        // 5. Tarjetas de Resumen (totales globales)
        const ahora_ms = Date.now();
        const dentro48h_ms = ahora_ms + 48 * 60 * 60 * 1000;
        
        const globales = {
          completadas: tasks.filter(t => t.completada === true).length,
          enProgreso: tasks.filter(t => t.estado === "En progreso" || t.estado === "En Progreso").length,
          pendientes: tasks.filter(t => t.estado === "Pendiente").length,
          porVencer: tasks.filter(t => {
            if (t.completada) return false;
            // Si 'fecha' o un campo de vencimiento existe, usarlo. 
            // El usuario sugirió new Date(t.vence), pero verificamos 'fecha' que es el timestamp.
            const f = new Date(t.fecha);
            return !isNaN(f.getTime()) && f.getTime() <= dentro48h_ms;
          }).length
        };
        setSummary(globales);

        // 2. Cálculo de semanas (Lógica proporcionada)
        const ahora = new Date();
        const semanasConfig = Array.from({ length: 8 }, (_, i) => {
          const fin = new Date(ahora);
          fin.setDate(ahora.getDate() - (7 * (7 - i))); // Ajuste para que S8 sea la actual
          const inicio = new Date(fin);
          inicio.setDate(fin.getDate() - 6);
          inicio.setHours(0, 0, 0, 0);
          fin.setHours(23, 59, 59, 999);
          return { label: `S${i + 1}`, inicio, fin };
        });

        // 3. Filtro de tareas por semana
        const semanaData = semanasConfig.map(({ label, inicio, fin }) => {
          const tareasDeSemana = tasks.filter(t => {
            const fechaTarea = new Date(t.fecha);
            return fechaTarea >= inicio && fechaTarea <= fin;
          });
          
          const comp = tareasDeSemana.filter(t => t.completada === true).length;
          const prog = tareasDeSemana.filter(t => t.estado === 'En progreso' || t.estado === 'En Progreso').length;
          const pend = tareasDeSemana.filter(t => t.estado === 'Pendiente').length;

          return {
            name: label,
            Completadas: comp,
            "En Progreso": prog,
            Pendientes: pend,
            Total: tareasDeSemana.length
          };
        });

        console.log('semanaData:', semanaData);
        setChartData(semanaData);

      } catch (error) {
        console.error('Error fetching data:', error);
        showToast(translateSupabaseError(error), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast, user.id]);

  const stats = [
    { label: "Colaboradores", value: 1, icon: <IconColaborador /> },
    { label: "Departamentos", value: 1, icon: <IconDepartamento /> },
    { label: "Tareas Totales", value: tareas.length, icon: <IconTareas /> },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tareas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[500px] gap-6 text-center px-8">
        <div className="bg-primary-mist/20 p-8 rounded-full">
          <IconTareas />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-dark mb-2">Aún no tienes tareas registradas</h2>
          <p className="text-muted text-sm max-w-sm mx-auto">Comienza por crear tu primera tarea para ver tu progreso y rendimiento aquí.</p>
        </div>
        <Link to="/dashboard" className="btn-primary">
          CREAR MI PRIMERA TAREA
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full">

      {/* Tarjetas stat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label}
            className="card-standard p-6 flex flex-col items-center gap-3 bg-primary text-white border-none"
          >
            <div className="bg-white/20 p-3 rounded-2xl">
              {s.icon}
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                {s.label}
              </p>
              <p className="text-2xl font-black">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-[#1a2340] rounded-2xl p-6 shadow-xl border border-white/5 h-[400px]">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-6">Tendencia últimas 8 semanas</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a2340', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}
            />
            <Line 
              type="monotone" 
              dataKey="Completadas" 
              stroke={chartColors[0]} 
              strokeWidth={3}
              dot={{ r: 4, stroke: '#1a2340', strokeWidth: 2, fill: chartColors[0] }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="En Progreso" 
              stroke={chartColors[1]} 
              strokeWidth={3}
              dot={{ r: 4, stroke: '#1a2340', strokeWidth: 2, fill: chartColors[1] }}
            />
            <Line 
              type="monotone" 
              dataKey="Pendientes" 
              stroke={chartColors[2]} 
              strokeWidth={3}
              dot={{ r: 4, stroke: '#1a2340', strokeWidth: 2, fill: chartColors[2] }}
            />
            <Line 
              type="monotone" 
              dataKey="Total" 
              stroke={chartColors[3]} 
              strokeWidth={3}
              dot={{ r: 4, stroke: '#1a2340', strokeWidth: 2, fill: chartColors[3] }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Completadas", value: summary.completadas, color: "#22c55e" },
          { label: "En Progreso", value: summary.enProgreso, color: "#3b8de0" },
          { label: "Pendientes", value: summary.pendientes, color: "#3B82F6" },
          { label: "Por Vencer", value: summary.porVencer, color: "#EF4444" },
        ].map((item) => (
          <div key={item.label} className="bg-surface rounded-xl p-5 flex flex-col items-center gap-1 shadow-sm border border-border">
            <span className="text-3xl font-black" style={{ color: item.color }}>{item.value}</span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
