import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ItemRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      const item = await this.prisma.item.create({
        data: {
          ...data,
          price: Number(data.price),
        },
      });
      return item;
    } catch (error) {
      console.log(error.message);
    }
  }
}
