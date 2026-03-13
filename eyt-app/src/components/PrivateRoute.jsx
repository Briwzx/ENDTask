import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../utils/storage";

export function PrivateRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userSession = await getSession();
        setSession(userSession);
      } catch (error) {
        console.error('Error checking session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Cargando...</div>
    </div>;
  }

  // Si no hay sesión, redirigir a /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Si hay sesión, mostrar el componente protegido
  return children;
}