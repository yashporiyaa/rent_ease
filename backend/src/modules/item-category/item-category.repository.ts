import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ItemCategoryRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: string; name: string; imageUrl?: string }) {
    return this.prisma.itemCategory.create({ data });
  }

  async findByUserId(userId: string) {
    return this.prisma.itemCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.itemCategory.findFirst({ where: { id, userId } });
  }

  async updateById(id: string, data: { name?: string; imageUrl?: string }) {
    return this.prisma.itemCategory.update({
      where: { id },
      data,
    });
  }

  async removeById(id: string) {
    return this.prisma.itemCategory.delete({ where: { id } });
  }

  async countItemsByCategoryId(categoryId: string) {
    return this.prisma.item.count({
      where: { categoryId },
    });
  }
}
