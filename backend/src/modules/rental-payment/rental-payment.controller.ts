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
import { RentalPaymentService } from './rental-payment.service.js';
import { RentalPaymentListQueryDto } from './dto/rental-payment-list-query.dto.js';
import { RentalPaymentCustomerQueryDto } from './dto/rental-payment-customer-query.dto.js';
import { CreateRentalPaymentDto } from './dto/create-rental-payment.dto.js';

@Controller('rental-payments')
export class RentalPaymentController {
  constructor(private readonly rentalPaymentService: RentalPaymentService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  getAll(@Req() req: any, @Query() query: RentalPaymentListQueryDto) {
    return this.rentalPaymentService.getAll(req.user.sub, query);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('customers')
  getCustomers(@Req() req: any, @Query() query: RentalPaymentCustomerQueryDto) {
    return this.rentalPaymentService.searchCustomersWithDepositPending(
      req.user.sub,
      query.search,
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('customers/:customerId/pending-rentals')
  getPendingRentals(
    @Req() req: any,
    @Param('customerId') customerId: string,
  ) {
    return this.rentalPaymentService.getPendingRentals(req.user.sub, customerId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateRentalPaymentDto) {
    return this.rentalPaymentService.create(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':rentalPaymentId')
  update(
    @Req() req: any,
    @Param('rentalPaymentId') rentalPaymentId: string,
    @Body() dto: CreateRentalPaymentDto,
  ) {
    return this.rentalPaymentService.update(req.user.sub, rentalPaymentId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':rentalPaymentId')
  remove(@Req() req: any, @Param('rentalPaymentId') rentalPaymentId: string) {
    return this.rentalPaymentService.remove(req.user.sub, rentalPaymentId);
  }
}
