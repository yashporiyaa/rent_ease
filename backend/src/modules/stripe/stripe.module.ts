import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller.js';
import { StripeService } from './stripe.service.js';
import { StripeRepository } from './stripe.repository.js';
import { UserRepository } from '../user/user.repository.js';

@Module({
  controllers: [StripeController],
  providers: [StripeService, StripeRepository, UserRepository],
  exports: [StripeService],
})
export class StripeModule {}
