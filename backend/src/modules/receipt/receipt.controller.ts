import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { ReceiptService } from './receipt.service.js';
import { ReceiptListQueryDto } from './dto/receipt-list-query.dto.js';
import { ReceiptCustomerQueryDto } from './dto/receipt-customer-query.dto.js';
import { CreateReceiptDto } from './dto/create-receipt.dto.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  getAll(@Req() req: AuthenticatedRequest, @Query() query: ReceiptListQueryDto) {
    return this.receiptService.getAll(req.user.sub, query);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('customers')
  getCustomers(
    @Req() req: AuthenticatedRequest,
    @Query() query: ReceiptCustomerQueryDto,
  ) {
    return this.receiptService.searchCustomersWithPending(req.user.sub, query.search);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('customers/:customerId/pending-rentals')
  getPendingRentals(
    @Req() req: AuthenticatedRequest,
    @Param('customerId') customerId: string,
  ) {
    return this.receiptService.getPendingRentals(req.user.sub, customerId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateReceiptDto) {
    return this.receiptService.create(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':receiptId')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('receiptId') receiptId: string,
    @Body() dto: CreateReceiptDto,
  ) {
    return this.receiptService.update(req.user.sub, receiptId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':receiptId')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('receiptId') receiptId: string,
  ) {
    return this.receiptService.remove(req.user.sub, receiptId);
  }
}
