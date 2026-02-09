import { ReactNode } from "react";

export type PageWrapperProps = { children: ReactNode };

export type User = {
  id: string;
  supabaseId: string;
  companyName: string;
  phone: string;
  email: string;
  businessType: string;
  businessAddress: string;
  onboardingStep: number;
  onboardingDone: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserContextType = {
  user: User;
  loading: boolean;
  logout: () => Promise<void>;
  getUser: () => Promise<void>;
};
