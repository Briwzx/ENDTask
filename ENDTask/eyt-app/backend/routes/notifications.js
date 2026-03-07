import express from "express";
import Task    from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/notifications
router.get("/", async (req, res) => {
  try {
    const ahora   = new Date();
    const en3dias = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);

    const porVencer = await Task.find({
      usuario:  req.user._id,
      fechaFin: { $gte: ahora, $lte: en3dias },
      estado:   { $nin: ["Completada", "Cancelada"] },
    }).sort({ fechaFin: 1 });

    const vencidas = await Task.find({
      usuario:  req.user._id,
      fechaFin: { $lt: ahora },
      estado:   { $nin: ["Completada", "Cancelada"] },
    }).sort({ fechaFin: -1 }).limit(10);

    const notificaciones = [
      ...vencidas.map((t) => ({
        id:       t._id,
        tipo:     "vencida",
        titulo:   t.titulo,
        prioridad: t.prioridad,
        mensaje:  `⚠️ Venció el ${new Date(t.fechaFin).toLocaleDateString("es-CO")}`,
        fechaFin:  t.fechaFin,
      })),
      ...porVencer.map((t) => {
        const dias = Math.ceil((new Date(t.fechaFin) - ahora) / (1000 * 60 * 60 * 24));
        return {
          id:       t._id,
          tipo:     "por_vencer",
          titulo:   t.titulo,
          prioridad: t.prioridad,
          mensaje:  dias === 0 ? "🔴 Vence hoy" : dias === 1 ? "🟠 Vence mañana" : `🟡 Vence en ${dias} días`,
          fechaFin:  t.fechaFin,
          diasRestantes: dias,
        };
      }),
    ];

    res.json({
      total:           notificaciones.length,
      porVencer:       porVencer.length,
      vencidas:        vencidas.length,
      notificaciones,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});

export default router;
