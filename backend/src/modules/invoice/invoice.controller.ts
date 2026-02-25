import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import type { Response } from 'express';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  getInvoice(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): ReturnType<InvoiceService['getById']> {
    return this.invoiceService.getById(req.user.sub, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  getAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ): ReturnType<InvoiceService['getAll']> {
    return this.invoiceService.getAll(req.user.sub, query);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id/pdf')
  async downloadPdf(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
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
