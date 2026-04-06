import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "./RegisterForm";
import { LoginForm } from "./LoginForm";

export function AuthScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");

  const handleLogin = (user) => {
    navigate("/dashboard");
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-[40%_60%] font-sans overflow-hidden">
      {/* Lado izquierdo (40%) - Desktop Only Design */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-dark text-white relative">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg italic">ET</span>
          </div>
          <span className="font-semibold tracking-tight text-xl uppercase">EndTasks</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-5xl font-semibold leading-[1.1] mb-6">
            Domina tus <span className="text-primary-soft">tareas universitarias</span>
          </h1>
          <p className="text-muted text-lg mb-10 leading-relaxed">
            Optimiza tu tiempo y mejora tu rendimiento en una plataforma diseñada para el éxito académico.
          </p>

          {/* Bullet Points */}
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-primary-soft/10 rounded-lg">
                <svg className="w-5 h-5 text-primary-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold">Gestión Eficiente</h4>
                <p className="text-sm text-muted">Organiza tus tareas y proyectos con facilidad.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-primary-soft/10 rounded-lg">
                <svg className="w-5 h-5 text-primary-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold">Conectividad Total</h4>
                <p className="text-sm text-muted">Crea redes de apoyo con tus compañeros.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-primary-soft/10 rounded-lg">
                <svg className="w-5 h-5 text-primary-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h4 className="font-semibold">Seguridad Garantizada</h4>
                <p className="text-sm text-muted">Tus datos universitarios siempre protegidos.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Lado derecho (60%) */}
      <div className="bg-surface flex items-start md:items-center justify-center p-6 md:p-12 relative overflow-y-auto h-screen">
        {/* Floating Decor Point */}
        <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-primary animate-pulse opacity-50" />

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 py-12">
          {/* Logo Mobile Only */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg italic text-white">ET</span>
            </div>
            <span className="font-semibold tracking-tight text-xl text-dark">EndTasks</span>
          </div>

          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-semibold text-dark">Bienvenido</h2>
            <p className="text-muted mt-2">Accede a tu cuenta para continuar</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-primary-mist p-1 rounded-card mb-8">
            {[
              { key: "login", label: "Iniciar sesión" },
              { key: "register", label: "Registrarse" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
                  tab === key
                    ? "bg-primary text-white shadow-md"
                    : "text-muted hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="transition-all duration-300">
            {tab === "register" ? (
              <RegisterForm onSuccess={handleLogin} />
            ) : (
              <LoginForm onSuccess={handleLogin} />
            )}
          </div>

          {/* Legal text */}
          <p className="mt-8 text-center text-xs text-muted leading-relaxed px-6">
            Al continuar, aceptas nuestros <span className="underline cursor-pointer">Términos de Servicio</span> y <span className="underline cursor-pointer">Política de Privacidad</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

