import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  async create(supabaseId: string, dto: CreateCustomerDto) {
    try {
      const customer = this.prisma.customer.create({
        data: {
          name: dto.name,

          user: {
            connect: {
              supabaseId,
            },
          },
        },
      });

      return customer;
    } catch (error) {
      console.log(error.message);
    }
  }
}
