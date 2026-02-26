import type { ChangeEvent, ReactNode } from "react";

export type ProviderChildrenProps = {
  children: ReactNode;
};

export type PageWrapperProps = {
  children: ReactNode;
};

export type User = {
  id: string;
  supabaseId: string;
  companyName: string;
  companyLogo?: string | null;
  phone: string;
  email: string;
  businessType: string;
  businessAddress?: string | null;
  taxRate?: number | null;
  stripeCustomerId?: string | null;
  subscriptionStatus?: "ACTIVE" | "EXPIRED" | "CANCELLED" | "TRIAL";
  trialEndsAt?: string | null;
  subscription?: {
    currentPeriodEnd?: string | null;
    status?: "ACTIVE" | "EXPIRED" | "CANCELLED" | "TRIAL";
  } | null;
  invoiceTemplate: string;
  onboardingDone: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
};

export type CreateRentalPayload = {
  customerId: string;
  bookingNo?: string;
  bookingAt: string | Date;
  deliveryAddress: string;
  totalQuantity: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmountValue: number;
  totalAmount: number;
  advanceAmount: number;
  pendingAmount: number;
  depositAmount: number;
  outstandingWithDeposit: number;
  lineItems: {
    itemId: string;
    quantity: number;
    rate: number;
    fromAt: string | Date;
    toAt: string | Date;
    description?: string;
    image?: string;
    discountPercent?: number;
    discountAmount?: number;
    taxPercent?: number;
    taxAmount?: number;
    total: number;
    status?: string;
  }[];
};

export type StatsCardProps = {
  title: string;
  value: number | string;
  trend?: string | null;
  type?: string;
};

export type Item = {
  id: string;
  fullName: string;
  price: number;
  images?: string[];
  description?: string;
};

export type InventoryItem = {
  id: string;
  shortName: string;
  fullName: string;
  description?: string | null;
  category: string;
  categoryId?: string | null;
  size?: string | null;
  sizeId?: string | null;
  price: number;
  entryDate: string;
  quantity: number;
  images: string[];
  stock: number;
};

export type ItemCategory = {
  id: string;
  name: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemSize = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerListItem = {
  id: string;
  name: string;
  phone1?: string | undefined;
  phone2?: string | undefined;
  address?: string | undefined;
};

export type FormInputProps = {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  value?: string;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export type InvoicePayment = {
  id: string;
  amount: number;
  method: string;
  reference?: string | null;
  paidAt: string;
};

export type PaymentsTableProps = {
  payments: InvoicePayment[];
};

export type InvoiceRow = {
  id: string;
  invoiceNo: string;
  customer: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
};

export type RentalSummaryBoxProps = {
  selectedItems: Record<string, number>;
  items: Item[];
};

export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export type RentalStatus = "ACTIVE" | "COMPLETED" | "OVERDUE" | "CANCELLED";

export type RentalItemLine = {
  id: string;
  itemId?: string;
  item: {
    fullName: string;
    images?: string[];
    description?: string | null;
  };
  quantity: number;
  price: number;
  description?: string;
  fromAt?: string;
  toAt?: string;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  totalAmount?: number;
  status?: string;
  image?: string;
};

export type RentalRecord = {
  id: string;
  invoice?: {
    id: string;
  } | null;
  bookingNo?: string | null;
  bookingAt: string;
  customer: {
    name: string;
  };
  rentalItems: RentalItemLine[];
  startDate: string;
  endDate: string;
  totalAmount: number;
  discountAmount?: number;
  discountPercent?: number;
  taxPercent?: number;
  taxAmountValue?: number;
  totalQuantity?: number;
  customerId?: string;
  deliveryAddress?: string | null;
  description?: string | null;
  advanceAmount?: number;
  pendingAmount?: number;
  depositAmount?: number;
  outstandingWithDeposit?: number;
  status: RentalStatus;
};

export type RentalsTableProps = {
  rentals: RentalRecord[];
  onEdit: (rental: RentalRecord) => void;
  onDelete: (rental: RentalRecord) => void;
};

export type DeliveryFilterStatus = "all" | "pending" | "picked";

export type DeliveryItemStatus = "PENDING" | "PICKED";

export type DeliveryFilters = {
  fromDate: string;
  toDate: string;
  categoryId: string;
  status: DeliveryFilterStatus;
};

export type DeliveryRentalItem = {
  id: string;
  fromAt?: string | null;
  toAt?: string | null;
  description?: string | null;
  image?: string | null;
  deliveryStatus: DeliveryItemStatus;
  pickedAt?: string | null;
  item?: {
    fullName: string;
    description?: string | null;
    images?: string[];
    category?: string | null;
    categoryId?: string | null;
  };
  rental: {
    id?: string;
    bookingNo?: string | null;
    depositAmount?: number | null;
    customer: {
      name: string;
    };
  };
};

export type ReturnFilterStatus = "all" | "returned";

export type ReturnItemStatus = "ACTIVE" | "PICKED" | "RETURNED";

export type ReturnFilters = {
  fromDate: string;
  toDate: string;
  categoryId: string;
  status: ReturnFilterStatus;
};

export type ReturnRentalItem = {
  id: string;
  fromAt?: string | null;
  toAt?: string | null;
  description?: string | null;
  image?: string | null;
  status: ReturnItemStatus;
  item?: {
    fullName: string;
    description?: string | null;
    images?: string[];
    category?: string | null;
    categoryId?: string | null;
  };
  rental: {
    bookingNo?: string | null;
    depositAmount?: number | null;
    customer: {
      name: string;
    };
  };
};

export type AvailabilityHistoryRow = {
  id: string;
  bookingNo?: string | null;
  product: string;
  size?: string | null;
  deliveryDate?: string | null;
  bookingDate: string;
  returnDate?: string | null;
  customerName: string;
  quantity: number;
  discount: number;
  status: string;
};

export type ItemAvailabilityResult = {
  itemName: string;
  availableStock: number;
  available: boolean;
  recentRentals: AvailabilityHistoryRow[];
};

export type RentalHeaderProps = {
  rental: RentalRecord;
};

export type RentalSummaryProps = {
  rental: RentalRecord;
};

export type InvoiceDetailStatus = "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";

export type InvoiceDetail = {
  id: string;
  invoiceNo: string;
  totalAmount: number;
  status: InvoiceDetailStatus;
  rental: {
    customer: {
      name: string;
    };
    rentalItems: RentalItemLine[];
  };
  payments: InvoicePayment[];
};

export type InvoiceHeaderProps = {
  invoice: InvoiceDetail;
};

export type InvoiceSummaryProps = {
  invoice: InvoiceDetail;
};

export type RevenueData = {
  month: string;
  revenue: number;
};

export type DashboardUpcomingReturn = {
  id: string;
  asset: string;
  customer: string;
  returnAt: string;
};

export type DashboardRecentActivity = {
  id: string;
  type: "BOOKING" | "RECEIPT" | "PAYOUT" | "PICKED" | "RETURNED";
  title: string;
  subtitle: string;
  happenedAt: string;
};

export type RentalLine = {
  id: string;
  itemId: string;
  productName: string;
  image?: string;
  description?: string;
  fromAt: string;
  toAt: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  status: string;
};

export type CustomerModalState = {
  name: string;
  phone1: string;
  phone2: string;
  address: string;
};

export type RentalFormState = {
  customerId: string;
  bookingNo: string;
  bookingAt: string;
  deliveryAddress: string;
};

export type RentalLineFormState = {
  itemId: string;
  lineDescription: string;
  fromAt: string;
  toAt: string;
  quantity: string;
  rate: string;
  taxPercent: string;
  editingLineId: string | null;
};

export type RentalSummaryState = {
  globalDiscountPercent: string;
  globalDiscountAmount: string;
  advanceAmount: string;
  depositAmount: string;
};

export type CustomerModalUiState = {
  open: boolean;
  form: CustomerModalState;
  foundCustomer: CustomerListItem | null;
  isEditingCustomer: boolean;
  submittingCustomer: boolean;
};

export type ReceiptPaymentMode = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER";

export type ReceiptListFilters = {
  fromDate?: string;
  toDate?: string;
};

export type ReceiptCustomerOption = {
  id: string;
  name: string;
  pendingTotal: number;
};

export type ReceiptPendingRental = {
  id: string;
  bookingNo?: string | null;
  bookingAt: string;
  totalAmount: number;
  pendingAmount: number;
};

export type ReceiptDraftLine = {
  rentalId: string;
  description: string;
  receivedAmount: string;
};

export type ReceiptPayload = {
  customerId: string;
  entryDate: string;
  paymentMode: ReceiptPaymentMode;
  discountAmount: number;
  lineItems: {
    rentalId: string;
    description?: string;
    receivedAmount: number;
  }[];
};

export type ReceiptLineRecord = {
  id: string;
  description?: string | null;
  receivedAmount: number;
  discountAmount: number;
  rental: {
    id: string;
    bookingNo?: string | null;
    bookingAt: string;
    totalAmount: number;
    pendingAmount: number;
  };
};

export type ReceiptRecord = {
  id: string;
  entryDate: string;
  paymentMode: ReceiptPaymentMode;
  discountAmount: number;
  totalReceived: number;
  customer: {
    id: string;
    name: string;
  };
  lineItems: ReceiptLineRecord[];
};

export type RentalPaymentMode = "CASH" | "UPI" | "CARD" | "BANK_TRANSFER";

export type RentalPaymentListFilters = {
  fromDate?: string;
  toDate?: string;
};

export type RentalPaymentCustomerOption = {
  id: string;
  name: string;
  pendingTotal: number;
};

export type RentalPaymentPendingRental = {
  id: string;
  bookingNo?: string | null;
  bookingAt: string;
  totalAmount: number;
  depositAmount: number;
};

export type RentalPaymentPayload = {
  customerId: string;
  entryDate: string;
  paymentMode: RentalPaymentMode;
  discountAmount: number;
  lineItems: {
    rentalId: string;
    description?: string;
    paidAmount: number;
  }[];
};

export type RentalPaymentLineRecord = {
  id: string;
  description?: string | null;
  paidAmount: number;
  discountAmount: number;
  rental: {
    id: string;
    bookingNo?: string | null;
    bookingAt: string;
    totalAmount: number;
    depositAmount: number;
  };
};

export type RentalPaymentRecord = {
  id: string;
  entryDate: string;
  paymentMode: RentalPaymentMode;
  discountAmount: number;
  totalPaid: number;
  customer: {
    id: string;
    name: string;
  };
  lineItems: RentalPaymentLineRecord[];
};

export type ProfileForm = {
  companyName: string;
  phone: string;
  businessType: string;
  businessAddress: string;
  taxRate: number;
  invoiceTemplate: string;
};
