# End Your Tasks — EYT App

Aplicación React + Tailwind CSS con autenticación Supabase y dashboard de tareas.

## Estructura del proyecto

```
eyt-app/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                    ← Variables de entorno para Supabase
├── supabase-setup.sql      ← SQL para configurar la base de datos
├── SUPABASE_README.md      ← Guía completa de configuración de Supabase
└── src/
    ├── main.jsx          ← Punto de entrada
    ├── App.jsx           ← Controla la navegación (auth ↔ dashboard)
    ├── index.css         ← Estilos globales + Tailwind
    ├── utils/
    │   ├── storage.js    ← Helpers de Supabase/localStorage
    │   └── supabase.js   ← Configuración de Supabase
    ├── components/
    │   ├── Icons.jsx     ← Todos los íconos SVG
    │   ├── FormFields.jsx← Campo genérico + campo contraseña
    │   └── Toast.jsx     ← Notificación flotante
    └── pages/
        ├── AuthScreen.jsx   ← Contenedor de tabs (login/registro)
        ├── RegisterForm.jsx ← Formulario de registro completo
        ├── LoginForm.jsx    ← Formulario de inicio de sesión
        └── Dashboard.jsx    ← Pantalla principal con sidebar
```

## Instalación y uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
Sigue las instrucciones en `SUPABASE_README.md` para configurar tu proyecto de Supabase.

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

### 4. Abrir en el navegador
```
http://localhost:5174
```

## Tecnologías
- **React 18** — UI
- **Tailwind CSS 3** — Estilos
- **Supabase** — Backend como servicio (Base de datos + Auth)
- **Vite** — Build tool
- **Vite** — Bundler
- **localStorage** — Persistencia de datos (usuarios y sesión)

## Notas de edición
- Los colores principales se definen como estilos inline con `#c8a84b` (dorado) — cámbialos a tu gusto.
- Las tareas de ejemplo están en `src/pages/Dashboard.jsx` en el array `SAMPLE_TASKS`.
- Para conectar a una API real, reemplaza las funciones en `src/utils/storage.js`.
