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
import {
  InvoiceStatus,
  Prisma,
  RentalDeliveryStatus,
} from '@prisma/client';
import { DeliveryQueryDto } from './dto/delivery-query.dto.js';
import { ReturnQueryDto } from './dto/return-query.dto.js';

@Injectable()
export class RentalRepository {
  constructor(private prisma: PrismaService) {}

  private getDateRange(fromDate?: string, toDate?: string) {
    const gte = fromDate ? new Date(`${fromDate}T00:00:00.000`) : undefined;
    const lte = toDate ? new Date(`${toDate}T23:59:59.999`) : undefined;

    return { gte, lte };
  }

  private async delay(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isSerializableConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    );
  }

  private async runSerializableTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.prisma.$transaction(callback, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (error) {
        if (!this.isSerializableConflict(error) || attempt === maxAttempts) {
          throw error;
        }

        await this.delay(30 * attempt);
      }
    }

    throw new BadRequestException('Failed to complete rental transaction');
  }

  private resolveInvoiceStatusFromPending(
    pendingAmount: number,
    totalAmount: number,
  ): InvoiceStatus {
    const pending = Math.max(Number(pendingAmount ?? 0), 0);
    const total = Math.max(Number(totalAmount ?? 0), 0);

    if (pending <= 0) {
      return InvoiceStatus.PAID;
    }
    if (pending < total) {
      return InvoiceStatus.PARTIAL;
    }
    return InvoiceStatus.PENDING;
  }

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

  private async getAvailabilityInTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    itemId: string,
    fromAt: string,
    toAt: string,
    excludeRentalId?: string,
  ) {
    const item = await tx.item.findFirst({
      where: { id: itemId, userId },
      select: { id: true, fullName: true, stock: true },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const overlappingRentals = await tx.rentalItem.findMany({
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

  private async assertItemsAvailableInTransaction(
    tx: Prisma.TransactionClient,
    userId: string,
    dto: CreateRentalDto,
    excludeRentalId?: string,
  ) {
    const uniqueItemIds = [...new Set(dto.lineItems.map((item) => item.itemId))].sort();

    for (const itemId of uniqueItemIds) {
      const itemRows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM "Item"
        WHERE id = ${itemId}
          AND "userId" = ${userId}
        FOR UPDATE
      `;

      if (itemRows.length === 0) {
        throw new NotFoundException('Item not found');
      }
    }

    for (const requestedItem of dto.lineItems) {
      const { itemName, availableStock } = await this.getAvailabilityInTransaction(
        tx,
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

    return this.runSerializableTransaction(async (tx) => {
      await this.assertItemsAvailableInTransaction(tx, userId, dto);

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
          status: this.resolveInvoiceStatusFromPending(
            dto.pendingAmount,
            dto.totalAmount,
          ),
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

    return this.runSerializableTransaction(async (tx) => {
      await this.assertItemsAvailableInTransaction(tx, userId, dto, rentalId);

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
          status: this.resolveInvoiceStatusFromPending(
            dto.pendingAmount,
            dto.totalAmount,
          ),
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
    sizeId?: string,
  ) {
    if (sizeId) {
      const selectedItem = await this.prisma.item.findFirst({
        where: {
          id: itemId,
          userId,
        },
        select: {
          sizeId: true,
        },
      });

      if (!selectedItem) {
        throw new NotFoundException('Item not found');
      }

      if ((selectedItem.sizeId ?? null) !== sizeId) {
        throw new BadRequestException('Selected product does not match size');
      }
    }

    const { itemName, availableStock } = await this.getAvailability(
      userId,
      itemId,
      fromAt,
      toAt,
      excludeRentalId,
    );

    const recentRentals = await this.prisma.rentalItem.findMany({
      where: {
        itemId,
        rental: {
          userId,
        },
      },
      select: {
        id: true,
        fromAt: true,
        toAt: true,
        quantity: true,
        discountAmount: true,
        status: true,
        item: {
          select: {
            fullName: true,
            size: true,
          },
        },
        rental: {
          select: {
            bookingNo: true,
            bookingAt: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        rental: {
          bookingAt: 'desc',
        },
      },
      take: 10,
    });

    return {
      itemName,
      availableStock,
      available: quantity <= availableStock,
      recentRentals: recentRentals.map((row) => ({
        id: row.id,
        bookingNo: row.rental.bookingNo,
        product: row.item.fullName,
        size: row.item.size,
        deliveryDate: row.fromAt,
        bookingDate: row.rental.bookingAt,
        returnDate: row.toAt,
        customerName: row.rental.customer.name,
        quantity: row.quantity,
        discount: row.discountAmount,
        status: row.status,
      })),
    };
  }

  async findByUserId(userId: string, skip: number, take: number) {
    return await this.prisma.rental.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        invoice: {
          select: { id: true },
        },
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

  async countByUserId(userId: string) {
    return this.prisma.rental.count({
      where: { userId },
    });
  }

  async findByUserIdPaginated(userId: string, skip: number, take: number) {
    const where: Prisma.RentalWhereInput = { userId };

    return this.prisma.$transaction([
      this.prisma.rental.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          invoice: {
            select: { id: true },
          },
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
      }),
      this.prisma.rental.count({ where }),
    ]);
  }

  async findById(userId: string, rentalId: string) {
    const rental = await this.prisma.rental.findFirst({
      where: {
        id: rentalId,
        userId,
      },
      include: {
        invoice: {
          select: { id: true },
        },
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
        rentalItems: {
          select: {
            deliveryStatus: true,
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

  async findDeliveryList(userId: string, query: DeliveryQueryDto) {
    const where: Prisma.RentalItemWhereInput = {
      rental: { userId },
    };

    if (query.rentalId) {
      where.rentalId = query.rentalId;
    }

    if (query.fromDate || query.toDate) {
      const { gte, lte } = this.getDateRange(query.fromDate, query.toDate);

      where.fromAt = {
        ...(gte ? { gte } : {}),
        ...(lte ? { lte } : {}),
      };
    }

    if (query.categoryId) {
      where.item = { categoryId: query.categoryId };
    }

    if (query.status === 'picked') {
      where.deliveryStatus = RentalDeliveryStatus.PICKED;
    } else if (query.status === 'pending') {
      where.deliveryStatus = RentalDeliveryStatus.PENDING;
    }

    return this.prisma.rentalItem.findMany({
      where,
      include: {
        item: {
          select: {
            fullName: true,
            description: true,
            images: true,
            category: true,
            categoryId: true,
          },
        },
        rental: {
          select: {
            id: true,
            bookingNo: true,
            depositAmount: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        fromAt: 'asc',
      },
    });
  }

  async findDeliveryItemById(userId: string, rentalItemId: string) {
    return this.prisma.rentalItem.findFirst({
      where: {
        id: rentalItemId,
        rental: {
          userId,
        },
      },
      select: {
        id: true,
        status: true,
        deliveryStatus: true,
      },
    });
  }

  async updateDeliveryStatus(
    rentalItemId: string,
    status: 'picked' | 'pending',
  ) {
    return this.prisma.rentalItem.update({
      where: {
        id: rentalItemId,
      },
      data: {
        deliveryStatus:
          status === 'picked'
            ? RentalDeliveryStatus.PICKED
            : RentalDeliveryStatus.PENDING,
        pickedAt: status === 'picked' ? new Date() : null,
      },
      include: {
        item: {
          select: {
            fullName: true,
            description: true,
            images: true,
          },
        },
        rental: {
          select: {
            bookingNo: true,
            depositAmount: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findReturnList(userId: string, query: ReturnQueryDto) {
    const where: Prisma.RentalItemWhereInput = {
      rental: { userId },
      deliveryStatus: RentalDeliveryStatus.PICKED,
    };

    if (query.rentalId) {
      where.rentalId = query.rentalId;
    }

    if (query.fromDate || query.toDate) {
      const { gte, lte } = this.getDateRange(query.fromDate, query.toDate);

      where.toAt = {
        ...(gte ? { gte } : {}),
        ...(lte ? { lte } : {}),
      };
    }

    if (query.categoryId) {
      where.item = { categoryId: query.categoryId };
    }

    if (query.status === 'returned') {
      where.status = 'RETURNED';
    }

    return this.prisma.rentalItem.findMany({
      where,
      include: {
        item: {
          select: {
            fullName: true,
            description: true,
            images: true,
            category: true,
            categoryId: true,
          },
        },
        rental: {
          select: {
            id: true,
            bookingNo: true,
            depositAmount: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        toAt: 'asc',
      },
    });
  }

  async updateReturnStatus(rentalItemId: string) {
    return this.prisma.rentalItem.update({
      where: {
        id: rentalItemId,
      },
      data: {
        status: 'RETURNED',
      },
      include: {
        item: {
          select: {
            fullName: true,
            description: true,
            images: true,
            category: true,
            categoryId: true,
          },
        },
        rental: {
          select: {
            bookingNo: true,
            depositAmount: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
