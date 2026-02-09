import { upcomingReturns } from "@/lib/mock/dashboard";

export function UpcomingReturns() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-[#0e1b17]">
          Upcoming Returns
        </h2>
        <span className="text-xs font-bold bg-[#17cf91]/10 text-[#17cf91] px-2 py-1 rounded-lg">
          Next 7 Days
        </span>
      </div>

      <div className="p-6 space-y-4">
        {upcomingReturns.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-slate-50 p-4 rounded-xl"
          >
            <div>
              <p className="font-bold text-sm">{item.asset}</p>
              <p className="text-xs text-slate-500">{item.customer}</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold">{item.date}</p>
              <p className="text-[10px] text-slate-500">{item.time}</p>
            </div>
          </div>
        ))}

        <button className="w-full mt-4 py-3 text-sm font-bold border rounded-xl hover:bg-slate-50">
          View Full Calendar
        </button>
      </div>
    </div>
  );
}
