"use client";

import { useEffect, useState, useContext } from "react";
import { Building2, Phone, Percent, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/app/context/user-context";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { user, refreshUser } = useContext(UserContext);

  const [form, setForm] = useState({
    companyName: "",
    phone: "",
    businessType: "",
    businessAddress: "",
    taxRate: 0,
    invoiceTemplate: "minimal",
  });

//   useEffect(() => {
//     refreshUser();
//   }, []);

  useEffect(() => {
    if (user) {
      setForm({
        companyName: user.companyName || "",
        phone: user.phone || "",
        businessType: user.businessType || "",
        businessAddress: user.businessAddress || "",
        taxRate: user.taxRate || 0,
        invoiceTemplate: user.invoiceTemplate || "minimal",
      });
    }
  }, [user]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    await fetch("http://localhost:3001/users/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

        <input
          className="border p-3 rounded-xl w-full"
          placeholder="Company Name"
          value={form.companyName}
          onChange={(e) => handleChange("companyName", e.target.value)}
        />

        <input
          className="border p-3 rounded-xl w-full"
          placeholder="Business Type"
          value={form.businessType}
          onChange={(e) => handleChange("businessType", e.target.value)}
        />

        <input
          className="border p-3 rounded-xl w-full"
          placeholder="Business Address"
          value={form.businessAddress}
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

        <input
          disabled
          className="border p-3 rounded-xl w-full bg-slate-100"
          value={user?.email || ""}
        />

        <input
          className="border p-3 rounded-xl w-full"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      {/* TAX SETTINGS */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Percent className="text-[#17cf91]" />
          <h2 className="font-bold text-lg">Tax Settings</h2>
        </div>

        <input
          type="number"
          min="0"
          max="100"
          className="border p-3 rounded-xl w-full"
          placeholder="Default Tax Rate (%)"
          value={form.taxRate}
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
                form.invoiceTemplate === template
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
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
      >
        Save Changes
      </Button>
    </div>
  );
}
