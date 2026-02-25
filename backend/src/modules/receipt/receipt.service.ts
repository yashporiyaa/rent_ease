import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRepository } from '../user/user.repository.js';
import { CreateReceiptDto } from './dto/create-receipt.dto.js';
import { ReceiptListQueryDto } from './dto/receipt-list-query.dto.js';
import { InvoiceStatus, Prisma } from '@prisma/client';
import {
  buildPaginationMeta,
  resolvePagination,
} from '../../common/utils/pagination.util.js';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  private async getValidatedUser(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async syncInvoiceStatusForRentals(
    tx: Prisma.TransactionClient,
    userId: string,
    rentalIds: string[],
  ) {
    const uniqueRentalIds = [...new Set(rentalIds)];
    if (uniqueRentalIds.length === 0) {
      return;
    }

    const invoices = await tx.invoice.findMany({
      where: {
        userId,
        rentalId: {
          in: uniqueRentalIds,
        },
      },
      include: {
        rental: {
          select: {
            totalAmount: true,
            pendingAmount: true,
          },
        },
      },
    });

    for (const invoice of invoices) {
      const pending = Math.max(Number(invoice.rental.pendingAmount ?? 0), 0);
      const total = Math.max(Number(invoice.totalAmount ?? 0), 0);

      let nextStatus: InvoiceStatus;
      if (pending <= 0) {
        nextStatus = InvoiceStatus.PAID;
      } else if (pending < total) {
        nextStatus = InvoiceStatus.PARTIAL;
      } else {
        nextStatus = InvoiceStatus.PENDING;
      }

      await tx.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          status: nextStatus,
        },
      });
    }
  }

  private async buildValidatedDraft(
    tx: Prisma.TransactionClient,
    userId: string,
    dto: CreateReceiptDto,
  ) {
    const customer = await tx.customer.findFirst({
      where: {
        id: dto.customerId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const uniqueRentalIds = [...new Set(dto.lineItems.map((line) => line.rentalId))];
    if (uniqueRentalIds.length !== dto.lineItems.length) {
      throw new BadRequestException('Duplicate rentals are not allowed in receipt');
    }

    const rentals = await tx.rental.findMany({
      where: {
        id: {
          in: uniqueRentalIds,
        },
        userId,
        customerId: dto.customerId,
      },
      select: {
        id: true,
        pendingAmount: true,
      },
    });

    if (rentals.length !== uniqueRentalIds.length) {
      throw new BadRequestException('One or more rentals are invalid for selected customer');
    }

    const pendingByRentalId = new Map(
      rentals.map((rental) => [rental.id, rental.pendingAmount] as const),
    );

    let grossReceived = 0;

    for (const line of dto.lineItems) {
      const pending = pendingByRentalId.get(line.rentalId) ?? 0;
      if (pending <= 0) {
        throw new BadRequestException('Selected rental has no pending amount');
      }
      if (line.receivedAmount > pending) {
        throw new BadRequestException('Received amount cannot exceed pending amount');
      }

      grossReceived += line.receivedAmount;
    }

    const discountAmount = dto.discountAmount ?? 0;
    if (discountAmount > grossReceived) {
      throw new BadRequestException('Discount cannot exceed received amount');
    }

    const totalReceived = grossReceived - discountAmount;
    const selectedPendingTotal = Array.from(pendingByRentalId.values()).reduce(
      (sum, pending) => sum + pending,
      0,
    );

    if (grossReceived > selectedPendingTotal) {
      throw new BadRequestException(
        'Received amount exceeds selected rentals pending total',
      );
    }

    const lineAdjustments = dto.lineItems.map((line) => {
      const pending = pendingByRentalId.get(line.rentalId) ?? 0;

      return {
        rentalId: line.rentalId,
        receivedAmount: line.receivedAmount,
        description: line.description?.trim() || undefined,
        discountAmount: 0,
        nextPending: pending - line.receivedAmount,
      };
    });

    return {
      discountAmount,
      totalReceived,
      lineAdjustments,
    };
  }

  async getAll(supabaseId: string, query: ReceiptListQueryDto) {
    const user = await this.getValidatedUser(supabaseId);
    const pagination = resolvePagination(query);

    const where: {
      userId: string;
      entryDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      userId: user.id,
    };

    if (query.fromDate || query.toDate) {
      const toDate = query.toDate ? new Date(query.toDate) : undefined;
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }

      where.entryDate = {
        ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
        ...(toDate ? { lte: toDate } : {}),
      };
    }

    const [receipts, totalItems] = await this.prisma.$transaction([
      this.prisma.receipt.findMany({
        where,
        orderBy: {
          entryDate: 'desc',
        },
        skip: pagination.skip,
        take: pagination.take,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          lineItems: {
            include: {
              rental: {
                select: {
                  id: true,
                  bookingNo: true,
                  bookingAt: true,
                  totalAmount: true,
                  pendingAmount: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return {
      success: true,
      data: receipts,
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async searchCustomersWithPending(supabaseId: string, search?: string) {
    const user = await this.getValidatedUser(supabaseId);

    const customers = await this.prisma.customer.findMany({
      where: {
        userId: user.id,
        ...(search?.trim()
          ? {
              name: {
                contains: search.trim(),
                mode: 'insensitive',
              },
            }
          : {}),
        rentals: {
          some: {
            pendingAmount: {
              gt: 0,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        rentals: {
          where: {
            pendingAmount: {
              gt: 0,
            },
          },
          select: {
            pendingAmount: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 20,
    });

    return {
      success: true,
      data: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        pendingTotal: customer.rentals.reduce(
          (sum, rental) => sum + rental.pendingAmount,
          0,
        ),
      })),
    };
  }

  async getPendingRentals(supabaseId: string, customerId: string) {
    const user = await this.getValidatedUser(supabaseId);

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const rentals = await this.prisma.rental.findMany({
      where: {
        userId: user.id,
        customerId,
        pendingAmount: {
          gt: 0,
        },
      },
      select: {
        id: true,
        bookingNo: true,
        bookingAt: true,
        totalAmount: true,
        pendingAmount: true,
      },
      orderBy: {
        bookingAt: 'desc',
      },
    });

    return {
      success: true,
      data: rentals,
    };
  }

  async create(supabaseId: string, dto: CreateReceiptDto) {
    const user = await this.getValidatedUser(supabaseId);

    const created = await this.prisma.$transaction(async (tx) => {
      const draft = await this.buildValidatedDraft(tx, user.id, dto);

      for (const line of draft.lineAdjustments) {
        await tx.rental.update({
          where: {
            id: line.rentalId,
          },
          data: {
            pendingAmount: line.nextPending,
          },
        });
      }

      await this.syncInvoiceStatusForRentals(
        tx,
        user.id,
        draft.lineAdjustments.map((line) => line.rentalId),
      );

      return tx.receipt.create({
        data: {
          userId: user.id,
          customerId: dto.customerId,
          entryDate: new Date(dto.entryDate),
          paymentMode: dto.paymentMode,
          discountAmount: draft.discountAmount,
          totalReceived: draft.totalReceived,
          lineItems: {
            create: draft.lineAdjustments.map((line) => ({
              rentalId: line.rentalId,
              description: line.description,
              receivedAmount: line.receivedAmount,
              discountAmount: line.discountAmount,
            })),
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          lineItems: {
            include: {
              rental: {
                select: {
                  id: true,
                  bookingNo: true,
                  bookingAt: true,
                  totalAmount: true,
                  pendingAmount: true,
                },
              },
            },
          },
        },
      });
    });

    return {
      success: true,
      data: created,
    };
  }

  async update(supabaseId: string, receiptId: string, dto: CreateReceiptDto) {
    const user = await this.getValidatedUser(supabaseId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.receipt.findFirst({
        where: {
          id: receiptId,
          userId: user.id,
        },
        include: {
          lineItems: true,
        },
      });

      if (!existing) {
        throw new NotFoundException('Receipt not found');
      }

      // Revert previous receipt impact before validating/re-applying.
      for (const line of existing.lineItems) {
        const rollbackAmount = line.receivedAmount + (line.discountAmount ?? 0);

        await tx.rental.update({
          where: {
            id: line.rentalId,
          },
          data: {
            pendingAmount: {
              increment: rollbackAmount,
            },
          },
        });
      }

      const draft = await this.buildValidatedDraft(tx, user.id, dto);

      for (const line of draft.lineAdjustments) {
        await tx.rental.update({
          where: {
            id: line.rentalId,
          },
          data: {
            pendingAmount: line.nextPending,
          },
        });
      }

      await this.syncInvoiceStatusForRentals(
        tx,
        user.id,
        [
          ...existing.lineItems.map((line) => line.rentalId),
          ...draft.lineAdjustments.map((line) => line.rentalId),
        ],
      );

      await tx.receiptLine.deleteMany({
        where: {
          receiptId,
        },
      });

      return tx.receipt.update({
        where: {
          id: receiptId,
        },
        data: {
          customerId: dto.customerId,
          entryDate: new Date(dto.entryDate),
          paymentMode: dto.paymentMode,
          discountAmount: draft.discountAmount,
          totalReceived: draft.totalReceived,
          lineItems: {
            create: draft.lineAdjustments.map((line) => ({
              rentalId: line.rentalId,
              description: line.description,
              receivedAmount: line.receivedAmount,
              discountAmount: line.discountAmount,
            })),
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          lineItems: {
            include: {
              rental: {
                select: {
                  id: true,
                  bookingNo: true,
                  bookingAt: true,
                  totalAmount: true,
                  pendingAmount: true,
                },
              },
            },
          },
        },
      });
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(supabaseId: string, receiptId: string) {
    const user = await this.getValidatedUser(supabaseId);

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.receipt.findFirst({
        where: {
          id: receiptId,
          userId: user.id,
        },
        include: {
          lineItems: true,
        },
      });

      if (!existing) {
        throw new NotFoundException('Receipt not found');
      }

      for (const line of existing.lineItems) {
        const rollbackAmount = line.receivedAmount + (line.discountAmount ?? 0);
        await tx.rental.update({
          where: {
            id: line.rentalId,
          },
          data: {
            pendingAmount: {
              increment: rollbackAmount,
            },
          },
        });
      }

      await this.syncInvoiceStatusForRentals(
        tx,
        user.id,
        existing.lineItems.map((line) => line.rentalId),
      );

      await tx.receiptLine.deleteMany({
        where: {
          receiptId,
        },
      });

      await tx.receipt.delete({
        where: {
          id: receiptId,
        },
      });
    });

    return {
      success: true,
      data: {
        id: receiptId,
      },
    };
  }
}
