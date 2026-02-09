"use client";

import { UserContextType } from "@/types";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext<UserContextType>(
  {} as UserContextType,
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:3001/users/me", {
      credentials: "include",
    });

    if (res.ok) {
      const user = await res.json();
      console.log(user.data);
      setUser(user.data);
    } else {
      setUser(null);
    }

    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await fetch("http://localhost:3001/users/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    localStorage.clear();
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{ user, loading, logout, getUser }}>
      {children}
    </UserContext.Provider>
  );
};
