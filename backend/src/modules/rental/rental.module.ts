import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { RentalService } from './rental.service.js';
import { RentalController } from './rental.controller.js';
import { RentalRepository } from './rental.repository.js';

@Module({
  providers: [RentalService, RentalRepository],
  controllers: [RentalController],
  imports: [UserModule],
})
export class RentalModule {}
