import * as mock from "./mock.js";

// Demo mode is ON unless VITE_USE_MOCK=false.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const BASE = import.meta.env.VITE_API_BASE || "/api";

async function request(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form; // the browser sets the multipart header itself
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  if (res.status === 401 && !path.startsWith("/auth/")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.assign("/login");
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data.detail) msg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch { /* keep default message */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const orNull = async (fn) => {
  try { return await fn(); } catch (e) { if (e.status === 404) return null; throw e; }
};

const real = {
  register: (d) => request("/auth/register", { method: "POST", body: d }),
  login: (d) => request("/auth/login", { method: "POST", body: d }),
  getProfile: () => orNull(() => request("/profile")),
  saveProfile: (d) => request("/profile", { method: "PUT", body: d }),
  getNutritionPlan: () => orNull(() => request("/nutrition-plan")),
};

export const api = USE_MOCK ? mock.api : real;
