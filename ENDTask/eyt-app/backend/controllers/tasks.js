import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  const tasks = await Task.find().sort({ fecha: -1 });
  res.json(tasks);
};

export const createTask = async (req, res) => {
  const { titulo, descripcion, estado, fecha } = req.body;

  const task = await Task.create({
    titulo,
    descripcion,
    estado,
    fecha,
  });

  res.json(task);
};

export const updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "deleted" });
};

export const notifications = async (req, res) => {
  const today = new Date();
  const tasks = await Task.find();

  const vencidas = [];
  const porVencer = [];

  tasks.forEach((t) => {
    const diff = (new Date(t.fecha) - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) vencidas.push(t);
    else if (diff <= 2) porVencer.push(t);
  });

  res.json({ vencidas, porVencer });
};
