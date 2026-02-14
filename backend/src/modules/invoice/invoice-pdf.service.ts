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
      doc.fontSize(22).text('Rent-Ease', { align: 'left' });

      doc.fontSize(18).text('INVOICE', { align: 'right' }).moveDown(2);

      /* ---------------- INVOICE INFO ---------------- */
      doc.fontSize(12);
      doc.text(`Invoice No: ${data.invoiceNo}`);
      doc.text(`Status: ${data.status}`);
      doc.text(`Issue Date: ${data.issueDate.toDateString()}`);
      doc.moveDown();

      // Customer
      doc.fontSize(14).text('Bill To:', { underline: true });
      doc.fontSize(12);
      doc.text(data.customer.name);
      if (data.customer.phone) {
        doc.text(`Phone: ${data.customer.phone}`);
      }
      doc.moveDown();

      // Rental Period
      doc.fontSize(14).text('Rental Period:', { underline: true });
      doc
        .fontSize(12)
        .text(
          `${data.rentalPeriod.start.toDateString()} - ${data.rentalPeriod.end.toDateString()}`,
        );
      doc.moveDown(2);

      /* ---------------- TABLE HEADER ---------------- */
      const tableTop = doc.y;
      const colItem = 50;
      const colQty = 350;
      const colPrice = 420;
      const colTotal = 500;

      doc
        .fontSize(12)
        .text('Item', colItem, tableTop, { width: 240 })
        .text('Qty', colQty, tableTop, { width: 40, align: 'right' })
        .text('Unit Price', colPrice, tableTop, { width: 80, align: 'right' })
        .text('Total', colTotal, tableTop, { width: 80, align: 'right' });

      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(600, doc.y).stroke();

      doc.moveDown(0.5);

      /* ---------------- TABLE ROWS ---------------- */
      data.items.forEach((item: any) => {
        const y = doc.y;

        doc
          .fontSize(11)
          .text(item.name, 50, y, { width: 240 }) // Item column
          .text(item.quantity.toString(), 350, y, {
            width: 40,
            align: 'right',
          })
          .text(`Rs ${item.unitPrice.toLocaleString()}`, 420, y, {
            width: 80,
            align: 'right',
          })
          .text(`Rs ${item.total.toLocaleString()}`, 500, y, {
            width: 80,
            align: 'right',
          });

        doc.moveDown();
      });

      doc.moveDown();

      /* ---------------- TOTALS ---------------- */
      doc.moveTo(300, doc.y).lineTo(550, doc.y).stroke();

      doc.moveDown();

      doc.fontSize(12).text(`Subtotal: Rs ${data.totals.subtotal}`, 350, doc.y);

      doc.text(`Tax: Rs (${data.totals.taxRate ?? 0}%): Rs ${data.totals.tax}`, 350, doc.y + 20);

      doc
        .fontSize(14)
        .text(`Grand Total: Rs ${data.totals.grandTotal}`, 350, doc.y + 40);

      doc.moveDown(4);

      /* ---------------- FOOTER ---------------- */
      doc.fontSize(10).text('Thank you for choosing Rent-Ease!', {
        align: 'center',
      });

      doc.end();
    });
  }
}
