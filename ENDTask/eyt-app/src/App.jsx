import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthScreen } from "./pages/AuthScreen";
import { Dashboard } from "./pages/Dashboard";
import { PrivateRoute } from "./components/PrivateRoute";
import { getSession } from "./utils/storage";

export default function App() {
  const session = getSession();

  return (
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
  );
}
