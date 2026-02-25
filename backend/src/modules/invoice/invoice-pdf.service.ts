import { Injectable } from '@nestjs/common';
import { InvoiceTemplate } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { generateClassicTemplate } from './templates/classic.template.js';
import type { ClassicInvoicePdfData } from 'src/interfaces/invoice.interface.js';

@Injectable()
export class InvoicePdfService {
  generateInvoicePdf(
    data: ClassicInvoicePdfData,
    template: InvoiceTemplate = InvoiceTemplate.CLASSIC,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      // if (template === InvoiceTemplate.MINIMAL) {
      //   generateMinimalTemplate(doc, data);
      // } else 
        if (template === InvoiceTemplate.CLASSIC) {
        generateClassicTemplate(doc, data);
      } else {
        // Fallback until dedicated CLASSIC/MODERN templates are implemented.
        generateClassicTemplate(doc, data);
      }

      doc.end();
    });
  }
}
