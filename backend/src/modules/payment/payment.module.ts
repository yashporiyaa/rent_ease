import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { UserRepository } from '../user/user.repository.js';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, UserRepository],
})
export class PaymentModule {}
