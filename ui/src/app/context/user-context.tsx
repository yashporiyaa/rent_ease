"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type UserContextType = {
  user: User;
  loading: boolean;
  logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextType>(
  {} as UserContextType,
);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch("http://localhost:3001/users/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const logout = async () => {
    setLoading(true);
    await fetch("http://localhost:3001/users/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};
