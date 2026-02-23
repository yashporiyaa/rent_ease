import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRepository } from '../user/user.repository.js';
import { Prisma } from '@prisma/client';
import { RentalPaymentListQueryDto } from './dto/rental-payment-list-query.dto.js';
import { CreateRentalPaymentDto } from './dto/create-rental-payment.dto.js';

@Injectable()
export class RentalPaymentService {
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

  private async buildValidatedDraft(
    tx: Prisma.TransactionClient,
    userId: string,
    dto: CreateRentalPaymentDto,
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
      throw new BadRequestException('Duplicate rentals are not allowed in payment');
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
        depositAmount: true,
      },
    });

    if (rentals.length !== uniqueRentalIds.length) {
      throw new BadRequestException('One or more rentals are invalid for selected customer');
    }

    const pendingByRentalId = new Map(
      rentals.map((rental) => [rental.id, rental.depositAmount] as const),
    );

    let grossPaid = 0;

    for (const line of dto.lineItems) {
      const pending = pendingByRentalId.get(line.rentalId) ?? 0;
      if (pending <= 0) {
        throw new BadRequestException('Selected rental has no deposit pending');
      }
      if (line.paidAmount > pending) {
        throw new BadRequestException('Paid amount cannot exceed deposit pending');
      }

      grossPaid += line.paidAmount;
    }

    const discountAmount = dto.discountAmount ?? 0;
    if (discountAmount > grossPaid) {
      throw new BadRequestException('Discount cannot exceed paid amount');
    }

    const totalPaid = grossPaid - discountAmount;
    const selectedPendingTotal = Array.from(pendingByRentalId.values()).reduce(
      (sum, pending) => sum + pending,
      0,
    );

    if (grossPaid > selectedPendingTotal) {
      throw new BadRequestException(
        'Paid amount exceeds selected rentals deposit pending total',
      );
    }

    const lineAdjustments = dto.lineItems.map((line) => {
      const pending = pendingByRentalId.get(line.rentalId) ?? 0;

      return {
        rentalId: line.rentalId,
        paidAmount: line.paidAmount,
        description: line.description?.trim() || undefined,
        discountAmount: 0,
        nextDepositPending: pending - line.paidAmount,
      };
    });

    return {
      discountAmount,
      totalPaid,
      lineAdjustments,
    };
  }

  async getAll(supabaseId: string, query: RentalPaymentListQueryDto) {
    const user = await this.getValidatedUser(supabaseId);

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

    const rentalPayments = await this.prisma.rentalPayment.findMany({
      where,
      orderBy: {
        entryDate: 'desc',
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
                depositAmount: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: rentalPayments,
    };
  }

  async searchCustomersWithDepositPending(supabaseId: string, search?: string) {
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
            depositAmount: {
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
            depositAmount: {
              gt: 0,
            },
          },
          select: {
            depositAmount: true,
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
          (sum, rental) => sum + rental.depositAmount,
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
        depositAmount: {
          gt: 0,
        },
      },
      select: {
        id: true,
        bookingNo: true,
        bookingAt: true,
        totalAmount: true,
        depositAmount: true,
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

  async create(supabaseId: string, dto: CreateRentalPaymentDto) {
    const user = await this.getValidatedUser(supabaseId);

    const created = await this.prisma.$transaction(async (tx) => {
      const draft = await this.buildValidatedDraft(tx, user.id, dto);

      for (const line of draft.lineAdjustments) {
        await tx.rental.update({
          where: {
            id: line.rentalId,
          },
          data: {
            depositAmount: line.nextDepositPending,
          },
        });
      }

      return tx.rentalPayment.create({
        data: {
          userId: user.id,
          customerId: dto.customerId,
          entryDate: new Date(dto.entryDate),
          paymentMode: dto.paymentMode,
          discountAmount: draft.discountAmount,
          totalPaid: draft.totalPaid,
          lineItems: {
            create: draft.lineAdjustments.map((line) => ({
              rentalId: line.rentalId,
              description: line.description,
              paidAmount: line.paidAmount,
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
                  depositAmount: true,
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

  async update(
    supabaseId: string,
    rentalPaymentId: string,
    dto: CreateRentalPaymentDto,
  ) {
    const user = await this.getValidatedUser(supabaseId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.rentalPayment.findFirst({
        where: {
          id: rentalPaymentId,
          userId: user.id,
        },
        include: {
          lineItems: true,
        },
      });

      if (!existing) {
        throw new NotFoundException('Payment not found');
      }

      for (const line of existing.lineItems) {
        const rollbackAmount = line.paidAmount + (line.discountAmount ?? 0);

        await tx.rental.update({
          where: {
            id: line.rentalId,
          },
          data: {
            depositAmount: {
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
            depositAmount: line.nextDepositPending,
          },
        });
      }

      await tx.rentalPaymentLine.deleteMany({
        where: {
          rentalPaymentId,
        },
      });

      return tx.rentalPayment.update({
        where: {
          id: rentalPaymentId,
        },
        data: {
          customerId: dto.customerId,
          entryDate: new Date(dto.entryDate),
          paymentMode: dto.paymentMode,
          discountAmount: draft.discountAmount,
          totalPaid: draft.totalPaid,
          lineItems: {
            create: draft.lineAdjustments.map((line) => ({
              rentalId: line.rentalId,
              description: line.description,
              paidAmount: line.paidAmount,
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
                  depositAmount: true,
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

  async remove(supabaseId: string, rentalPaymentId: string) {
    const user = await this.getValidatedUser(supabaseId);

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.rentalPayment.findFirst({
        where: {
          id: rentalPaymentId,
          userId: user.id,
        },
        include: {
          lineItems: true,
        },
      });

      if (!existing) {
        throw new NotFoundException('Payment not found');
      }

      for (const line of existing.lineItems) {
        const rollbackAmount = line.paidAmount + (line.discountAmount ?? 0);
        await tx.rental.update({
          where: {
            id: line.rentalId,
          },
          data: {
            depositAmount: {
              increment: rollbackAmount,
            },
          },
        });
      }

      await tx.rentalPaymentLine.deleteMany({
        where: {
          rentalPaymentId,
        },
      });

      await tx.rentalPayment.delete({
        where: {
          id: rentalPaymentId,
        },
      });
    });

    return {
      success: true,
      data: {
        id: rentalPaymentId,
      },
    };
  }
}
