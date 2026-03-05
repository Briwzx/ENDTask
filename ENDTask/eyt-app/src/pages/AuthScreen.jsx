import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "./RegisterForm";
import { LoginForm }    from "./LoginForm";
import { Toast }        from "../components/Toast";

export function AuthScreen() {
  const navigate = useNavigate();
  const [tab, setTab]     = useState("register");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (user) => {
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 relative"
      style={{
        background: "linear-gradient(160deg, #f9f6ef 0%, #eee8c8 100%)",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {/* Notificación */}
      <Toast message={toast?.msg} type={toast?.type} />

      <div
        className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-xl overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-2">
          <h1
            className="text-4xl font-black leading-tight text-gray-900"
            style={{ letterSpacing: "-1px" }}
          >
            End Your Tasks
          </h1>
          <div className="h-0.5 w-16 mt-2 mb-5 rounded" style={{ background: "#c8b96e" }} />
        </div>

        {/* Tabs */}
        <div className="flex items-center mx-10 mb-5 border-b border-gray-200">
          {[
            { key: "register", label: "REGISTRARSE" },
            { key: "login",    label: "INICIO SESIÓN" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest transition-all relative ${
                tab === key ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {label}
              {tab === key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded"
                  style={{ background: "#c8a84b" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Contenido según tab */}
        {tab === "register" ? (
          <RegisterForm onSuccess={handleLogin} showToast={showToast} />
        ) : (
          <LoginForm onSuccess={handleLogin} showToast={showToast} />
        )}
      </div>
    </div>
  );
}
