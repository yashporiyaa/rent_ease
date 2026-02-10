import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getById(supabaseId: string, invoiceId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) throw new NotFoundException('User not found');

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id,
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

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return {
      success: true,
      data: invoice,
    };
  }

  async getAll(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: {
        userId: user.id,
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

    return {
      success: true,
      data: invoices.map((inv) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        customer: inv.rental.customer.name,
        amount: inv.totalAmount,
        status: inv.status,
        createdAt: inv.createdAt,
      })),
    };
  }
}
