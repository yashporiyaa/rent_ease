import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RentalDetailsInfo from "@/components/rentals/rental-details";
import { Button } from "@/components/ui/button";

export default async function RentalDetailsPage({
  params,
}: {
  params: Promise<{ rentalId: string }>;
}) {
  const { rentalId } = await params;

  return (
    <div className="space-y-6">
      <Button
        asChild
        variant="ghost"
        className="justify-start text-[#0e1b17] hover:text-[#0e1b17]"
      >
        <Link href="/protected/rentals">
          <ArrowLeft />
          Back to rentals
        </Link>
      </Button>
      <RentalDetailsInfo rentalId={rentalId} />
    </div>
  );
}
