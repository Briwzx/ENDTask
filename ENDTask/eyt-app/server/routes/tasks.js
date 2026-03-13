import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

router.get("/all", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

export default router;