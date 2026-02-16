"use client";

import { CreateRentalForm } from "@/components/rentals/create-rental-form";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingReturns } from "@/components/dashboard/upcoming-returns";
import { getCustomers } from "@/lib/api/customers";
import { getUserDashboardData } from "@/lib/api/user";
import { CustomerListItem } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type DashboardStats = {
  activeRentals: number;
  overdueRentals: number;
  totalRevenue: number;
  pendingInvoices: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formCustomers, setFormCustomers] = useState<CustomerListItem[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const fetchUserDashboardData = useCallback(async () => {
    try {
      const res = await getUserDashboardData();
      setStats(res.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch dashboard data";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    void fetchUserDashboardData();
  }, [fetchUserDashboardData]);

  useEffect(() => {
    if (!isCreateOpen) return;

    const fetchFormData = async () => {
      setFormLoading(true);
      try {
        const customersRes = await getCustomers();
        setFormCustomers(customersRes.data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load rental form data";
        toast.error(message);
      } finally {
        setFormLoading(false);
      }
    };

    void fetchFormData();
  }, [isCreateOpen]);

  if (!stats) return null;
  
  const dashboardStats = [
    {
      id: 1,
      title: "Active Rentals",
      value: stats.activeRentals,
      trend: null,
      type: "neutral",
    },
    {
      id: 2,
      title: "Overdue Rentals",
      value: stats.overdueRentals,
      trend: null,
      type: stats.overdueRentals > 0 ? "danger" : "success",
    },
    {
      id: 3,
      title: "Total Revenue",
      value: `₹${stats.totalRevenue}`,
      trend: null,
      type: "success",
    },
    {
      id: 4,
      title: "Pending Invoices",
      value: stats.pendingInvoices,
      trend: null,
      type: stats.pendingInvoices > 0 ? "danger" : "neutral",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat) => (
          <StatsCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
        <div className="col-span-12 lg:col-span-8">
          <RevenueChart />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <QuickActions onCreateRental={() => setIsCreateOpen(true)} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7">
          <RecentActivity />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <UpcomingReturns />
        </div>
      </div>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto"
          onClick={() => setIsCreateOpen(false)}
        >
          <div className="min-h-full flex items-center justify-center">
            <div
              className="w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {formLoading ? (
                <div className="bg-white rounded-xl border shadow-sm p-10 flex justify-center">
                  <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <CreateRentalForm
                  customers={formCustomers}
                  onClose={() => setIsCreateOpen(false)}
                  onSuccess={async () => {
                    setIsCreateOpen(false);
                    await fetchUserDashboardData();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
