import { useState, useEffect, useRef } from "react";

// ── Íconos de las tarjetas stat ───────────────────────────────────
const IconColaborador = () => (
  <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);
const IconDepartamento = () => (
  <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4" />
  </svg>
);
const IconTareas = () => (
  <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// ── Componente gráfico de líneas (Canvas) ─────────────────────────
function LineChart({ data, labels, colors, height = 280 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const padX = 48;
    const padY = 24;
    const chartW = W - padX * 2;
    const chartH = H - padY * 2;

    ctx.clearRect(0, 0, W, H);

    // Fondo oscuro
    ctx.fillStyle = "#1a2340";
    ctx.roundRect(0, 0, W, H, 16);
    ctx.fill();

    const allValues = data.flat();
    const maxVal = Math.max(...allValues) * 1.15;
    const minVal = Math.min(...allValues) * 0.85;
    const range = maxVal - minVal || 1;

    const xStep = chartW / (labels.length - 1);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = padY + (chartH / 6) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(W - padX, y);
      ctx.stroke();
      // Labels eje Y
      const val = Math.round(maxVal - (range / 6) * i);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "10px Georgia";
      ctx.textAlign = "right";
      ctx.fillText(val, padX - 6, y + 4);
    }

    // Labels eje X
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px Georgia";
    ctx.textAlign = "center";
    labels.forEach((lbl, i) => {
      ctx.fillText(lbl, padX + i * xStep, H - 6);
    });

    // Líneas de datos
    data.forEach((series, si) => {
      const color = colors[si] || "#c8a84b";
      const points = series.map((v, i) => ({
        x: padX + i * xStep,
        y: padY + chartH - ((v - minVal) / range) * chartH,
      }));

      // Área rellena suave
      ctx.beginPath();
      ctx.moveTo(points[0].x, H - padY);
      points.forEach((p, i) => {
        if (i === 0) { ctx.lineTo(p.x, p.y); return; }
        const cp1x = points[i - 1].x + (p.x - points[i - 1].x) / 2;
        ctx.bezierCurveTo(cp1x, points[i - 1].y, cp1x, p.y, p.x, p.y);
      });
      ctx.lineTo(points[points.length - 1].x, H - padY);
      ctx.closePath();
      ctx.fillStyle = color.replace(")", ", 0.12)").replace("rgb(", "rgba(").replace("#", "");
      // Hack para hex color → rgba
      const hex2rgba = (hex, a) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
      };
      ctx.fillStyle = hex2rgba(color, 0.12);
      ctx.fill();

      // Línea principal
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) { ctx.moveTo(p.x, p.y); return; }
        const cp1x = points[i - 1].x + (p.x - points[i - 1].x) / 2;
        ctx.bezierCurveTo(cp1x, points[i - 1].y, cp1x, p.y, p.x, p.y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Puntos
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#1a2340";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  }, [data, labels, colors, height]);

  return (
    <canvas
      ref={canvasRef}
      width={740}
      height={height}
      style={{ width: "100%", height: "auto", borderRadius: 12 }}
    />
  );
}

// ── Página de Rendimiento ─────────────────────────────────────────
export function Rendimiento({ user }) {
  const [filtroColaborador, setFiltroColaborador] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    import("../utils/storage").then(m => m.getTasks().then(setTareas));
  }, []);

  const completadas = tareas.filter((t) => t.estado === "Completada").length;
  const enProgreso = tareas.filter((t) => t.estado === "En progreso").length;
  const pendientes = tareas.filter((t) => t.estado === "Pendiente").length;
  const totalTareas = tareas.length;

  // Datos para el gráfico — últimas 8 semanas simuladas + reales
  const semanas = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
  const base = [200, 340, 280, 450, 380, 520, 460, 600];
  const chartData = [
    base.map((v) => Math.round(v * 1.0 + completadas * 10)),
    base.map((v) => Math.round(v * 0.75 + enProgreso * 8)),
    base.map((v) => Math.round(v * 0.55 + pendientes * 6)),
    base.map((v) => Math.round(v * 0.35 + totalTareas * 4)),
  ];
  const chartColors = ["#3b8de0", "#e040c8", "#c840e0", "#40c8e0"];

  const stats = [
    { label: "Colaboradores", value: 1, icon: <IconColaborador /> },
    { label: "Departamentos", value: 1, icon: <IconDepartamento /> },
    { label: "Tareas Totales", value: totalTareas, icon: <IconTareas /> },
  ];

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Tarjetas stat */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label}
            className="rounded-2xl p-5 flex flex-col items-center gap-2 shadow-md"
            style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
            {s.icon}
            <p className="text-sm font-bold text-gray-900 text-center">
              {s.label}: <span className="font-black">{s.value}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm flex-wrap">
        {/* Colaborador */}
        <div className="flex items-center gap-2 flex-1 min-w-32">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Colaborador:</span>
          <div className="relative flex-1">
            <select value={filtroColaborador} onChange={(e) => setFiltroColaborador(e.target.value)}
              className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer">
              <option value="">Todos</option>
              <option value={user?.nombre}>{user?.nombre} {user?.apellido}</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Departamento */}
        <div className="flex items-center gap-2 flex-1 min-w-32">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Departamento:</span>
          <div className="relative flex-1">
            <select value={filtroDepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none appearance-none border border-transparent focus:border-yellow-400 transition-all cursor-pointer">
              <option value="">Todos</option>
              <option value="general">General</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Fecha:</span>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none border border-transparent focus:border-yellow-400 transition-all"
          />
          <button className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ background: "#22c55e" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Gráfico */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <LineChart data={chartData} labels={semanas} colors={chartColors} height={280} />
      </div>

      {/* Leyenda */}
      <div className="flex gap-6 flex-wrap">
        {["Completadas", "En Progreso", "Pendientes", "Total"].map((lbl, i) => (
          <div key={lbl} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: chartColors[i] }} />
            <span className="text-xs font-semibold text-gray-500">{lbl}</span>
          </div>
        ))}
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Completadas", value: completadas, color: "#22c55e" },
          { label: "En Progreso", value: enProgreso, color: "#3b8de0" },
          { label: "Pendientes", value: pendientes, color: "#c8a84b" },
          { label: "Por Vencer", value: tareas.filter(t => t.vence).length, color: "#e05252" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm">
            <span className="text-2xl font-black" style={{ color: item.color }}>{item.value}</span>
            <span className="text-xs font-semibold text-gray-500 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
