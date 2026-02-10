import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import { generateInvoiceNo } from '../../common/utils/invoice.util.js';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class RentalRepository {
  constructor(private prisma: PrismaService) {}

  async createRentalWithInvoice(
    userId: string,
    dto: CreateRentalDto,
    totalAmount: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const rental = await tx.rental.create({
        data: {
          userId,
          customerId: dto.customerId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          totalAmount,
          rentalItems: {
            create: dto.items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          userId,
          rentalId: rental.id,
          invoiceNo: generateInvoiceNo(),
          totalAmount,
          taxAmount: null, // later GST
          status: InvoiceStatus.PENDING,
        },
      });

      return { rental, invoice };
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.rental.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true },
        },
        rentalItems: true,
      },
    });
  }

  async findById(userId: string, rentalId: string) {
    const rental = await this.prisma.rental.findFirst({
      where: {
        id: rentalId,
        userId,
      },
      include: {
        customer: {
          select: { name: true },
        },
        rentalItems: {
          include: {
            item: {
              select: { name: true },
            },
          },
        },
      },
    });
    return rental;
  }
}
