import { User } from "lucide-react";
import { customers } from "@/lib/mock/customers";

export function CustomerSelect({
  value,
  onChange,
  customers,
}: {
  value: string;
  onChange: (id: string) => void;
  customers: { id: string; name: string }[];
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#0e1b17] mb-2 block">
        Customer
      </label>

      <div className="relative">
        <User className="absolute left-3 top-3 text-slate-400" size={18} />
        <select
          className="w-full pl-10 pr-4 py-3 border rounded-xl"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
