"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const ranges = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "1Y", value: "1y" },
];

export function RevenueChart() {
  const [data, setData] = useState<{ label: string; revenue: number }[]>([]);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    fetch(`http://localhost:3001/users/revenue-analytics?range=${range}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, [range]);
  const max = Math.max(...data.map((d) => d.revenue), 1);
  
  return (
    <div className="bg-white p-8 rounded-xl border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-[#0e1b17] mb-6">
          Revenue Analytics
        </h2>

        <div className="flex gap-2">
          {ranges.map((r) => (
            <Button
              key={r.value}
              onClick={() => setRange(r.value)}
              variant="brand"
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer",
                range === r.value
                  ? "bg-[#17cf91] text-white"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div
        className="grid items-end h-48 gap-1"
        style={{
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
        }}
      >
        {data.map((item) => (
          <div key={item.label} className="flex flex-col h-full group relative">
            {/* Chart Area */}
            <div className="flex-1 flex items-end">
              <div
                className="w-full rounded-t-md bg-linear-to-t from-[#17cf91] to-[#17cf91]/40 transition-all duration-700 ease-out"
                style={{
                  height: `${max > 0 ? (item.revenue / max) * 100 : 0}%`,
                }}
              />
            </div>

            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-xs bg-[#0e1b17] text-white px-2 py-1 rounded-md whitespace-nowrap">
              ₹{item.revenue}
            </div>

            {/* Label */}
            <div className="h-6 flex items-center justify-center">
              <p className="text-[10px] text-slate-500 truncate">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
