"use client";

import { useState, useContext } from "react";
import { Building2, Phone, Percent, FileText } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { UserContext } from "../../context/user-context";
import { API_URL } from "../../../lib/api/config";
import { toast } from "react-toastify";
import { ProfileForm } from "../../../types";

export default function ProfilePage() {
  const { user, refreshUser } = useContext(UserContext);

  const [form, setForm] = useState<ProfileForm | null>(null);

  if (!user) {
    return null;
  }

  const currentForm: ProfileForm = form ?? {
    companyName: user.companyName || "",
    phone: user.phone || "",
    businessType: user.businessType || "",
    businessAddress: user.businessAddress || "",
    taxRate: user.taxRate || 0,
    invoiceTemplate: user.invoiceTemplate || "minimal",
  };

  const handleChange = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...(prev ?? currentForm), [key]: value }));
  };

  const saveProfile = async () => {
    await fetch(`${API_URL}/users/profile`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentForm),
    });

    await refreshUser();
    toast.success("Profile updated successfully");
  };

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-3xl font-black text-[#0e1b17]">
        Business Profile
      </h1>

      {/* BUSINESS INFO */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="text-[#17cf91]" />
          <h2 className="font-bold text-lg">Business Information</h2>
        </div>

        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Company Name"
          value={currentForm.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
        />

        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Business Type"
          value={currentForm.businessType}
          onChange={(e) => handleChange("businessType", e.target.value)}
        />

        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Business Address"
          value={currentForm.businessAddress}
          onChange={(e) =>
            handleChange("businessAddress", e.target.value)
          }
        />
      </div>

      {/* CONTACT */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="text-[#17cf91]" />
          <h2 className="font-bold text-lg">Contact</h2>
        </div>

        <Input
          disabled
          className="border p-3 rounded-xl w-full bg-slate-100"
          value={user?.email || ""}
        />

        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Phone"
          value={currentForm.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      {/* TAX SETTINGS */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Percent className="text-[#17cf91]" />
          <h2 className="font-bold text-lg">Tax Settings</h2>
        </div>

        <Input
          type="number"
          min="0"
          max="100"
          className="border p-3 rounded-xl w-full"
          placeholder="Default Tax Rate (%)"
          value={currentForm.taxRate}
          onChange={(e) =>
            handleChange("taxRate", Number(e.target.value))
          }
        />
      </div>

      {/* TEMPLATE SELECTION */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="text-[#17cf91]" />
          <h2 className="font-bold text-lg">Invoice Template</h2>
        </div>

        <div className="flex gap-4">
          {["MINIMAL", "CLASSIC", "MODERN"].map((template) => (
            <button
              key={template}
              onClick={() =>
                handleChange("invoiceTemplate", template)
              }
              className={`px-4 py-2 rounded-xl border font-medium
              ${
                currentForm.invoiceTemplate === template
                  ? "bg-[#17cf91] text-white"
                  : "bg-slate-50"
              }`}
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={saveProfile}
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
      >
        Save Changes
      </Button>
    </div>
  );
}
