import { Module } from '@nestjs/common';
import { RentalPaymentController } from './rental-payment.controller.js';
import { RentalPaymentService } from './rental-payment.service.js';
import { UserRepository } from '../user/user.repository.js';

@Module({
  controllers: [RentalPaymentController],
  providers: [RentalPaymentService, UserRepository],
})
export class RentalPaymentModule {}
