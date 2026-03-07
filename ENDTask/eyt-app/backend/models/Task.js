import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    usuario: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    titulo:      { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    estado: {
      type:    String,
      enum:    ["Pendiente", "En progreso", "Completada", "Cancelada"],
      default: "Pendiente",
    },
    prioridad: {
      type:    String,
      enum:    ["Baja", "Media", "Alta", "Crítica"],
      default: "Media",
    },
    fechaInicio:     { type: Date, default: null },
    fechaFin:        { type: Date, default: null },
    etiquetas:       [{ type: String }],
    vence:           { type: Boolean, default: false },
    fechaCompletada: { type: Date,    default: null },
  },
  { timestamps: true }
);

// Recalcular "vence" y guardar fecha de completado automáticamente
TaskSchema.pre("save", function (next) {
  if (this.fechaFin) {
    const hoy      = new Date();
    const diffMs   = new Date(this.fechaFin) - hoy;
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    this.vence = diffDias >= 0 && diffDias <= 2 && this.estado !== "Completada";
  }
  if (this.isModified("estado") && this.estado === "Completada" && !this.fechaCompletada) {
    this.fechaCompletada = new Date();
  }
  next();
});

export default mongoose.model("Task", TaskSchema);
