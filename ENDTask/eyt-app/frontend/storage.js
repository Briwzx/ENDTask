// ── Sesión activa ─────────────────────────────────────────────────
export const getSession   = ()     => JSON.parse(localStorage.getItem("eyt_session") || "null");
export const saveSession  = (user) => localStorage.setItem("eyt_session", JSON.stringify(user));
export const clearSession = ()     => {
  localStorage.removeItem("eyt_session");
  localStorage.removeItem("eyt_token");
};
