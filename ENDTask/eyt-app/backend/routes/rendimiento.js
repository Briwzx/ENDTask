import express from "express";
import Task    from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/rendimiento — datos semanales para el gráfico
router.get("/", async (req, res) => {
  try {
    const uid   = req.user._id;
    const ahora = new Date();
    const semanas = [];

    for (let i = 7; i >= 0; i--) {
      const ini = new Date(ahora);
      ini.setDate(ahora.getDate() - i * 7 - ahora.getDay());
      ini.setHours(0, 0, 0, 0);
      const fin = new Date(ini);
      fin.setDate(ini.getDate() + 6);
      fin.setHours(23, 59, 59, 999);

      const [completadas, creadas, enProgreso] = await Promise.all([
        Task.countDocuments({ usuario: uid, estado: "Completada", fechaCompletada: { $gte: ini, $lte: fin } }),
        Task.countDocuments({ usuario: uid, createdAt: { $gte: ini, $lte: fin } }),
        Task.countDocuments({ usuario: uid, estado: "En progreso", createdAt: { $lte: fin } }),
      ]);

      semanas.push({ semana: `S${8 - i}`, completadas, creadas, enProgreso });
    }

    const [total, completadas, enProgreso, pendientes, porVencer] = await Promise.all([
      Task.countDocuments({ usuario: uid }),
      Task.countDocuments({ usuario: uid, estado: "Completada" }),
      Task.countDocuments({ usuario: uid, estado: "En progreso" }),
      Task.countDocuments({ usuario: uid, estado: "Pendiente" }),
      Task.countDocuments({ usuario: uid, vence: true }),
    ]);

    res.json({
      semanas,
      resumen: {
        total, completadas, enProgreso, pendientes, porVencer,
        tasaCompletado: total > 0 ? Math.round((completadas / total) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener rendimiento" });
  }
});

export default router;
