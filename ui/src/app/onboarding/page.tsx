"use client";

import { useContext, useEffect, useState } from "react";
import { BusinessStep } from "./components/business-step";
import { CustomerStep } from "./components/customer-step";
import { ItemStep } from "./components/Item-step";
import { UserContext } from "../context/user-context";

export default function Page() {
  const [step, setStep] = useState(1);
  const { accessToken } = useContext(UserContext);

  useEffect(() => {
    if (accessToken) {
      fetch("http://localhost:3001/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setStep(data.data.onboardingStep);
        });
    }
  }, []);

  if (step === 1) return <BusinessStep />;
  if (step === 2) return <CustomerStep />;
  if (step === 3) return <ItemStep />;
  //   if (step === 4) return <RentalSte />;
}
