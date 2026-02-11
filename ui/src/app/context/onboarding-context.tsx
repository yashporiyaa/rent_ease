"use client";

import {
  OnboardingContextType,
  ProviderChildrenProps,
} from "@/types";
import { createContext, useState } from "react";

export const OnboardingContext = createContext<OnboardingContextType>(
  {} as OnboardingContextType,
);

export const OnboardingProvider = ({
  children,
}: ProviderChildrenProps) => {
  const [customerId, setCustomerId] = useState<string>();
  const [itemId, setItemId] = useState<string>();

  return (
    <OnboardingContext.Provider
      value={{ customerId, itemId, setCustomerId, setItemId }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
