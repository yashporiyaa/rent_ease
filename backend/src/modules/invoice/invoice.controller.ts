import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import type { Response } from 'express';

@Controller('invoices')
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

  @UseGuards(SupabaseAuthGuard)
  @Get(':id/pdf')
  async downloadPdf(
    @Req() req: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pdfBuffer = await this.invoiceService.downloadInvoice(
      req.user.sub,
      id,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${id}.pdf`,
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.end(pdfBuffer);
  }
}
