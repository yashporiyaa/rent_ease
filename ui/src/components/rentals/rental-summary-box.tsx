import { RentalSummaryBoxProps } from "@/types";
import { IndianRupee } from "lucide-react";

export function RentalSummaryBox({
  selectedItems,
  items,
}: RentalSummaryBoxProps) {
  const total = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  return (
    <div className="bg-[#17cf91]/5 border border-[#17cf91]/20 p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <IndianRupee className="text-[#17cf91]" />
        <h3 className="font-bold text-[#0e1b17]">Total</h3>
      </div>

      <p className="text-2xl font-black text-[#0e1b17]">
        ₹{total}
      </p>
    </div>
  );
}
