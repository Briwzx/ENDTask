// ── Notificación flotante (toast) ─────────────────────────────────
export function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {message}
    </div>
  );
}
