import { FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RentalsEmptyState({ onClick }: { onClick: () => void }) {
  return (
    <div className="bg-white p-10 rounded-xl border text-center">
      <FilePlus size={40} className="mx-auto text-[#17cf91] mb-4" />
      <h2 className="text-xl font-bold text-[#0e1b17]">
        No rentals yet
      </h2>
      <p className="text-slate-500 mt-2">
        Create your first rental to start earning.
      </p>

      <Button
        onClick={onClick}
        className="mt-6 rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        variant="brand"
      >
        Create Rental
      </Button>
    </div>
  );
}
