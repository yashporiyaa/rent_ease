"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/app/context/user-context";
import { createCheckoutSession } from "@/lib/api/stripe";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [startingCheckout, setStartingCheckout] = useState(false);
  const { user } = useContext(UserContext);

  const handleSubscribe = async () => {
    try {
      setStartingCheckout(true);
      const checkoutUrl = await createCheckoutSession();
      window.location.href = checkoutUrl;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start subscription";
      toast.error(message);
      setStartingCheckout(false);
    }
  };

  const subscriptionStatus = user?.subscriptionStatus ?? "TRIAL";
  const isActiveSubscription = subscriptionStatus === "ACTIVE";
  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const currentPlan = isActiveSubscription ? "Transparent Plan" : "Free Trial";
  const planPrice = isActiveSubscription ? "Rs. 1999 / month" : "Upgrade to subscribe";
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Subscription & Billing
        </h1>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#d6efe6] bg-[#f4fcf8] p-5 space-y-2">
            <p className="text-sm text-[#4e977f]">Current Plan</p>
            <p className="text-xl font-black text-[#0e1b17]">{currentPlan}</p>
            <p className="text-sm text-[#4e977f]">{planPrice}</p>
          </div>

          <div className="rounded-xl border border-[#d6efe6] bg-[#f4fcf8] p-5 space-y-2">
            <p className="text-sm text-[#4e977f]">Current Status</p>
            <p className="text-xl font-black text-[#0e1b17]">
              {subscriptionStatus}
            </p>
            {trialEndsAt && (
              <p className="text-sm text-[#4e977f]">
                Trial ends on{" "}
                {trialEndsAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubscribe}
          disabled={startingCheckout || isActiveSubscription}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          {isActiveSubscription
            ? "Subscription Active"
            : startingCheckout
              ? "Redirecting..."
              : "Subscribe Now"}
        </Button>
      </div>
    </div>
  );
}
