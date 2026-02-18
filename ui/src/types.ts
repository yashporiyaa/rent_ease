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
  onboardingStep: number;
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
  startDate: string | Date;
  endDate: string | Date;
  items: {
    itemId: string;
    quantity: number;
    price: number;
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
  name: string;
  price: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price: number;
};

export type CustomerListItem = {
  id: string;
  name: string;
  phone?: string | undefined;
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
  item: {
    name: string;
  };
  quantity: number;
  price: number;
};

export type RentalRecord = {
  id: string;
  customer: {
    name: string;
  };
  rentalItems: RentalItemLine[];
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: RentalStatus;
};

export type RentalsTableProps = {
  rentals: RentalRecord[];
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
