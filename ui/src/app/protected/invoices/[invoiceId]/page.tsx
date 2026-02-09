import { invoiceDetails } from "@/lib/mock/invoice-details";
import { InvoiceItemsTable } from "@/components/invoices/invoice-items-table";
import { InvoiceSummary } from "@/components/invoices/invoice-summary";
import { InvoicePaymentsPlaceholder } from "@/components/invoices/invoice-payments-placeholder";
import { InvoiceHeader } from "@/components/invoices/invoice-header";

export default function InvoiceDetailsPage() {
  return (
    <>
      <InvoiceHeader
        invoiceId={invoiceDetails.id}
        status={invoiceDetails.status as any}
      />

      <InvoiceSummary
        customer={invoiceDetails.customer.name}
        issueDate={invoiceDetails.issueDate}
        dueDate={invoiceDetails.dueDate}
        amount={invoiceDetails.totalAmount}
      />

      <InvoiceItemsTable items={invoiceDetails.items} />

      <InvoicePaymentsPlaceholder />
    </>
  );
}
