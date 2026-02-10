import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller.js';
import { InvoiceService } from './invoice.service.js';
import { UserModule } from '../user/user.module.js';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
  imports: [UserModule],
})
export class InvoiceModule {}
