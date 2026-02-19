import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

type ItemAvailability = {
  id: string;
  name: string;
  fullName: string;
  price: number;
  stock: number;
  available: number;
  images: string[];
  description: string | null;
};

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

  async findByUserId(userId: string) {
    return await this.prisma.item.findMany({
      where: { userId },
      orderBy: { fullName: 'asc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.item.findFirst({
      where: { id, userId },
    });
  }

  async updateById(id: string, data: Prisma.ItemUncheckedUpdateInput) {
    return this.prisma.item.update({
      where: { id },
      data,
    });
  }

  async deleteById(id: string) {
    return this.prisma.item.delete({
      where: { id },
    });
  }

  async countRentalItems(itemId: string) {
    return this.prisma.rentalItem.count({
      where: { itemId },
    });
  }

  async getAvailabilityByUserId(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    const items = await this.prisma.item.findMany({
      where: { userId },
    });

    const result: ItemAvailability[] = [];

    for (const item of items) {
      const overlapping = await this.prisma.rentalItem.findMany({
        where: {
          itemId: item.id,
          rental: {
            status: 'ACTIVE',
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        },
      });

      const booked = overlapping.reduce((sum, ri) => sum + ri.quantity, 0);
      result.push({
        id: item.id,
        name: item.fullName,
        fullName: item.fullName,
        price: item.price,
        stock: item.stock,
        available: item.stock - booked,
        images: item.images,
        description: item.description,
      });
    }

    return result;
  }
}
