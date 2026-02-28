"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Settings,
  LogOut,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../../app/context/user-context";
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
} from "../ui/sidebar";
import { Button } from "../ui/button";
import ImagePlaceholder from "../../assests/images/imageplaceholder.png";

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
  const { user, logout } = useContext(UserContext);
  const router = useRouter();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const companyName = user?.companyName?.trim() || user?.email?.split("@")[0] || "RentEase";
  const companyLogo = user?.companyLogo?.trim() || ImagePlaceholder;
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
      style={{ ["--sidebar-width-icon" as string]: "4rem" }}
      className="bg-white border-r border-slate-200"
    >
      <SidebarHeader className={isCollapsed ? "px-2 pt-4 pb-2" : "px-4 pt-4 pb-2"}>
        <div className={isCollapsed ? "flex justify-center" : "flex items-center gap-3 px-2"}>
          {!isCollapsed && (
            <>
              <div className="flex items-center gap-2">
                <Image
                  width={48}
                  height={48}
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  className="h-12 w-12 rounded-full bg-white p-1 object-contain"
                  priority
                />
                <span className="text-lg font-bold tracking-tight text-[#0e1b17]">
                  {companyName}
                </span>
              </div>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className={isCollapsed
              ? "rounded-md p-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
              : "ml-auto rounded-md p-1 text-slate-500 hover:bg-slate-100 cursor-pointer"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className={isCollapsed ? "px-2" : "px-4"}>
        <SidebarMenu className="space-y-1">
          {groupedNavItems.map(({ key, label, icon: Icon, children }) => {
            const isActive = children.some((child) => pathname.startsWith(child.href));
            const isOpen = Boolean(openGroups[key]);

            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  onClick={() => toggleGroup(key)}
                  tooltip={label}
                  isActive={isActive}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-[#17cf91]/10 text-[#17cf91]"
                      : "text-slate-600 hover:bg-slate-50"
                  } ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon size={18} />
                    {!isCollapsed && <span>{label}</span>}
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

      <SidebarFooter className={isCollapsed ? "px-2 pb-4" : "px-4 pb-4"}>
        <SidebarMenu className="pt-2 border-t space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className={`rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Link href="/protected/settings">
                <Settings size={18} />
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className={`rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </UiSidebar>
  );
}
