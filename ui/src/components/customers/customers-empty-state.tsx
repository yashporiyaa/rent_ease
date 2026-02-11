import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomersEmptyState() {
  return (
    <div className="bg-white p-10 rounded-xl border shadow-sm text-center">
      <UserPlus className="mx-auto text-[#17cf91] mb-4" size={40} />
      <h2 className="text-xl font-bold text-[#0e1b17]">No customers yet</h2>
      <p className="text-slate-500 mt-2">
        Add your first customer to start creating rentals.
      </p>

      <Link href="/protected/customers/new">
        <Button
          className="mt-6 rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
          variant="brand"
        >
          Add Customer
        </Button>
      </Link>
    </div>
  );
}
