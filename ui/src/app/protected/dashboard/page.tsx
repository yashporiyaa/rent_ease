"use client";

import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingReturns } from "@/components/dashboard/upcoming-returns";
import { getUserDashboardData } from "@/lib/api/user";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchUserDashboardData = async () => {
      const res = await getUserDashboardData();
      setStats(res.data);
    };
    fetchUserDashboardData();
  }, []);

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
          <QuickActions />
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
    </>
  );
}
