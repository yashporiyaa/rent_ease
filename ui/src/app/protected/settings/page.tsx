"use client";

import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Camera,
  Check,
  CreditCard,
  Mail,
  Phone,
  UserCog,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../components/ui/dialog";
import { UserContext } from "../../context/user-context";
import { API_URL } from "../../../lib/api/config";
import { createCheckoutSession } from "../../../lib/api/stripe";
import { toast } from "react-toastify";

const getDisplayName = (email: string, companyName: string) => {
  if (companyName?.trim()) return companyName.trim();
  const fallback = email.split("@")[0] || "User";
  return fallback
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");

const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read selected logo"));
    reader.readAsDataURL(file);
  });

export default function SettingsPage() {
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { user, refreshUser } = useContext(UserContext);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    companyName: "",
    businessType: "",
    companyLogo: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      email: user.email,
      phone: user.phone || "",
      companyName: user.companyName || "",
      businessType: user.businessType || "",
      companyLogo: user.companyLogo || "",
    });
  }, [user]);

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error("Logo size should be less than 2MB");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, companyLogo: dataUrl }));
      toast.success("Company logo selected");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to process logo";
      toast.error(message);
    } finally {
      event.target.value = "";
    }
  };

  const handleSubscribe = async () => {
    if (isActiveSubscription) {
      toast.info("Your subscription is already active.");
      return;
    }

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

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSavingProfile(true);
      const normalizedCompanyName = form.companyName.trim();
      const normalizedBusinessType = form.businessType.trim();
      const normalizedPhone = form.phone.trim();

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: normalizedCompanyName,
          businessType: normalizedBusinessType,
          phone: normalizedPhone,
          companyLogo: form.companyLogo || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to update profile");
      }

      const refreshedUser = await refreshUser();
      if (!refreshedUser) {
        throw new Error("Profile updated but failed to refresh user data");
      }

      toast.success("Profile updated successfully");
      setEditOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const subscriptionStatus = user?.subscriptionStatus ?? "TRIAL";
  const trialEndsAtMs = user?.trialEndsAt ? Date.parse(user.trialEndsAt) : NaN;
  const currentPeriodEndMs = user?.subscription?.currentPeriodEnd
    ? Date.parse(user.subscription.currentPeriodEnd)
    : NaN;
  const trialEndsAt = Number.isFinite(trialEndsAtMs)
    ? new Date(trialEndsAtMs)
    : null;
  const currentPeriodEnd = Number.isFinite(currentPeriodEndMs)
    ? new Date(currentPeriodEndMs)
    : null;
  const isActiveSubscription =
    subscriptionStatus === "ACTIVE" &&
    (!Number.isFinite(currentPeriodEndMs) || currentPeriodEndMs > nowMs);
  const effectiveSubscriptionStatus =
    subscriptionStatus === "ACTIVE" && !isActiveSubscription
      ? "EXPIRED"
      : subscriptionStatus;
  const renewalLabel = isActiveSubscription
    ? "NEXT RENEWAL"
    : subscriptionStatus === "ACTIVE"
      ? "EXPIRED ON"
      : "TRIAL ENDS";
  const renewalDate = isActiveSubscription
    ? currentPeriodEnd
    : subscriptionStatus === "ACTIVE"
      ? currentPeriodEnd
      : trialEndsAt;

  useEffect(() => {
    if (
      subscriptionStatus !== "ACTIVE" ||
      !Number.isFinite(currentPeriodEndMs)
    ) {
      return;
    }

    const msUntilExpiry = currentPeriodEndMs - nowMs;
    if (msUntilExpiry <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNowMs(Date.now());
    }, msUntilExpiry + 200);

    return () => window.clearTimeout(timeoutId);
  }, [subscriptionStatus, currentPeriodEndMs, nowMs]);

  const profileName = useMemo(() => {
    if (!user) return "";
    return getDisplayName(user.email, user.companyName);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="w-full space-y-8">
        <div>
          <h1 className="text-2xl font-black text-[#111827] max-sm:text-xl">
            Settings
          </h1>
          <p className="mt-2 text-base text-[#6b7280] max-sm:text-sm">
            Manage your account preferences and subscription.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[#111827] max-sm:text-xl">
            Profile Information
          </h2>

          <div className="rounded-[38px] border border-[#e8edf1] bg-white px-8 py-10 shadow-[0_6px_20px_rgba(15,23,42,0.05)] max-sm:px-5 max-sm:py-6">
            <div className="flex items-center justify-between gap-6 max-lg:flex-col max-lg:items-start">
              <div className="flex items-center gap-7 max-sm:w-full max-sm:flex-col max-sm:items-start">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-[5px] border-[#c8efe2] bg-linear-to-br from-[#def7ed] via-white to-[#d2f6e8] text-3xl font-black text-[#12b780] max-sm:h-28 max-sm:w-28 max-sm:text-2xl">
                    {user.companyLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.companyLogo}
                        alt={`${profileName} logo`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      getInitials(profileName)
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#111827] max-sm:text-xl">
                    {profileName}
                  </h3>
                  <p className="flex items-center gap-3 text-base text-[#64748b] max-sm:text-sm">
                    <Mail className="h-5 w-5" />
                    <span>{user.email}</span>
                  </p>
                  <p className="flex items-center gap-3 text-base text-[#64748b] max-sm:text-sm">
                    <Phone className="h-5 w-5" />
                    <span>{user.phone || "Not added"}</span>
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setEditOpen(true)}
                variant="brand"
                className="h-12 rounded-full px-7 text-base font-bold text-white max-sm:h-11 max-sm:px-5 max-sm:text-sm cursor-pointer"
              >
                <UserCog className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4 pb-8">
          <h2 className="text-2xl font-black text-[#111827] max-sm:text-xl">
            Subscription
          </h2>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
            <div className="rounded-[38px] bg-linear-to-b from-[#27cf96] to-[#16be87] p-8 text-white shadow-[0_16px_36px_rgba(11,184,128,0.25)]">
              <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-bold tracking-wide">
                {isActiveSubscription ? "ACTIVE PLAN" : "UPGRADE PLAN"}
              </span>

              <h3 className="mt-5 text-3xl font-black">Pro Plan</h3>
              <p className="mt-4 text-3xl font-black">
                Rs. 1,999
                <span className="ml-2 text-lg font-medium">/month</span>
              </p>

              <ul className="mt-7 space-y-3 text-base max-sm:text-sm">
                {[
                  "Unlimited Property Listings",
                  "Automated Rent Collection",
                  "Priority Customer Support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <Check className="h-4 w-4" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleSubscribe}
                disabled={startingCheckout || isActiveSubscription}
                className="mt-8 h-14 w-full rounded-full bg-white text-base font-black text-[#11bb82] hover:bg-[#ecfffa] cursor-pointer"
              >
                {startingCheckout
                  ? "Redirecting..."
                  : isActiveSubscription
                    ? "Subscription Active"
                    : "Upgrade Plan"}
              </Button>
            </div>

            <div className="flex flex-col justify-between rounded-[38px] border border-[#e8edf1] bg-white p-8 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
              <div>
                <h3 className="text-2xl font-black text-[#111827] max-sm:text-xl">
                  Billing Information
                </h3>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf2f7] text-[#64748b]">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold tracking-wide text-[#64748b]">
                        {renewalLabel}
                      </p>
                      <p className="text-xl font-semibold text-[#111827] max-sm:text-base">
                        {renewalDate
                          ? renewalDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : isActiveSubscription
                            ? "Pending sync"
                            : "No active renewal"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf2f7] text-[#64748b]">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold tracking-wide text-[#64748b]">
                        PAYMENT METHOD
                      </p>
                      <p className="text-xl font-semibold text-[#111827] max-sm:text-base">
                        {isActiveSubscription
                          ? "Visa ending in 4242"
                          : "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf2f7] text-[#64748b]">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold tracking-wide text-[#64748b]">
                        SUBSCRIPTION STATUS
                      </p>
                      <p className="text-xl font-semibold text-[#111827] max-sm:text-base">
                        {effectiveSubscriptionStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-full border-[#d7dfe8] text-base font-bold text-[#334155] hover:bg-[#f8fafc] cursor-pointer"
                >
                  Update Payment
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  className="px-2 text-base font-bold text-[#ef4444] cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-205 overflow-hidden rounded-[36px] border-[#e3ece8] p-0"
        >
          <div className="border-b border-[#e3ece8] px-9 py-7 max-sm:px-5 max-sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#def7ed] text-[#11bb82]">
                  <UserCog className="h-5 w-5" />
                </span>
                <div>
                  <DialogTitle className="text-2xl font-black text-[#111827] max-sm:text-xl">
                    Edit Profile
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-base text-[#64748b] max-sm:text-sm">
                    Update your account details
                  </DialogDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditOpen(false)}
                className="text-3xl leading-none text-[#94a3b8 cursor-pointer"
                aria-label="Close"
              >
                <X />
              </Button>
            </div>
          </div>

          <div className="space-y-6 px-9 py-8 max-sm:px-5">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#dff6ec] bg-linear-to-br from-[#ebf7f1] to-[#d9ece4] text-3xl font-black text-[#11bb82]">
                  {form.companyLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.companyLogo}
                      alt={`${form.companyName || profileName} logo`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    getInitials(form.companyName || profileName)
                  )}
                </div>
                <input
                  id="company-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleLogoChange(event)}
                  className="hidden"
                />
                <label
                  htmlFor="company-logo-upload"
                  className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#17cf91] text-white"
                  aria-label="Change company logo"
                >
                  <Camera className="h-4 w-4" />
                </label>
              </div>
              <p className="text-2xl font-semibold text-[#11bb82] max-sm:text-base">
                Change Company Logo
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-base font-bold text-[#111827] max-sm:text-sm">
                  Company Name
                </label>
                <div className="flex h-14 items-center gap-3 rounded-full border border-[#dbe4ee] bg-[#f5f8fb] px-5">
                  <Building2 className="h-5 w-5 text-[#94a3b8]" />
                  <input
                    value={form.companyName}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        companyName: event.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94a3b8] max-sm:text-sm"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-bold text-[#111827] max-sm:text-sm">
                  Email Address
                </label>
                <div className="flex h-14 items-center gap-3 rounded-full border border-[#dbe4ee] bg-[#f5f8fb] px-5">
                  <Mail className="h-5 w-5 text-[#94a3b8]" />
                  <input
                    value={form.email}
                    disabled
                    className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94a3b8] disabled:opacity-100 max-sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base font-bold text-[#111827] max-sm:text-sm">
                    Phone Number
                  </label>
                  <div className="flex h-14 items-center gap-3 rounded-full border border-[#dbe4ee] bg-[#f5f8fb] px-5">
                    <Phone className="h-5 w-5 text-[#94a3b8]" />
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94a3b8] max-sm:text-sm"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-base font-bold text-[#111827] max-sm:text-sm">
                    Type of Business
                  </label>
                  <div className="flex h-14 items-center gap-3 rounded-full border border-[#dbe4ee] bg-[#f5f8fb] px-5">
                    <Building2 className="h-5 w-5 text-[#94a3b8]" />
                    <input
                      value={form.businessType}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          businessType: event.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-base text-[#111827] outline-none placeholder:text-[#94a3b8] max-sm:text-sm"
                      placeholder="Type of Business"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-5 border-t border-[#e3ece8] px-9 py-6 max-sm:px-5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 text-base font-bold text-[#334155] max-sm:text-base cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="h-12 rounded-full px-8 text-base font-bold text-white cursor-pointer"
            >
              <Check className="h-4 w-4" />
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
