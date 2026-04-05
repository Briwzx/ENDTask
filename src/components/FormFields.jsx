import { IconEye } from "./Icons";

// ── Generic Field with Icon ──────────────────────────────────────
export function Field({ label, icon, error, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-dark tracking-tight">
          {label}
        </label>
      )}
      <div
        className={`flex items-center gap-3 bg-white rounded-lg px-4 py-3 border transition-all shadow-sm ${
          error
            ? "border-status-error"
            : "border-border focus-within:border-primary-light focus-within:ring-2 focus-within:ring-primary-ghost"
        }`}
      >
        {icon && <span className="text-muted">{icon}</span>}
        {children}
      </div>
      {error && <span className="text-xs text-status-error font-medium pl-1">{error}</span>}
    </div>
  );
}

// ── Password Field with Show/Hide Toggle ────────────────
export function PasswordField({ label, value, onChange, placeholder, show, onToggle, error }) {
  return (
    <Field label={label} error={error}>
      <input
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={8}
        className="bg-transparent flex-1 text-sm text-dark outline-none placeholder-muted"
      />
      <button
        type="button"
        onClick={onToggle}
        className="text-muted hover:text-dark transition-colors"
      >
        <IconEye off={show} />
      </button>
    </Field>
  );
}
