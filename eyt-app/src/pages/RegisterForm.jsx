import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Field, PasswordField } from "../components/FormFields";
import { IconPhone, IconMail, IconCalendar, IconUser } from "../components/Icons";
import { registerUser } from "../utils/storage";

// Rango de años para el selector
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

export function RegisterForm({ showToast }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", apellido: "", telefono: "",
    email: "", anio: "", password: "", confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const ch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.nombre.trim()) errs.nombre = "El nombre es requerido";
    if (!form.apellido.trim()) errs.apellido = "El apellido es requerido";
    if (!form.telefono.trim()) errs.telefono = "El teléfono es requerido";
    if (!form.email.trim()) errs.email = "El correo es requerido";
    if (!form.anio) errs.anio = "Selecciona un año";
    if (form.password.length < 8) errs.password = "La contraseña debe tener al menos 8 caracteres";
    if (form.password !== form.confirm) errs.confirm = "Asegúrate de que las contraseñas coincidan";
    if (!accepted) errs.terms = "Debes aceptar los términos";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      const userData = {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email,
        anio: form.anio,
        password: form.password,
      };

      await registerUser(userData);
      showToast(`¡Cuenta creada exitosamente! Bienvenido/a a End Your Tasks, ${form.nombre} 🎉`, "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      const msg = "Tuvimos un problema al crear tu cuenta. Por favor, verifica tus datos e inténtalo de nuevo.";
      showToast(msg, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-10 pb-10 flex flex-col gap-3">
      {/* Nombre + Apellido */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre" icon={<IconUser />} error={errors.nombre}>
          <input type="text" required value={form.nombre} onChange={ch("nombre")}
            placeholder="Nombre"
            className="bg-transparent w-full text-sm text-gray-800 outline-none placeholder-gray-400" />
        </Field>
        <Field label="Apellido" icon={<IconUser />} error={errors.apellido}>
          <input type="text" required value={form.apellido} onChange={ch("apellido")}
            placeholder="Apellido"
            className="bg-transparent w-full text-sm text-gray-800 outline-none placeholder-gray-400" />
        </Field>
      </div>

      {/* Teléfono */}
      <Field label="Teléfono" icon={<IconPhone />} error={errors.telefono}>
        <input type="tel" required value={form.telefono} onChange={ch("telefono")}
          placeholder="+57 300 000 0000"
          className="bg-transparent flex-1 text-sm text-gray-800 outline-none placeholder-gray-400" />
      </Field>

      {/* Correo */}
      <Field label="Correo electrónico" icon={<IconMail />} error={errors.email}>
        <input type="email" required value={form.email} onChange={ch("email")}
          placeholder="correo@ejemplo.com"
          className="bg-transparent flex-1 text-sm text-gray-800 outline-none placeholder-gray-400" />
      </Field>

      {/* Año de nacimiento */}
      <Field label="Año de nacimiento" icon={<IconCalendar />} error={errors.anio}>
        <select required value={form.anio} onChange={ch("anio")}
          className="bg-transparent flex-1 text-sm outline-none appearance-none cursor-pointer"
          style={{ color: form.anio ? "#1f2937" : "#9ca3af" }}>
          <option value="" disabled>Selecciona un año</option>
          {years.map((y) => (
            <option key={y} value={y} style={{ color: "#1f2937" }}>{y}</option>
          ))}
        </select>
        <svg className="w-4 h-4 text-gray-400 pointer-events-none flex-shrink-0"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Field>

      {/* Contraseña */}
      <PasswordField label="Contraseña" value={form.password} onChange={ch("password")}
        placeholder="Mín. 8 caracteres" show={showPw}
        onToggle={() => setShowPw(!showPw)} error={errors.password} />

      {/* Confirmar contraseña */}
      <PasswordField label="Confirmar contraseña" value={form.confirm} onChange={ch("confirm")}
        placeholder="Repite tu contraseña" show={showCf}
        onToggle={() => setShowCf(!showCf)} error={errors.confirm} />

      {/* Términos */}
      <label className="flex items-start gap-2 cursor-pointer select-none">
        <div onClick={() => setAccepted(!accepted)}
          className={`w-4 h-4 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${accepted ? "border-yellow-500 bg-yellow-400" : "border-gray-300"
            }`}>
          {accepted && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-xs text-gray-500">
          Acepto los{" "}
          <span className="underline text-yellow-600 cursor-pointer">Términos y Condiciones</span>
        </span>
      </label>
      {errors.terms && <span className="text-xs text-red-500 -mt-1">{errors.terms}</span>}

      {/* Botón */}
      <button type="submit"
        className="mt-1 w-full py-3.5 rounded-xl text-sm font-bold text-white tracking-widest shadow-md active:scale-95 transition-transform"
        style={{ background: "linear-gradient(135deg, #c8a84b, #a8882a)" }}>
        CREAR CUENTA
      </button>
    </form>
  );
}
