import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  getInvoice(@Req() req: any, @Param('id') id: string) {
    return this.invoiceService.getById(req.user.sub, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  getAll(@Req() req: any) {
    return this.invoiceService.getAll(req.user.sub);
  }
}
