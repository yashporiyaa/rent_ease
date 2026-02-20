import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import {
  generateBookingNo,
  generateInvoiceNo,
} from '../../common/utils/invoice.util.js';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class RentalRepository {
  constructor(private prisma: PrismaService) {}

  private async getAvailability(
    userId: string,
    itemId: string,
    fromAt: string,
    toAt: string,
    excludeRentalId?: string,
  ) {
    const item = await this.prisma.item.findFirst({
      where: { id: itemId, userId },
      select: { id: true, fullName: true, stock: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const overlappingRentals = await this.prisma.rentalItem.findMany({
      where: {
        itemId,
        rental: {
          userId,
          status: 'ACTIVE',
          ...(excludeRentalId ? { id: { not: excludeRentalId } } : {}),
          startDate: { lte: new Date(toAt) },
          endDate: { gte: new Date(fromAt) },
        },
      },
      select: { quantity: true },
    });

    const alreadyBooked = overlappingRentals.reduce(
      (sum, ri) => sum + ri.quantity,
      0,
    );
    const availableStock = item.stock - alreadyBooked;

    return { itemName: item.fullName, availableStock };
  }

  private async resolveBookingNo(bookingNo?: string) {
    const provided = bookingNo?.trim();

    if (provided) {
      const existing = await this.prisma.rental.findUnique({
        where: { bookingNo: provided },
        select: { id: true },
      });
      if (existing) {
        throw new BadRequestException('Booking number already exists');
      }
      return provided;
    }

    for (let index = 0; index < 5; index++) {
      const candidate = generateBookingNo();
      const existing = await this.prisma.rental.findUnique({
        where: { bookingNo: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
    }

    throw new BadRequestException(
      'Unable to generate unique booking number. Please try again.',
    );
  }

  async createRentalWithInvoice(
    userId: string,
    dto: CreateRentalDto,
    taxRate: number | null,
  ) {
    const bookingNo = await this.resolveBookingNo(dto.bookingNo);

    const sortedFromDates = dto.lineItems
      .map((item) => new Date(item.fromAt))
      .sort((a, b) => a.getTime() - b.getTime());
    const sortedToDates = dto.lineItems
      .map((item) => new Date(item.toAt))
      .sort((a, b) => a.getTime() - b.getTime());

    const startDate = sortedFromDates[0] ?? new Date(dto.bookingAt);
    const endDate =
      sortedToDates[sortedToDates.length - 1] ?? new Date(dto.bookingAt);

    return this.prisma.$transaction(async (tx) => {
      const rental = await tx.rental.create({
        data: {
          userId,
          bookingNo,
          customerId: dto.customerId,
          bookingAt: new Date(dto.bookingAt),
          startDate,
          endDate,
          totalAmount: dto.totalAmount,
          deliveryAddress: dto.deliveryAddress,
          totalQuantity: dto.totalQuantity,
          discountPercent: dto.discountPercent,
          discountAmount: dto.discountAmount,
          taxPercent: dto.taxPercent,
          taxAmountValue: dto.taxAmountValue,
          advanceAmount: dto.advanceAmount,
          pendingAmount: dto.pendingAmount,
          depositAmount: dto.depositAmount,
          outstandingWithDeposit: dto.outstandingWithDeposit,
          rentalItems: {
            create: dto.lineItems.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.rate,
              fromAt: new Date(item.fromAt),
              toAt: new Date(item.toAt),
              description: item.description,
              image: item.image,
              discountPercent: item.discountPercent ?? 0,
              discountAmount: item.discountAmount ?? 0,
              taxPercent: item.taxPercent ?? 0,
              taxAmount: item.taxAmount ?? 0,
              totalAmount: item.total,
              status: item.status ?? 'ACTIVE',
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
          totalAmount: dto.totalAmount,
          taxAmount: dto.taxAmountValue,
          status: InvoiceStatus.PENDING,
        },
      });

      return { rental, invoice };
    });
  }

  async updateRentalWithInvoice(
    rentalId: string,
    userId: string,
    dto: CreateRentalDto,
    taxRate: number | null,
  ) {
    const bookingNo = dto.bookingNo?.trim();
    if (bookingNo) {
      const existing = await this.prisma.rental.findFirst({
        where: {
          bookingNo,
          id: { not: rentalId },
        },
        select: { id: true },
      });
      if (existing) {
        throw new BadRequestException('Booking number already exists');
      }
    }

    const sortedFromDates = dto.lineItems
      .map((item) => new Date(item.fromAt))
      .sort((a, b) => a.getTime() - b.getTime());
    const sortedToDates = dto.lineItems
      .map((item) => new Date(item.toAt))
      .sort((a, b) => a.getTime() - b.getTime());

    const startDate = sortedFromDates[0] ?? new Date(dto.bookingAt);
    const endDate =
      sortedToDates[sortedToDates.length - 1] ?? new Date(dto.bookingAt);

    return this.prisma.$transaction(async (tx) => {
      const rental = await tx.rental.update({
        where: { id: rentalId },
        data: {
          customerId: dto.customerId,
          ...(bookingNo ? { bookingNo } : {}),
          bookingAt: new Date(dto.bookingAt),
          startDate,
          endDate,
          totalAmount: dto.totalAmount,
          deliveryAddress: dto.deliveryAddress,
          totalQuantity: dto.totalQuantity,
          discountPercent: dto.discountPercent,
          discountAmount: dto.discountAmount,
          taxPercent: dto.taxPercent,
          taxAmountValue: dto.taxAmountValue,
          advanceAmount: dto.advanceAmount,
          pendingAmount: dto.pendingAmount,
          depositAmount: dto.depositAmount,
          outstandingWithDeposit: dto.outstandingWithDeposit,
          rentalItems: {
            deleteMany: {},
            create: dto.lineItems.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.rate,
              fromAt: new Date(item.fromAt),
              toAt: new Date(item.toAt),
              description: item.description,
              image: item.image,
              discountPercent: item.discountPercent ?? 0,
              discountAmount: item.discountAmount ?? 0,
              taxPercent: item.taxPercent ?? 0,
              taxAmount: item.taxAmount ?? 0,
              totalAmount: item.total,
              status: item.status ?? 'ACTIVE',
            })),
          },
        },
      });

      await tx.invoice.updateMany({
        where: { rentalId, userId },
        data: {
          totalAmount: dto.totalAmount,
          taxAmount: dto.taxAmountValue,
          taxRate,
        },
      });

      return rental;
    });
  }

  async assertItemsAvailable(
    userId: string,
    dto: CreateRentalDto,
    excludeRentalId?: string,
  ) {
    for (const requestedItem of dto.lineItems) {
      const { itemName, availableStock } = await this.getAvailability(
        userId,
        requestedItem.itemId,
        requestedItem.fromAt,
        requestedItem.toAt,
        excludeRentalId,
      );

      if (requestedItem.quantity > availableStock) {
        throw new BadRequestException(
          `${itemName} has only ${availableStock} available for selected dates`,
        );
      }
    }
  }

  async checkItemAvailability(
    userId: string,
    itemId: string,
    quantity: number,
    fromAt: string,
    toAt: string,
    excludeRentalId?: string,
  ) {
    const { itemName, availableStock } = await this.getAvailability(
      userId,
      itemId,
      fromAt,
      toAt,
      excludeRentalId,
    );

    return {
      itemName,
      availableStock,
      available: quantity <= availableStock,
    };
  }

  async findByUserId(userId: string) {
    return await this.prisma.rental.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true },
        },
        rentalItems: {
          include: {
            item: {
              select: { fullName: true, description: true, images: true },
            },
          },
        },
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
              select: { fullName: true, description: true, images: true },
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

  async deleteById(userId: string, rentalId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { rentalId, userId },
        select: { id: true },
      });

      if (invoice) {
        await tx.payment.deleteMany({
          where: { invoiceId: invoice.id, userId },
        });
        await tx.invoice.delete({
          where: { id: invoice.id },
        });
      }

      await tx.rentalItem.deleteMany({
        where: { rentalId },
      });

      await tx.rental.delete({
        where: { id: rentalId },
      });
    });
  }
}
