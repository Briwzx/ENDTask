import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  estado: {
    type: String,
    default: "pendiente"
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Task", TaskSchema);