import { DashboardUpcomingReturn } from "../../types";
import Link from "next/link";
import { Camera, Laptop, Smartphone } from "lucide-react";

type UpcomingReturnsProps = {
  upcomingReturns: DashboardUpcomingReturn[];
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getIcon = (asset: string) => {
  const name = asset.toLowerCase();
  if (name.includes("iphone") || name.includes("phone")) return Smartphone;
  if (name.includes("camera") || name.includes("canon") || name.includes("sony")) return Camera;
  return Laptop;
};

export function UpcomingReturns({ upcomingReturns }: UpcomingReturnsProps) {
  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#0f172a] max-sm:text-xl">Upcoming Returns</h2>
        <Link href="/protected/rentals/return" className="text-sm font-bold text-[#10b981] hover:text-[#0d9f70]">
          View All
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {upcomingReturns.length === 0 ? (
          <p className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 text-sm font-medium text-[#64748b]">
            No upcoming returns in the next 7 days.
          </p>
        ) : (
          upcomingReturns.map((item) => {
            const Icon = getIcon(item.asset);
            return (
              <article
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e2e8f0] text-[#475569]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-bold text-[#0f172a] max-sm:text-sm">{item.asset}</p>
                    <p className="text-sm text-[#64748b]">Rented by: {item.customer}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-[#ea580c]">{formatDate(item.returnAt)}</p>
                  <p className="text-xs font-bold text-[#64748b]">{formatTime(item.returnAt)}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
