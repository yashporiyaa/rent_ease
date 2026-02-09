import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingReturns } from "@/components/dashboard/upcoming-returns";
import { dashboardStats } from "@/lib/mock/dashboard";

export default function DashboardPage() {
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
