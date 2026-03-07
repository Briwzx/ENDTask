const BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("eyt_token");

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error en la peticion");
  return data;
};

export const authAPI = {
  register: async (userData) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    localStorage.setItem("eyt_token", data.token);
    localStorage.setItem("eyt_session", JSON.stringify(data.user));
    return data;
  },
  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("eyt_token", data.token);
    localStorage.setItem("eyt_session", JSON.stringify(data.user));
    return data;
  },
  logout: () => {
    localStorage.removeItem("eyt_token");
    localStorage.removeItem("eyt_session");
  },
};

export const tasksAPI = {
  getAll: () => request("/tasks"),
  create: (data) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};

export const notificationsAPI = {
  getAll: () => request("/notifications"),
};

export const rendimientoAPI = {
  getSemanal: () => request("/rendimiento"),
};
