import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UserRepository } from '../user/user.repository.js';
import { CustomerRepository } from './customer.repository.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

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
      phone1: dto.phone1,
      phone2: dto.phone2,
      address: dto.address,
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

  async findByPhone(supabaseId: string, phone: string) {
    const user = await this.UserRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const customer = await this.CustomerRepository.findByPhone(user.id, phone);

    return {
      success: true,
      data: customer,
    };
  }

  async updateCustomer(supabaseId: string, id: string, dto: UpdateCustomerDto) {
    const user = await this.UserRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.CustomerRepository.findByIdAndUserId(id, user.id);
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    const customer = await this.CustomerRepository.updateById(id, dto);

    return {
      success: true,
      data: customer,
    };
  }
}
