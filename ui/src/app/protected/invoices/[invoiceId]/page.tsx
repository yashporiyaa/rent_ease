import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InvoiceDetailsInfo from "@/components/invoices/invoice-details";
import { Button } from "@/components/ui/button";

export default async function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return (
    <div className="space-y-6">
      <Button
        asChild
        variant="ghost"
        className="justify-start text-[#0e1b17] hover:text-[#0e1b17]"
      >
        <Link href="/protected/invoices">
          <ArrowLeft />
          Back to invoices
        </Link>
      </Button>
      <InvoiceDetailsInfo invoiceId={invoiceId} />
    </div>
  );
}
