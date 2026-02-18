import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    taxRate: number | null,
    taxAmount: number,
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
          taxRate,
          totalAmount,
          taxAmount, // later GST
          status: InvoiceStatus.PENDING,
        },
      });

      return { rental, invoice };
    });
  }

  async assertItemsAvailable(dto: CreateRentalDto) {
    for (const requestedItem of dto.items) {
      const item = await this.prisma.item.findUnique({
        where: { id: requestedItem.itemId },
      });

      if (!item) {
        throw new NotFoundException('Item not found');
      }

      const overlappingRentals = await this.prisma.rentalItem.findMany({
        where: {
          itemId: requestedItem.itemId,
          rental: {
            status: 'ACTIVE',
            startDate: { lte: new Date(dto.endDate) },
            endDate: { gte: new Date(dto.startDate) },
          },
        },
        include: {
          rental: true,
        },
      });

      const alreadyBooked = overlappingRentals.reduce(
        (sum, ri) => sum + ri.quantity,
        0,
      );

      const availableStock = item.stock - alreadyBooked;

      if (requestedItem.quantity > availableStock) {
        throw new BadRequestException(
          `${item.name} has only ${availableStock} available for selected dates`,
        );
      }
    }
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

  async findByIdAndUser(rentalId: string, userId: string) {
    return await this.prisma.rental.findFirst({
      where: {
        id: rentalId,
        userId,
      },
    });
  }

  async markAsReturned(rentalId: string) {
    return await this.prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: 'COMPLETED',
        returnedAt: new Date(),
      },
    });
  }

  async findOverdueByUser(userId: string) {
    return await this.prisma.rental.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: {
          lt: new Date(),
        },
      },
      include: {
        customer: {
          select: { name: true },
        },
      },
      orderBy: {
        endDate: 'asc',
      },
    });
  }

  async findCalendarBookings(userId: string, start: Date, end: Date) {
    return this.prisma.rental.findMany({
      where: {
        userId,
        status: {
          not: 'COMPLETED',
        },
        startDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        invoice: {
          select: {
            invoiceNo: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }
}
