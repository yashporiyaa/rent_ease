import { createPortal } from "react-dom";
import type { Dispatch, SetStateAction } from "react";
import { Pencil, Search, UserRoundPlus, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import type { CustomerModalUiState } from "../../../types";

type CreateRentalCustomerModalProps = {
  isOpen: boolean;
  customerModal: CustomerModalUiState;
  hasMatchedCustomer: boolean;
  setCustomerModal: Dispatch<SetStateAction<CustomerModalUiState>>;
  handlePhoneLookup: () => Promise<void>;
  upsertCustomer: (stayOpen: boolean) => Promise<void>;
};

export function CreateRentalCustomerModal({
  isOpen,
  customerModal,
  hasMatchedCustomer,
  setCustomerModal,
  handlePhoneLookup,
  upsertCustomer,
}: CreateRentalCustomerModalProps) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-80 bg-slate-900/55 p-4 backdrop-blur-[1px]"
      onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <UserRoundPlus className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Add / Select Customer</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
                className="cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </Button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <div>
                <Label className="mb-1 block text-sm font-semibold text-slate-700">
                  Search existing customer (phone)
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
                    placeholder="Type phone and press Enter"
                    value={customerModal.form.phone1 ?? ""}
                    onChange={(event) =>
                      setCustomerModal((prev) => ({
                        ...prev,
                        form: { ...prev.form, phone1: event.target.value },
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handlePhoneLookup();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-slate-700">
                    Customer Full Name
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                    placeholder="e.g. Michael Thompson"
                    value={customerModal.form.name ?? ""}
                    onChange={(event) =>
                      setCustomerModal((prev) => ({
                        ...prev,
                        form: { ...prev.form, name: event.target.value },
                      }))
                    }
                    readOnly={hasMatchedCustomer && !customerModal.isEditingCustomer}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-slate-700">
                    Secondary Phone
                  </Label>
                  <Input
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                    placeholder="(555) 000-0000"
                    value={customerModal.form.phone2 ?? ""}
                    onChange={(event) =>
                      setCustomerModal((prev) => ({
                        ...prev,
                        form: { ...prev.form, phone2: event.target.value },
                      }))
                    }
                    readOnly={hasMatchedCustomer && !customerModal.isEditingCustomer}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1 block text-sm font-semibold text-slate-700">
                  Physical Address
                </Label>
                <Input
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  placeholder="Street, City, State..."
                  value={customerModal.form.address ?? ""}
                  onChange={(event) =>
                    setCustomerModal((prev) => ({
                      ...prev,
                      form: { ...prev.form, address: event.target.value },
                    }))
                  }
                  readOnly={hasMatchedCustomer && !customerModal.isEditingCustomer}
                />
              </div>

              {customerModal.foundCustomer && hasMatchedCustomer && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Existing customer found
                  </div>
                  <div className="w-full overflow-x-auto">
                    <Table className="min-w-175">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="px-4 py-2 text-left">Name</TableHead>
                          <TableHead className="px-4 py-2 text-left">Phone 1</TableHead>
                          <TableHead className="px-4 py-2 text-left">Phone 2</TableHead>
                          <TableHead className="px-4 py-2 text-left">Address</TableHead>
                          <TableHead className="px-4 py-2 text-right">Edit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="px-4 py-2">
                            {customerModal.foundCustomer.name}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {customerModal.foundCustomer.phone1 || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {customerModal.foundCustomer.phone2 || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-2">
                            {customerModal.foundCustomer.address || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-right">
                            <Button
                              variant="outline"
                              size="icon-sm"
                              type="button"
                              onClick={() =>
                                setCustomerModal((prev) => ({
                                  ...prev,
                                  isEditingCustomer: true,
                                }))
                              }
                              className="cursor-pointer border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <Button
                variant="ghost"
                onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
                disabled={customerModal.submittingCustomer}
                className="w-full cursor-pointer rounded-xl sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => void upsertCustomer(true)}
                disabled={customerModal.submittingCustomer}
                className="w-full cursor-pointer rounded-xl border-emerald-200 bg-emerald-100/60 text-emerald-700 hover:bg-emerald-100 sm:w-auto"
              >
                Save New
              </Button>
              <Button
                variant="brand"
                onClick={() => void upsertCustomer(false)}
                disabled={customerModal.submittingCustomer}
                className="w-full cursor-pointer rounded-xl bg-[#17cf91] text-white sm:w-auto"
              >
                {customerModal.foundCustomer && customerModal.isEditingCustomer
                  ? "Update & Select"
                  : "Save & Select"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
