import { cn } from "../../lib/utils";
import { StatsCardProps } from "../../types";
import { BarChart3 } from "lucide-react";

export function StatsCard({
  title,
  value,
  trend,
  type = "neutral",
}: StatsCardProps) {
  const trendColor =
    type === "success"
      ? "text-emerald-600 bg-emerald-50"
      : type === "danger"
        ? "text-red-600 bg-red-100"
        : "text-slate-500 bg-slate-100";

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-[#17cf91]/10 text-[#17cf91]">
          <BarChart3 className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              trendColor,
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-[#0e1b17] mt-1">{value}</h3>
    </div>
  );
}
