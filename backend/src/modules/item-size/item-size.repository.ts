import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ItemSizeRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { userId: string; name: string }) {
    return this.prisma.itemSize.create({ data });
  }

  async findByUserId(userId: string) {
    return this.prisma.itemSize.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.itemSize.findFirst({ where: { id, userId } });
  }

  async updateById(id: string, data: { name?: string }) {
    return this.prisma.itemSize.update({ where: { id }, data });
  }

  async removeById(id: string) {
    return this.prisma.itemSize.delete({ where: { id } });
  }

  async countItemsBySizeId(sizeId: string) {
    return this.prisma.item.count({ where: { sizeId } });
  }

  async updateItemSizeLabels(sizeId: string, sizeName: string) {
    return this.prisma.item.updateMany({
      where: { sizeId },
      data: { size: sizeName },
    });
  }
}
