"use client";

import { createContext, useContext, useState } from "react";

type OnboardingContextType = {
  customerId?: string;
  itemId?: string;
  setCustomerId: (id: string) => void;
  setItemId: (id: string) => void;
}

export const OnboardingContext = createContext<OnboardingContextType>(
  {} as OnboardingContextType,
);

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [customerId, setCustomerId] = useState<string>();
  const [itemId, setItemId] = useState<string>();

  return (
    <OnboardingContext.Provider
      value={{ customerId, itemId, setCustomerId, setItemId }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}
