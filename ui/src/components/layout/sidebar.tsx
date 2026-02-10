"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Boxes,
  BarChart3,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/app/context/user-context";
import { Button } from "../ui/button";

const navItems = [
  { href: "/protected/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/protected/rentals", label: "Rentals", icon: Receipt },
  { href: "/protected/invoices", label: "Invoices", icon: FileText }, 
  { href: "/protected/customers", label: "Customers", icon: Users },
  { href: "/protected/items", label: "Items", icon: Boxes },
  { href: "/protected/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useContext(UserContext);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="w-64 fixed h-full bg-white border-r border-slate-200">
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-[#17cf91] p-2 rounded-lg text-white">🔑</div>
          <div>
            <p className="font-bold text-[#0e1b17]">Rent-Ease</p>
            <p className="text-xs text-[#17cf91]">Management Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                  ${
                    active
                      ? "bg-[#17cf91]/10 text-[#17cf91]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            <Settings size={18} />
            Settings
          </Link>

          <Button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-lg"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
