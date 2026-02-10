import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRepository } from '../user/user.repository.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private userRepository: UserRepository,
  ) {}

  async create(supabaseId: string, dto: CreatePaymentDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) throw new NotFoundException('User not found');

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: dto.invoiceId,
        userId: user.id,
      },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    const paidSoFar = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    if (paidSoFar + dto.amount > invoice.totalAmount) {
      throw new BadRequestException('Payment exceeds invoice total');
    }

    // Transaction: payment + invoice status update
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          invoiceId: invoice.id,
          amount: dto.amount,
          method: dto.method,
          reference: dto.reference,
          paidAt: new Date(dto.paidAt),
        },
      });

      const newTotalPaid = paidSoFar + dto.amount;

      let newStatus: InvoiceStatus = InvoiceStatus.PENDING;

      if (newTotalPaid === invoice.totalAmount) {
        newStatus = InvoiceStatus.PAID;
      } else if (newTotalPaid > 0) {
        newStatus = InvoiceStatus.PARTIAL;
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus },
      });

      return {
        success: true,
        data: payment,
      };
    });
  }
}
