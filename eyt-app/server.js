const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');

const app = express();

app.use(express.json());

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Permite autenticar un usuario en ENDTask.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 */
app.post('/login', (req, res) => {
  res.json({
    mensaje: 'Login exitoso'
  });
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Obtener tareas
 *     description: Obtiene las tareas visualizadas en el panel principal del usuario.
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: Panel de tareas obtenido correctamente
 */
app.get('/tasks', (req, res) => {
res.json({
  tasks: [
    {
      id: 1,
      title: 'Completar documentación Swagger',
      completed: false
    },
    {
      id: 2,
      title: 'Actualizar dashboard',
      completed: true
      }
    ]
  });
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crear tarea
 *     description: Permite crear una nueva tarea.
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Terminar proyecto
 *     responses:
 *       201:
 *         description: Tarea fue guardada correctamente
 */
app.post('/tasks', (req, res) => {
  res.status(201).json({
    mensaje: 'Tarea creada'
  });
});

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtener dashboard
 *     description: Obtiene la información principal del dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Información obtenida correctamente
 */
app.get('/dashboard', (req, res) => {
  res.json({
    totalTasks: 10,
    completedTasks: 7
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
