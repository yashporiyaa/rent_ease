import { DashboardRecentActivity } from "../../types";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  PackageCheck,
  Plus,
} from "lucide-react";

type RecentActivityProps = {
  activities: DashboardRecentActivity[];
};

const toRelativeTime = (value: string) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "JUST NOW";
  }

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (minutes < 60) return `${minutes} MINS AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} HOURS AGO`;
  const days = Math.floor(hours / 24);
  return `${days} DAYS AGO`;
};

const ACTIVITY_STYLES: Partial<
  Record<
    DashboardRecentActivity["type"],
    { icon: typeof Check; iconClass: string }
  >
> = {
  BOOKING: {
    icon: Plus,
    iconClass: "text-[#2563eb] bg-[#dbeafe]",
  },
  RECEIPT: {
    icon: ArrowDownToLine,
    iconClass: "text-[#16a34a] bg-[#dcfce7]",
  },
  PAYOUT: {
    icon: ArrowUpFromLine,
    iconClass: "text-[#f97316] bg-[#ffedd5]",
  },
  PICKED: {
    icon: PackageCheck,
    iconClass: "text-[#7c3aed] bg-[#ede9fe]",
  },
};

const defaultActivityStyle = {
  icon: Check,
  iconClass: "text-[#0f766e] bg-[#ccfbf1]",
};

const getActivityStyle = (type: DashboardRecentActivity["type"]) =>
  ACTIVITY_STYLES[type] ?? defaultActivityStyle;

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h2 className="text-2xl font-black text-[#0f172a] max-sm:text-xl">Recent Activity</h2>

      <div className="mt-6 space-y-5">
        {activities.length === 0 ? (
          <p className="rounded-xl bg-[#f8fafc] p-4 text-sm font-medium text-[#64748b]">
            No recent activity yet.
          </p>
        ) : (
          activities.map((item) => {
            const style = getActivityStyle(item.type);
            const Icon = style.icon;

            return (
              <div key={item.id} className="flex gap-4">
                <span
                  className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${style.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-bold text-[#0f172a] max-sm:text-sm">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-[#64748b]">{item.subtitle}</p>
                  <p className="mt-1 text-xs font-bold text-[#94a3b8]">
                    {toRelativeTime(item.happenedAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
