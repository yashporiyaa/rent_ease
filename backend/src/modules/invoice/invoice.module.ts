import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller.js';
import { InvoiceService } from './invoice.service.js';
import { UserModule } from '../user/user.module.js';
import { InvoiceRepository } from './invoice.repository.js';
import { InvoicePdfService } from './invoice-pdf.service.js';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoiceRepository, InvoicePdfService],
  imports: [UserModule],
})
export class InvoiceModule {}
