import { Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.UserRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const customer = await this.CustomerRepository.create({
      userId: user.id,
      name: dto.name,
      phone: dto.phone,
    });

    return customer;
  }

  async getAll(supabaseId: string) {
    const user = await this.UserRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customers = await this.CustomerRepository.findByUserId(user.id);

    return {
      success: true,
      data: customers,
    };
  }
}
