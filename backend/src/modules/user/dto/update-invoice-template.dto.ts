import { InvoiceTemplate } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateInvoiceTemplateDto {
  @IsEnum(InvoiceTemplate)
  invoiceTemplate: InvoiceTemplate;
}
