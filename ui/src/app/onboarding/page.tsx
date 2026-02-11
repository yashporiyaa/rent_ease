"use client";

import { useContext, useState } from "react";
import { BusinessStep } from "./components/business-step";
import { CustomerStep } from "./components/customer-step";
import { ItemStep } from "./components/Item-step";
import { UserContext } from "../context/user-context";
import { RentalStep } from "./components/rental-step";

export default function Page() {
  const [step, setStep] = useState(1);
  const { user } = useContext(UserContext);

  if (step === 1) return <BusinessStep onSuccess={() => setStep(2)} />;
  if (step === 2) return <CustomerStep onSuccess={() => setStep(3)} />;
  if (step === 3) return <ItemStep onSuccess={() => setStep(4)} />;
  if (step === 4) return <RentalStep />;
}
