import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, InvoiceTemplate } from '@prisma/client';
import { UserRepository } from '../user/user.repository.js';
import { InvoiceRepository } from './invoice.repository.js';
import { InvoicePdfService } from './invoice-pdf.service.js';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoicePdfService: InvoicePdfService,
  ) {}

  async getById(supabaseId: string, invoiceId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const invoice = await this.invoiceRepository.findById(user.id, invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      success: true,
      data: {
        ...invoice,
        status: this.resolveInvoiceStatus(invoice),
      },
    };
  }

  async getAll(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const invoices = await this.invoiceRepository.findAllByUserId(user.id);

    return {
      success: true,
      data: invoices.map((inv) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        customer: inv.rental.customer.name,
        amount: inv.totalAmount,
        status: this.resolveInvoiceStatus(inv),
        createdAt: inv.createdAt,
      })),
    };
  }

  async downloadInvoice(supabaseId: string, invoiceId: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const invoice = await this.invoiceRepository.findByIdWithRelations(
      user.id,
      invoiceId,
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const structured = this.buildInvoiceView(invoice);
    return this.invoicePdfService.generateInvoicePdf(
      structured,
      user.invoiceTemplate ?? InvoiceTemplate.CLASSIC,
    );
  }

  private buildInvoiceView(invoice: any) {
    const subtotal = invoice.totalAmount;
    const tax = invoice.taxAmount ?? 0;
    const taxRate = invoice.taxRate ?? 0;
    const grandTotal = subtotal + tax;
    const amountPaidFromPayments = (invoice.payments ?? []).reduce(
      (sum: number, payment: any) => sum + (payment.amount ?? 0),
      0,
    );
    const rentalPending = Number(invoice.rental?.pendingAmount ?? NaN);
    const outstanding = Number.isFinite(rentalPending)
      ? Math.max(rentalPending, 0)
      : Math.max(grandTotal - amountPaidFromPayments, 0);
    const amountPaid = Math.max(grandTotal - outstanding, 0);

    return {
      invoiceNo: invoice.invoiceNo,
      status: this.resolveInvoiceStatus(invoice),
      issueDate: invoice.createdAt,
      customer: {
        name: invoice.rental.customer.name,
        phone: invoice.rental.customer.phone,
      },
      rentalPeriod: {
        start: invoice.rental.startDate,
        end: invoice.rental.endDate,
      },
      items: invoice.rental.rentalItems.map((ri) => ({
        name: ri.item.fullName,
        quantity: ri.quantity,
        unitPrice: ri.price,
        total: ri.quantity * ri.price,
      })),
      totals: {
        subtotal,
        tax,
        taxRate,
        grandTotal,
        amountPaid,
        outstanding,
      },
    };
  }

  private resolveInvoiceStatus(invoice: any): InvoiceStatus {
    const pending = Math.max(Number(invoice?.rental?.pendingAmount ?? 0), 0);
    const total = Math.max(Number(invoice?.totalAmount ?? 0), 0);

    if (pending <= 0) {
      return InvoiceStatus.PAID;
    }
    if (pending < total) {
      return InvoiceStatus.PARTIAL;
    }
    return InvoiceStatus.PENDING;
  }
}
