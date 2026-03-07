import { useState } from "react";
import { Field, PasswordField } from "../components/FormFields";
import { IconMail } from "../components/Icons";
import { authAPI } from "../utils/api";

export function LoginForm({ onSuccess, showToast }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Verificar credenciales contra MongoDB via backend
      const data = await authAPI.login(email, password);
      onSuccess(data.user);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-10 pb-10 flex flex-col gap-4">
      <Field label="Correo electrónico" icon={<IconMail />}>
        <input type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className="bg-transparent flex-1 text-sm text-gray-800 outline-none placeholder-gray-400" />
      </Field>

      <PasswordField label="Contraseña" value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••" show={showPw}
        onToggle={() => setShowPw(!showPw)} />

      <div className="text-right -mt-2">
        <span className="text-xs text-yellow-600 underline cursor-pointer">
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-widest shadow-md active:scale-95 transition-transform disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
        {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
      </button>
    </form>
  );
}
