import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) { }

  create(data: {
    userId: string;
    name: string;
    phone1?: string;
    phone2?: string;
    address?: string;
  }) {
    try {
      const customer = this.prisma.customer.create({
        data: {
          ...data,
          phone: data.phone1,
        },
      });

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

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.customer.findFirst({
      where: { id, userId },
    });
  }

  async findByPhone(userId: string, phone: string) {
    return this.prisma.customer.findFirst({
      where: {
        userId,
        OR: [{ phone1: phone }, { phone2: phone }, { phone }],
      },
    });
  }

  async updateById(id: string, data: {
    name?: string;
    phone1?: string;
    phone2?: string;
    address?: string;
  }) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...data,
        phone: data.phone1,
      },
    });
  }
}
