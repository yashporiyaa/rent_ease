import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Invoice } from '@prisma/client';

@Injectable()
export class InvoicePdfService {
  generateInvoicePdf(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).text('Rent-Ease', { align: 'left' });

      doc.fontSize(18).text('INVOICE', { align: 'right' }).moveDown();

      doc.moveDown();

      // Invoice Info
      doc.fontSize(12);
      doc.text(`Invoice No: ${data.invoiceNo}`);
      doc.text(`Status: ${data.status}`);
      doc.text(`Issue Date: ${data.issueDate.toDateString()}`);
      doc.moveDown();

      // Customer
      doc.fontSize(14).text('Bill To:', { underline: true });
      doc.fontSize(12);
      doc.text(data.customer.name);
      doc.text(`Phone: ${data.customer.phone}`);
      doc.moveDown();

      // Rental Period
      doc.fontSize(14).text('Rental Period:', { underline: true });
      doc
        .fontSize(12)
        .text(
          `${data.rentalPeriod.start.toDateString()} - ${data.rentalPeriod.end.toDateString()}`,
        );
      doc.moveDown();

      // Items Table Header
      doc.moveDown();
      doc.fontSize(12).text('Items:', { underline: true });
      doc.moveDown();

      data.items.forEach((item: any) => {
        doc.text(
          `${item.name} | Qty: ${item.quantity} | ₹${item.unitPrice} | Total: ₹${item.total}`,
        );
      });

      doc.moveDown();

      // Totals
      doc.text(`Subtotal: ₹${data.totals.subtotal}`, {
        align: 'right',
      });
      doc.text(`Tax: ₹${data.totals.tax}`, {
        align: 'right',
      });
      doc.fontSize(14).text(`Grand Total: ₹${data.totals.grandTotal}`, {
        align: 'right',
      });

      doc.moveDown(2);

      doc.fontSize(10).text('Thank you for choosing Rent-Ease!', {
        align: 'center',
      });

      doc.end();
    });
  }
}
