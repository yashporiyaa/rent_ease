import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';
import { CustomerRepository } from './customer.repository.js';
import { UserRepository } from '../user/user.repository.js';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository, UserRepository],
})
export class CustomerModule {}
