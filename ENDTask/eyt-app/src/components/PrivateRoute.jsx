import { Navigate } from "react-router-dom";
import { getSession } from "../utils/storage";

export function PrivateRoute({ children }) {
  const session = getSession();

  // Si no hay sesión, redirigir a /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Si hay sesión, mostrar el componente protegido
  return children;
}