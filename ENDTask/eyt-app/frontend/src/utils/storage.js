// ── Usuarios registrados ──────────────────────────────────────────
export const getUsers   = ()      => JSON.parse(localStorage.getItem("eyt_users")   || "[]");
export const saveUsers  = (users) => localStorage.setItem("eyt_users",  JSON.stringify(users));

// ── Sesión activa ─────────────────────────────────────────────────
export const getSession    = ()     => JSON.parse(localStorage.getItem("eyt_session") || "null");
export const saveSession   = (user) => localStorage.setItem("eyt_session", JSON.stringify(user));
export const clearSession  = ()     => localStorage.removeItem("eyt_session");
