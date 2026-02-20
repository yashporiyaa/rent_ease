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
  phone: string;
  email: string;
  businessType: string;
  businessAddress?: string | null;
  taxRate?: number | null;
  stripeCustomerId?: string | null;
  subscriptionStatus?: "ACTIVE" | "EXPIRED" | "CANCELLED" | "TRIAL";
  trialEndsAt?: string | Date | null;
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
