import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';

@Controller('payments')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePaymentDto) {
    return this.service.create(req.user.sub, dto);
  }
}
