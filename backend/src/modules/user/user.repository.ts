import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    supabaseId: string;
    companyName: string;
    phone: string;
    email: string;
    businessType: string;
    onboardingStep?: number;
    onboardingDone?: boolean;
  }) {
    const trialDays = 14;
    const user = await this.prisma.user.create({
      data: {
        supabaseId: data.supabaseId,
        companyName: data.companyName,
        phone: data.phone,
        email: data.email,
        businessType: data.businessType,
        onboardingStep: data.onboardingStep,
        onboardingDone: data.onboardingDone,
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
      },
    });
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  async updateUser(supabaseId: string, data: any) {
    try {
      const user = await this.prisma.user.update({
        where: { supabaseId },
        data,
      });

      return user;
    } catch (error) {
      console.log(error.message);
    }
  }

  async findById(supabaseId: string) {
    
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
    });
    return user;
  }

  async getDashboardStats(userId: string) {
    const today = new Date();

    const activeRentals = await this.prisma.rental.count({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    const overdueRentals = await this.prisma.rental.count({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { lt: today },
      },
    });

    const totalRevenue = await this.prisma.invoice.aggregate({
      where: { userId },
      _sum: { totalAmount: true },
    });

    const pendingInvoices = await this.prisma.invoice.count({
      where: {
        userId,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      data: {
        activeRentals,
        overdueRentals,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingInvoices,
      },
    };
  }

  async getRevenueAnalytics(userId: string, range: string) {
    const now = new Date();
    let start: Date;

    switch (range) {
      case '7d':
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        break;

      case '1y':
        start = new Date(
          Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), 1),
        );
        break;

      case '30d':
      default:
        start = new Date(now);
        start.setDate(now.getDate() - 29);
    }

    const invoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        createdAt: { gte: start },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const grouped: Record<string, number> = {};

    for (const invoice of invoices) {
      let key: string;

      if (range === '1y') {
        key = invoice.createdAt.toISOString().slice(0, 7); // monthly
      } else {
        key = invoice.createdAt.toISOString().slice(0, 10); // daily
      }

      grouped[key] = (grouped[key] ?? 0) + invoice.totalAmount;
    }

    const result: { label: string; revenue: number }[] = [];

    if (range === '1y') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
        );

        const key = date.toISOString().slice(0, 7);

        result.push({
          label: date.toLocaleString('default', { month: 'short' }),
          revenue: grouped[key] ?? 0,
        });
      }
    } else {
      const days = range === '7d' ? 7 : 30;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const key = date.toISOString().slice(0, 10);

        result.push({
          label: date.getDate().toString(),
          revenue: grouped[key] ?? 0,
        });
      }
    }

    return {
      success: true,
      data: result,
    };
  }

  async updateUserByInternalId(userId: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateProfile(supabaseId: string, data: any) {
    return this.prisma.user.update({
      where: { supabaseId },
      data,
    });
  }
}
