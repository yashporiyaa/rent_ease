import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { StripeService } from "./stripe.service.js";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard.js";

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post('create-checkout-session')
  async createCheckout(@Req() req: any) {
    // console.log(req.user);
    return this.stripeService.createCheckoutSession(req.user.sub);
  }

  @Post('webhook')
  async handleWebhook(@Req() req: any) {
    return this.stripeService.handleWebhook(
      req.headers['stripe-signature'],
      req.rawBody,
    );
  }
}
