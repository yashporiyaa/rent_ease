"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { API_URL } from "@/lib/api/config";

const ranges = [
  { label: "12 Months", value: "1y" },
  { label: "30 Days", value: "30d" },
  { label: "7 Days", value: "7d" },
];

type RevenuePoint = { label: string; revenue: number };

export function RevenueChart() {
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [range, setRange] = useState("1y");

  useEffect(() => {
    fetch(`${API_URL}/users/revenue-analytics?range=${range}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setData(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setData([]));
  }, [range]);

  const chart = useMemo(() => {
    const width = 860;
    const height = 340;
    const paddingX = 26;
    const paddingY = 24;

    if (data.length === 0) {
      return {
        linePath: "",
        areaPath: "",
        points: [] as { x: number; y: number; label: string }[],
        width,
        height,
      };
    }

    const max = Math.max(...data.map((d) => d.revenue), 1);
    const stepX = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;

    const points = data.map((item, index) => {
      const x = paddingX + stepX * index;
      const normalized = item.revenue / max;
      const y = height - paddingY - normalized * (height - paddingY * 2);
      return { x, y, label: item.label };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
      .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return { linePath, areaPath, points, width, height };
  }, [data]);

  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#0f172a] max-sm:text-xl">Revenue Performance</h2>
          <p className="mt-1 text-base text-[#64748b]">
            Overview of income across all locations
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-[#f1f5f9] p-1">
          {ranges.map((r) => (
            <Button
              key={r.value}
              onClick={() => setRange(r.value)}
              variant="ghost"
              className={cn(
                "h-9 rounded-lg px-3 text-xs font-bold text-[#475569] cursor-pointer",
                range === r.value && "bg-white text-[#0f172a] shadow-sm",
              )}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-2xl bg-[#f8fafc] text-sm font-semibold text-[#64748b]">
          No revenue data available.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-[360px] rounded-2xl bg-linear-to-b from-[#f8fffc] to-[#f8fafc] px-2 py-2">
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-full w-full" role="img" aria-label="Revenue chart">
              <defs>
                <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d={chart.areaPath} fill="url(#revenueArea)" />
              <path d={chart.linePath} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
              {chart.points.filter((_, i) => i % Math.max(1, Math.floor(chart.points.length / 5)) === 0).map((point) => (
                <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
              ))}
            </svg>
          </div>

          <div
            className="grid text-center text-xs font-bold tracking-[0.12em] text-[#94a3b8]"
            style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
          >
            {data.map((item, index) => (
              <span key={`${item.label}-${index}`}>{item.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
