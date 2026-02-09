import Link from "next/link";
import { Eye, User } from "lucide-react";

export function CustomersTable({
  customers,
}: {
  customers: { id: string; name: string; phone?: string }[];
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Customers
        </h1>
        <p className="text-slate-500 mt-1">
          Manage all your rental customers.
        </p>
      </div>

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
                  href={`/customers/${customer.id}`}
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
