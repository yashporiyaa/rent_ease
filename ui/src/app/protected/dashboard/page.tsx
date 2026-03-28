"use client";

import { RecentActivity } from "../../../components/dashboard/recent-activity";
import { RevenueChart } from "../../../components/dashboard/revenue-chart";
import { UpcomingReturns } from "../../../components/dashboard/upcoming-returns";
import {
  getRecentActivity,
  getUpcomingReturns,
  getUserDashboardData,
} from "../../../lib/api/user";
import { DashboardRecentActivity, DashboardUpcomingReturn } from "../../../types";
import { FileText, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

type DashboardStats = {
  activeRentals: number;
  overdueRentals: number;
  totalRevenue: number;
  pendingInvoices: number;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingReturns, setUpcomingReturns] = useState<DashboardUpcomingReturn[]>([]);
  const [recentActivity, setRecentActivity] = useState<DashboardRecentActivity[]>([]);

  const fetchUserDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResult, upcomingReturnsResult, recentActivityResult] = await Promise.allSettled([
        getUserDashboardData(),
        getUpcomingReturns(),
        getRecentActivity(),
      ]);

      if (statsResult.status === "rejected") {
        throw statsResult.reason;
      }

      setStats(statsResult.value.data);
      setUpcomingReturns(
        upcomingReturnsResult.status === "fulfilled"
          ? (upcomingReturnsResult.value.data ?? [])
          : [],
      );
      setRecentActivity(
        recentActivityResult.status === "fulfilled"
          ? (recentActivityResult.value.data ?? [])
          : [],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch dashboard data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUserDashboardData();
  }, [fetchUserDashboardData]);

  const calendarDays = useMemo(() => {
    const base = new Date();
    const start = new Date(base);
    start.setDate(base.getDate() - 2);

    return Array.from({ length: 7 }, (_, index) => {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + index);
      return dayDate;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 rounded-full border-4 border-[#17cf91] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Active Rentals",
      value: stats.activeRentals.toLocaleString(),
      helper: "UP 12.5%",
      helperColor: "text-emerald-600",
      accent: "bg-emerald-500",
    },
    {
      title: "Overdue Rentals",
      value: stats.overdueRentals.toLocaleString(),
      helper: stats.overdueRentals > 0 ? "ATTENTION REQUIRED" : "All clear",
      helperColor: stats.overdueRentals > 0 ? "text-red-600" : "text-emerald-600",
      accent: stats.overdueRentals > 0 ? "bg-red-500" : "bg-emerald-500",
    },
    {
      title: "Total Revenue",
      value: currency.format(stats.totalRevenue),
      helper: "UP 8.2%",
      helperColor: "text-emerald-600",
      accent: "bg-emerald-500",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices.toLocaleString(),
      helper: `${Math.max(stats.pendingInvoices, 0).toLocaleString()} open`,
      helperColor: "text-slate-500",
      accent: "bg-slate-300",
    },
  ];

  return (
    <div className="space-y-6 pb-2">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white px-6 py-6 shadow-[0_12px_24px_rgba(15,23,42,0.04)] sm:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-black leading-tight text-[#0f172a] max-sm:text-2xl">
              Good morning, Alex
            </h1>
            <p className="mt-2 text-base text-[#64748b] max-sm:text-sm">
              Here&apos;s what&apos;s happening with your rentals today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/protected/finance/receipts"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d8e1ec] bg-white px-4 text-sm font-bold text-[#1e293b] transition hover:bg-[#f8fafc]"
            >
              <FileText className="h-4 w-4" />
              Quick Receipt
            </Link>
            <Link
              href="/protected/finance/payments"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d8e1ec] bg-white px-4 text-sm font-bold text-[#1e293b] transition hover:bg-[#f8fafc]"
            >
              <Wallet className="h-4 w-4" />
              Record Payment
            </Link>
            <Link
              href="/protected/rentals"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#10b981] px-4 text-sm font-bold text-white transition hover:bg-[#0fa371]"
            >
              <Plus className="h-4 w-4" />
              Create New Rental
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-[#475569]">{card.title}</p>
                <span className={`h-2.5 w-2.5 rounded-full ${card.accent}`} />
              </div>
              <p className="mt-4 text-4xl font-black leading-none text-[#0f172a] max-sm:text-3xl">
                {card.value}
              </p>
              <p className={`mt-3 text-xs font-bold tracking-wide ${card.helperColor}`}>
                {card.helper}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <RevenueChart />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <RecentActivity activities={recentActivity} />
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <UpcomingReturns upcomingReturns={upcomingReturns} />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-[#0f172a] max-sm:text-xl">Return Overview</h3>
              <span className="text-xs font-bold tracking-[0.12em] text-[#94a3b8]">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="text-xs font-bold text-[#94a3b8]">
                  {day}
                </div>
              ))}
              {calendarDays.map((day) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={day.toISOString()}
                    className={`rounded-lg py-2 text-sm font-bold ${
                      isToday
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : "bg-[#f8fafc] text-[#475569]"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                );
              })}
            </div>

            <p className="mt-6 rounded-xl bg-[#f8fafc] px-4 py-3 text-center text-sm font-semibold text-[#64748b]">
              {upcomingReturns.length} items due in next 7 days
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
