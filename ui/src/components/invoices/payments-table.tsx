import { CreditCard } from "lucide-react";

type Payment = {
  id: string;
  amount: number;
  method: string;
  reference?: string | null;
  paidAt: string;
};

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border text-slate-500">
        No payments recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-[#0e1b17]">
          Payments
        </h2>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left">Date</th>
            <th className="px-6 py-4 text-left">Method</th>
            <th className="px-6 py-4 text-left">Reference</th>
            <th className="px-6 py-4 text-right">Amount</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="px-6 py-4">
                {new Date(p.paidAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 flex items-center gap-2">
                <CreditCard size={14} className="text-[#17cf91]" />
                {p.method}
              </td>
              <td className="px-6 py-4 text-slate-600">
                {p.reference || "—"}
              </td>
              <td className="px-6 py-4 text-right font-bold">
                ₹{p.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
