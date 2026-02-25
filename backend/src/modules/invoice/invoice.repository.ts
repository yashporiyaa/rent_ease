import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

export type InvoiceSummaryRecord = Prisma.InvoiceGetPayload<{
  include: {
    rental: {
      include: {
        customer: {
          select: { name: true };
        };
      };
    };
  };
}>;

export type InvoiceDetailRecord = Prisma.InvoiceGetPayload<{
  include: {
    rental: {
      include: {
        customer: {
          select: { name: true };
        };
        rentalItems: {
          include: {
            item: {
              select: { fullName: true };
            };
          };
        };
      };
    };
    payments: true;
  };
}>;

export type InvoiceWithRelationsRecord = Prisma.InvoiceGetPayload<{
  include: {
    rental: {
      include: {
        customer: true;
        rentalItems: {
          include: {
            item: true;
          };
        };
      };
    };
    payments: true;
  };
}>;

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string, invoiceId: string): Promise<InvoiceDetailRecord | null> {
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
                item: { select: { fullName: true } },
              },
            },
          },
        },
        payments: true,
      },
    });
  }

  async findAllByUserId(
    userId: string,
    skip: number,
    take: number,
  ): Promise<InvoiceSummaryRecord[]> {
    return this.prisma.invoice.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
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

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.invoice.count({
      where: { userId },
    });
  }

  async findAllByUserIdPaginated(
    userId: string,
    skip: number,
    take: number,
  ): Promise<[InvoiceSummaryRecord[], number]> {
    const where = { userId };

    return this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
        include: {
          rental: {
            include: {
              customer: {
                select: { name: true },
              },
            },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);
  }

  async findByIdWithRelations(
    userId: string,
    invoiceId: string,
  ): Promise<InvoiceWithRelationsRecord | null> {
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
