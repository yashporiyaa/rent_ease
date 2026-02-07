import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UserRepository } from '../user/user.repository.js';
import { CustomerRepository } from './customer.repository.js';

@Injectable()
export class CustomerService {
  constructor(
    private CustomerRepository: CustomerRepository,
    private UserRepository: UserRepository,
  ) {}

  async createCustomer(supabaseId: string, dto: CreateCustomerDto) {
    const customer = await this.CustomerRepository.create(supabaseId, dto);
    // Update onboarding step
    const user = await this.UserRepository.updateUser(supabaseId, {
      onboardingStep: 3,
    });

    return customer;
  }
}
