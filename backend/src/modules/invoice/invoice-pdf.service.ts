import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { generateClassicTemplate } from './templates/classic.template.js';
import type { ClassicInvoicePdfData } from 'src/interfaces/invoice.interface.js';

@Injectable()
export class InvoicePdfService {
  generateInvoicePdf(data: ClassicInvoicePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      generateClassicTemplate(doc, data);

      doc.end();
    });
  }
}
