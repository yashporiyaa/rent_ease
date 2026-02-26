"use client";

import { getUser, logoutUser } from "@/lib/api/user";
import { ProviderChildrenProps, User, UserContextType } from "@/types";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const UserContext = createContext<UserContextType>(
  {} as UserContextType,
);

export const UserProvider = ({ children }: ProviderChildrenProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUser();
      const currentUser = (response?.data ?? null) as User | null;
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      localStorage.removeItem("isLoggedIn");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      localStorage.clear();
      toast.success("Logged out successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
