"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-20 grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-5xl font-black leading-tight text-[#0e1b17]">
            The smarter way to manage your property portfolio
          </h1>
          <p className="mt-6 text-[#4e977f]">
            Rent-Ease provides landlords and property managers with the tools to
            automate operations, maximize ROI, and deliver a superior tenant
            experience.
          </p>

          <div className="mt-8 flex gap-4">
            <Button
              className="rounded-full bg-[#17cf91] hover:bg-[#17cf91]/90 px-8 text-[#0e1b17] font-bold cursor-pointer"
              variant="brand"
              onClick={() => {
                router.push("/auth/signup");
              }}
            >
              Get Started
            </Button>
            <Button
              variant="brand"
              className="rounded-full border-[#d0e7df] cursor-pointer"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
            alt="Apartments"
          />
        </div>
      </section>

      {/* ABOUT */}
      <section className="bg-white px-6 py-20 text-center">
        <p className="text-sm font-semibold text-[#17cf91]">ABOUT RENT-EASE</p>
        <h2 className="mt-4 text-3xl font-black text-[#0e1b17]">
          Revolutionizing Property Management
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-[#4e977f]">
          Our mission is to simplify the complexities of property ownership by
          combining cutting-edge technology with intuitive design.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-4">
          {[
            ["10K+", "Properties Managed"],
            ["500+", "Landlords"],
            ["99.9%", "Uptime"],
            ["24/7", "Support"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-black text-[#17cf91]">{value}</p>
              <p className="text-sm text-[#4e977f]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#f2fdf9] px-6 py-20">
        <h2 className="text-center text-3xl font-black text-[#0e1b17]">
          Everything you need to grow
        </h2>

        <div className="mx-auto mt-12 max-w-7xl grid gap-6 md:grid-cols-4">
          {[
            ["Lease Management", "Automated contracts and renewals."],
            ["Online Payments", "Secure rent collection."],
            ["Maintenance", "Track and resolve issues."],
            ["Analytics", "Insights into ROI and growth."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-[#0e1b17]">{title}</h3>
              <p className="mt-2 text-sm text-[#4e977f]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-white px-6 py-20">
        <h2 className="text-center text-3xl font-black text-[#0e1b17]">
          Transparent Pricing
        </h2>

        <div className="mx-auto mt-12 max-w-xl">
          <div className="rounded-2xl border border-[#17cf91] p-8 text-center">
            <h3 className="font-semibold text-[#0e1b17]">Transparent Plan</h3>
            <p className="mt-4 text-3xl font-black text-[#0e1b17]">Rs. 1999</p>
            <p className="mt-2 text-sm text-[#4e977f]">
              Complete access for property management.
            </p>
            <Button
              className="mt-6 w-full rounded-full bg-[#17cf91] hover:bg-[#17cf91]/90 text-[#0e1b17] font-bold cursor-pointer"
              variant="brand"
              onClick={() => {
                router.push("/auth/signup");
              }}
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
