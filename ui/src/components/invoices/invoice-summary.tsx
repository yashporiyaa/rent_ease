export function InvoiceSummary({ invoice }: { invoice: any }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between">
      <div>
        <p className="text-slate-500 text-sm">Total Items</p>
        <p className="text-xl font-bold">
          {invoice.rental.rentalItems.length}
        </p>
      </div>

      <div className="text-right">
        <p className="text-slate-500 text-sm">Total Amount</p>
        <p className="text-xl font-black text-[#17cf91]">
          ₹{invoice.totalAmount}
        </p>
      </div>
    </div>
  );
}
