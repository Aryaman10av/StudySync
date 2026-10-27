import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth.api.js";
import { usersApi } from "../api/data.api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.me()
      .then(({ user: currentUser }) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function login(credentials) {
    const result = await authApi.login(credentials);
    setUser(result.user);
    return result.user;
  }

  async function register(details) {
    const result = await authApi.register(details);
    setUser(result.user);
    return result.user;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  async function updateUser(profile) {
    const result = await usersApi.update(profile);
    setUser(result.user);
    return result.user;
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}