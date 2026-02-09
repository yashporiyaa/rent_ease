import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) { }

  create(data: { userId: string; name: string; phone?: string }) {
    try {
      const customer = this.prisma.customer.create({ data });

      return customer;
    } catch (error) {
      console.log(error.message);
    }
  }

  async findByUserId(userId: string) {
    return await this.prisma.customer.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }
}
