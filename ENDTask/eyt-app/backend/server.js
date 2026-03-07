import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import notificationRoutes from "./routes/notifications.js";
import rendimientoRoutes from "./routes/rendimiento.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(express.json());

// ── Conexión MongoDB ──────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado correctamente"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    process.exit(1);
  });

// ── Rutas ─────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rendimiento", rendimientoRoutes);

// ── Health check ──────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "EYT API corriendo 🚀" });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
