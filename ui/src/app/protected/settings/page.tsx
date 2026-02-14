"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/app/context/user-context";
import { updateUserTaxSettings } from "@/lib/api/user";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [taxRate, setTaxRate] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) return;

    setTaxRate(user.taxRate?.toString() || "0");
  }, [user]);

  const submit = async () => {
    setLoading(true);

    await updateUserTaxSettings(taxRate);
    toast.success("Tax settings updated successfully");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-xl border shadow-sm space-y-6">
      <h1 className="text-2xl font-black text-[#0e1b17]">Tax Settings</h1>

      <div>
        <label className="text-sm font-semibold text-[#0e1b17]">
          GST / Tax Percentage
        </label>

        <input
          type="number"
          min="0"
          max="100"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
          className="mt-2 border p-3 w-full rounded-xl"
        />
      </div>

      <Button
        onClick={submit}
        disabled={loading}
        className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
      >
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
