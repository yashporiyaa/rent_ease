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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "@/app/context/user-context";
import {
  Sidebar as UiSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/protected/customers", label: "Customers", icon: Users },
  { href: "/protected/reports", label: "Reports", icon: BarChart3 },
];

const groupedNavItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { href: "/protected/dashboard", label: "Finance Dashboard" },
      { href: "/protected/calendar", label: "Calendar" },
    ],
  },
  {
    key: "rent",
    label: "Rent",
    icon: Receipt,
    children: [
      { href: "/protected/rentals", label: "Rent Invoice" },
      { href: "/protected/rentals/delivery", label: "Delivery" },
      { href: "/protected/rentals/return", label: "Return" },
      { href: "/protected/rentals/check-availability", label: "Check Availability" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    icon: FileText,
    children: [
      { href: "/protected/invoices", label: "Invoices" },
      { href: "/protected/finance/receipts", label: "Receipts" },
      { href: "/protected/finance/payments", label: "Payments" },
    ],
  },
  {
    key: "master",
    label: "Master",
    icon: Boxes,
    children: [
      { href: "/protected/items", label: "Product" },
      { href: "/protected/item-categories", label: "Product Category" },
      { href: "/protected/sizes", label: "Sizes" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useContext(UserContext);
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: false,
    rent: false,
    finance: false,
    master: false,
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <UiSidebar
      side="left"
      variant="sidebar"
      collapsible="icon"
      className="bg-white border-r border-slate-200"
    >
      <SidebarHeader className="px-4 pt-4 pb-2">
        <div className="relative flex items-center gap-3 px-2">
          <div className="bg-[#17cf91] p-2 rounded-lg text-white">🔑</div>
          {!isCollapsed && (
            <div>
              <p className="font-bold text-[#0e1b17]">RentEase</p>
              <p className="text-xs text-[#17cf91]">Management Portal</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute right-0 top-0 p-1 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={label}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-[#17cf91]/10 text-[#17cf91]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Link href={href}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}

          {groupedNavItems.map(({ key, label, icon: Icon, children }) => {
            const isActive = children.some((child) => pathname.startsWith(child.href));
            const isOpen = Boolean(openGroups[key]);

            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  onClick={() => toggleGroup(key)}
                  tooltip={label}
                  isActive={isActive}
                  className={`justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-[#17cf91]/10 text-[#17cf91]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon size={18} />
                    <span>{label}</span>
                  </span>
                  {!isCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </SidebarMenuButton>

                {!isCollapsed && isOpen && (
                  <SidebarMenuSub className="mt-1 ml-6 border-none px-0">
                    {children.map((child) => {
                      const childActive = pathname.startsWith(child.href);
                      return (
                        <SidebarMenuSubItem key={child.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={childActive}
                            className={`rounded-lg px-3 py-2 text-sm ${
                              childActive
                                ? "bg-[#17cf91]/10 text-[#17cf91] font-medium"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <Link href={child.href}>
                              <span>{child.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-4">
        <SidebarMenu className="pt-2 border-t space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Link href="/protected/settings">
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </UiSidebar>
  );
}
