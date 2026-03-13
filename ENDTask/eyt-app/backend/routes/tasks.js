import express from "express";
import Task    from "../models/Task.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/tasks — todas las tareas del usuario
router.get("/", async (req, res) => {
  try {
    const filtro = { usuario: req.user._id };
    if (req.query.estado)    filtro.estado    = req.query.estado;
    if (req.query.prioridad) filtro.prioridad = req.query.prioridad;

    const tareas = await Task.find(filtro).sort({ createdAt: -1 });
    res.json({ tareas });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// POST /api/tasks — crear tarea
router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion, estado, prioridad, fechaInicio, fechaFin, etiquetas } = req.body;

    if (!titulo) return res.status(400).json({ error: "El título es requerido" });

    const tarea = await Task.create({
      usuario:     req.user._id,
      titulo,
      descripcion: descripcion || "",
      estado:      estado      || "Pendiente",
      prioridad:   prioridad   || "Media",
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin:    fechaFin    ? new Date(fechaFin)    : null,
      etiquetas:   etiquetas   || [],
    });

    res.status(201).json({ message: "Tarea creada", tarea });
  } catch (error) {
    console.error("Error creando tarea:", error);
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// PUT /api/tasks/:id — actualizar tarea
router.put("/:id", async (req, res) => {
  try {
    const tarea = await Task.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });

    Object.assign(tarea, req.body);
    await tarea.save();

    res.json({ message: "Tarea actualizada", tarea });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar tarea" });
  }
});

// DELETE /api/tasks/:id — eliminar tarea
router.delete("/:id", async (req, res) => {
  try {
    const tarea = await Task.findOneAndDelete({ _id: req.params.id, usuario: req.user._id });
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar tarea" });
  }
});

export default router;
