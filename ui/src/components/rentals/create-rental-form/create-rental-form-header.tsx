import { ReceiptText, X } from "lucide-react";
import { Button } from "../../ui/button";

type CreateRentalFormHeaderProps = {
  isEditMode: boolean;
  onClose?: () => void;
};

export function CreateRentalFormHeader({
  isEditMode,
  onClose,
}: CreateRentalFormHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <ReceiptText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {isEditMode ? "Update Rental" : "Create New Rental"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "Update your rental agreement details"
              : "Generate a new rental agreement for your client"}
          </p>
        </div>
      </div>
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
          <X className="h-5 w-5 text-slate-500" />
        </Button>
      )}
    </div>
  );
}
