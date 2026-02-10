import Link from "next/link";
import { Eye, User } from "lucide-react";

export function CustomersTable({
  customers,
}: {
  customers: { id: string; name: string; phone?: string }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Phone</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="hover:bg-slate-50 transition"
            >
              <td className="px-6 py-4 font-medium text-[#0e1b17] flex items-center gap-2">
                <User size={16} className="text-[#17cf91]" />
                {customer.name}
              </td>

              <td className="px-6 py-4 text-slate-600">
                {customer.phone || "-"}
              </td>

              <td className="px-6 py-4 text-right">
                <Link
                  href={`/protected/customers/${customer.id}`}
                  className="inline-flex items-center gap-2 text-[#17cf91] font-bold hover:underline"
                >
                  <Eye size={16} />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
