import { rentalDetails } from "@/lib/mock/rental-details";
import { RentalHeader } from "@/components/rentals/rental-header";
import { RentalSummary } from "@/components/rentals/rental-summary";
import { RentalItemsTable } from "@/components/rentals/rental-items-table";
import { RentalInvoicePlaceholder } from "@/components/rentals/rental-invoice-placeholder";

export default function RentalDetailsPage() {
  return (
    <>
      <RentalHeader
        rentalId={rentalDetails.id}
        status={rentalDetails.status as any}
      />

      <RentalSummary
        customer={rentalDetails.customer.name}
        startDate={rentalDetails.startDate}
        endDate={rentalDetails.endDate}
        totalAmount={rentalDetails.totalAmount}
      />

      <RentalItemsTable items={rentalDetails.items} />

      <RentalInvoicePlaceholder />
    </>
  );
}
