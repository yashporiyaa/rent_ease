"use client";

import { useEffect, useState } from "react";
import { InvoiceHeader } from "@/components/invoices/invoice-header";
import { InvoiceItemsTable } from "@/components/invoices/invoice-items-table";
import { InvoiceSummary } from "@/components/invoices/invoice-summary";
import { AddPaymentModal } from "./add-payment-modal";
import { PaymentsTable } from "./payments-table";

export default function InvoiceDetailsInfo({
  invoiceId,
}: {
  invoiceId: string;
}) {
  console.log(invoiceId);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/invoice/${invoiceId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setInvoice(data.data))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) return <p>Invoice not found</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <InvoiceHeader invoice={invoice} />
      <InvoiceItemsTable items={invoice.rental.rentalItems} />
      <InvoiceSummary invoice={invoice} />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#0e1b17]">Payment Details</h2>
        <AddPaymentModal
          invoiceId={invoice.id}
          onSuccess={() => {
            fetch(`http://localhost:3001/invoices/${invoiceId}`, {
              credentials: "include",
            })
              .then((res) => res.json())
              .then((data) => setInvoice(data.data));
          }}
        />
      </div>

      <PaymentsTable payments={invoice.payments} />
    </div>
  );
}
