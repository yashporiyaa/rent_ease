import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import type {
  AuthenticatedRequest,
  StripeWebhookRequest,
} from 'src/types/authenticated-request.js';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('create-checkout-session')
  async createCheckout(@Req() req: AuthenticatedRequest) {
    return this.stripeService.createCheckoutSession(req.user.sub);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: StripeWebhookRequest) {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    return this.stripeService.handleWebhook(
      signature,
      req.rawBody,
    );
  }
}
