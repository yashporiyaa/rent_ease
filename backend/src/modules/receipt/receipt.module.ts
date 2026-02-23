import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller.js';
import { ReceiptService } from './receipt.service.js';
import { UserRepository } from '../user/user.repository.js';

@Module({
  controllers: [ReceiptController],
  providers: [ReceiptService, UserRepository],
})
export class ReceiptModule {}
