import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ItemsEmptyState() {
  return (
    <div className="bg-white p-10 rounded-xl border text-center">
      <PackagePlus size={40} className="mx-auto text-[#17cf91] mb-4" />
      <h2 className="text-xl font-bold text-[#0e1b17]">
        No items yet
      </h2>
      <p className="text-slate-500 mt-2">
        Add inventory items to start renting.
      </p>

      <Link href="/items/new">
        <Button className="mt-6 rounded-full bg-[#17cf91] text-[#0e1b17] font-bold">
          Add Item
        </Button>
      </Link>
    </div>
  );
}
