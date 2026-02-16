import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string, invoiceId: string) {
    return this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        rental: {
          include: {
            customer: { select: { name: true } },
            rentalItems: {
              include: {
                item: { select: { name: true } },
              },
            },
          },
        },
        payments: true,
      },
    });
  }

  async findAllByUserId(userId: string) {
    return this.prisma.invoice.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        rental: {
          include: {
            customer: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async findByIdWithRelations(userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        rental: {
          include: {
            customer: true,
            rentalItems: {
              include: {
                item: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    return invoice;
  }
}
