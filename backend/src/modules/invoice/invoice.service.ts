import { Injectable, NotFoundException } from '@nestjs/common';
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
      data: invoice,
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
        status: inv.status,
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
    return this.invoicePdfService.generateInvoicePdf(structured);
  }

  private buildInvoiceView(invoice: any) {
    return {
      invoiceNo: invoice.invoiceNo,
      status: invoice.status,
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
        name: ri.item.name,
        quantity: ri.quantity,
        unitPrice: ri.price,
        total: ri.quantity * ri.price,
      })),
      totals: {
        subtotal: invoice.totalAmount,
        tax: invoice.taxAmount ?? 0,
        grandTotal: invoice.totalAmount + (invoice.taxAmount ?? 0),
      },
    };
  }
}
