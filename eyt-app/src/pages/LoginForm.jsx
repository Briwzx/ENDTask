import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, PasswordField } from "../components/FormFields";
import { IconMail } from "../components/Icons";
import { loginUser } from "../utils/storage";

export function LoginForm({ showToast }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await loginUser(email, password);
      showToast(`¡Bienvenido de vuelta, ${user.nombre || "estudiante"}! 👋`, "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      showToast("El correo electrónico o la contraseña no son correctos. Por favor, revisa tus datos e intenta de nuevo.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-10 pb-10 flex flex-col gap-4">
      {/* Correo */}
      <Field label="Correo electrónico" icon={<IconMail />}>
        <input type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className="bg-transparent flex-1 text-sm text-gray-800 outline-none placeholder-gray-400" />
      </Field>

      {/* Contraseña */}
      <PasswordField label="Contraseña" value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••" show={showPw}
        onToggle={() => setShowPw(!showPw)} />

      {/* Olvidaste contraseña */}
      <div className="text-right -mt-2">
        <span className="text-xs text-yellow-600 underline cursor-pointer">
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      {/* Botón */}
      <button type="submit"
        className="w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-widest shadow-md active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
        INICIAR SESIÓN
      </button>
    </form>
  );
}
