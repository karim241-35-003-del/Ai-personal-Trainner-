import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

function loadUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const save = useCallback((data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(async (email, password) => save(await api.login({ email, password })), [save]);
  const register = useCallback(async (name, email, password) => save(await api.register({ name, email, password })), [save]);
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
