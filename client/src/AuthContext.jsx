import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("crm_token")) { setLoading(false); return; }
    getMe().then(({ user }) => setUser(user)).catch(() => localStorage.removeItem("crm_token")).finally(() => setLoading(false));
  }, []);

  const signIn  = ({ token, user }) => { localStorage.setItem("crm_token", token); setUser(user); };
  const signOut = () => { localStorage.removeItem("crm_token"); setUser(null); };

  return <Ctx.Provider value={{ user, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
