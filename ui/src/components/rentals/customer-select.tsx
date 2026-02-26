import { User } from "lucide-react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
      <Label className="text-sm font-semibold text-[#0e1b17] mb-2 block">
        Customer
      </Label>

      <div className="relative">
        <User className="absolute left-3 top-3 text-slate-400" size={18} />
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger className="w-full h-12 pl-10 pr-3 rounded-xl border">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent className="rounded-xl p-1">
          {customers.map((c) => (
              <SelectItem key={c.id} value={c.id} className="py-2 px-3">
              {c.name}
              </SelectItem>
          ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
