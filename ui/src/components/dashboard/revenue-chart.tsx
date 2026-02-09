export function RevenueChart() {
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#0e1b17]">
            Revenue Analytics
          </h2>
          <p className="text-slate-500 text-sm">
            Monthly performance compared to last year
          </p>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded-lg">
            7D
          </button>
          <button className="px-3 py-1.5 text-xs font-bold text-white bg-[#17cf91] rounded-lg">
            30D
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded-lg">
            1Y
          </button>
        </div>
      </div>

      <div className="h-75 flex items-center justify-center text-slate-400">
        📈 Revenue chart placeholder
      </div>
    </div>
  );
}
