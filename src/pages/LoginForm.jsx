import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/storage";
import { useToast } from "../hooks/useToast";
import { translateSupabaseError } from "../utils/errors";

export function LoginForm({ onSuccess }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await loginUser(email, password);
      showToast(`¡Bienvenido de vuelta, ${user.user_metadata?.nombre_completo || "estudiante"}! 👋`, "success");
      onSuccess?.(user);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      const msg = translateSupabaseError(error);
      showToast(msg, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold text-dark mb-2">Correo institucional</label>
        <input 
          type="email" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@universidad.edu"
          className="input-standard" 
        />
      </div>

      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-dark">Contraseña</label>
          <span className="text-xs text-primary-light font-semibold cursor-pointer hover:underline">
            ¿Olvidaste tu contraseña?
          </span>
        </div>
        <div className="relative">
          <input 
            type={showPw ? "text" : "password"} 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="input-standard pr-12" 
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
          >
            {showPw ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full py-3.5 mt-2">
        Iniciar Sesión
      </button>
    </form>
  );
}

