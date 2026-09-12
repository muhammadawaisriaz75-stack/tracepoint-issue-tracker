import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (payload) => {
    localStorage.setItem("tracepoint_token", payload.token);
    setUser({ _id: payload._id, name: payload.name, email: payload.email });
  };

  const login = async (email, password) => {
    const payload = await authApi.login({ email, password });
    saveSession(payload);
    return payload;
  };

  const register = async (name, email, password) => {
    const payload = await authApi.register({ name, email, password });
    saveSession(payload);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem("tracepoint_token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("tracepoint_token");

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("tracepoint_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
