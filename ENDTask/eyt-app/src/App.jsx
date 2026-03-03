import { useState } from "react";
import { AuthScreen } from "./pages/AuthScreen";
import { Dashboard }  from "./pages/Dashboard";
import { getSession } from "./utils/storage";

export default function App() {
  // Al cargar, intenta recuperar la sesión guardada en localStorage
  const [user, setUser] = useState(() => getSession());

  const handleLogin  = (loggedUser) => setUser(loggedUser);
  const handleLogout = ()           => setUser(null);

  // Si hay usuario activo → mostrar dashboard; si no → pantalla de auth
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <AuthScreen onLogin={handleLogin} />;
}
