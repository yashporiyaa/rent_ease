import { recentActivities } from "@/lib/mock/dashboard";

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b flex justify-between">
        <h2 className="text-lg font-bold text-[#0e1b17]">
          Recent Activity
        </h2>
        <button className="text-[#17cf91] font-bold text-sm">
          View All
        </button>
      </div>

      <div className="divide-y">
        {recentActivities.map((item) => (
          <div key={item.id} className="p-6 hover:bg-slate-50">
            <p className="text-sm font-medium text-[#0e1b17]">
              {item.message}
            </p>
            <p className="text-xs text-slate-500 mt-1">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
