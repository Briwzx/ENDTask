import { IconEye } from "./Icons";

// ── Campo genérico con ícono ──────────────────────────────────────
export function Field({ label, icon, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div
        className={`flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border transition-all ${
          error
            ? "border-red-400"
            : "border-gray-200 focus-within:border-yellow-400 focus-within:bg-white"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && <span className="text-xs text-red-500 pl-1">{error}</span>}
    </div>
  );
}

// ── Campo de contraseña con toggle mostrar/ocultar ────────────────
export function PasswordField({ label, value, onChange, placeholder, show, onToggle, error }) {
  return (
    <Field label={label} icon={null} error={error}>
      {/* Ícono candado inline para no depender de prop */}
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <input
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={8}
        className="bg-transparent flex-1 text-sm text-gray-800 outline-none placeholder-gray-400"
      />
      <button
        type="button"
        onClick={onToggle}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <IconEye off={show} />
      </button>
    </Field>
  );
}
