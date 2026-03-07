import express from "express";
import jwt     from "jsonwebtoken";
import User    from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/auth/register ───────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { nombre, apellido, telefono, email, anio, password } = req.body;

    if (!nombre || !apellido || !telefono || !email || !anio || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "La contraseña debe tener mínimo 8 caracteres" });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "Este correo ya está registrado" });
    }

    const user = await User.create({ nombre, apellido, telefono, email, anio: Number(anio), password });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token:   generateToken(user._id),
      user:    user.toJSON(),
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son requeridos" });
    }

    // Necesitamos incluir password para comparar
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    res.json({
      message: "Inicio de sesión exitoso",
      token:   generateToken(user._id),
      user:    user.toJSON(),
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default router;
