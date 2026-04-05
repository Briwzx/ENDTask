import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthScreen } from "./pages/AuthScreen";
import { Dashboard } from "./pages/Dashboard";
import { PrivateRoute } from "./components/PrivateRoute";
import { getSession } from "./utils/storage";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastNotification } from "./components/ToastNotification";
import { SuccessModal } from "./components/SuccessModal";

export default function App() {
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-600">Cargando...</div>
    </div>;
  }

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Ruta pública: Login/Register */}
          <Route
            path="/login"
            element={session ? <Navigate to="/dashboard" replace /> : <AuthScreen />}
          />

          {/* Ruta protegida: Dashboard con navegación interna */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route
            path="*"
            element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </Router>
      <ToastNotification />
      <SuccessModal />
    </NotificationProvider>
  );
}
