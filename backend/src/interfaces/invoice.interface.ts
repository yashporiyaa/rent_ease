import { InvoiceStatus } from '@prisma/client';

export interface ClassicInvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ClassicInvoicePdfData {
  invoiceNo: string;
  status: InvoiceStatus;
  issueDate: Date;
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    logo?: string | null;
  };
  customer: {
    name: string;
    phone?: string | null;
  };
  rentalPeriod: {
    start: Date;
    end: Date;
  };
  items: ClassicInvoiceItem[];
  totals: {
    subtotal: number;
    discount?: number;
    tax: number;
    taxRate: number;
    grandTotal: number;
    advance?: number;
    deposit?: number;
    outstanding?: number;
  };
}
