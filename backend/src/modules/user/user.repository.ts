import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma, User } from '@prisma/client';
import {
  RecentActivity,
  UpcomingReturn,
  UserWithSubscription,
} from 'src/interfaces/user.interface.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async syncExpiredSubscriptionIfNeeded(
    user: UserWithSubscription,
  ): Promise<UserWithSubscription> {
    const shouldExpire =
      user.subscriptionStatus === 'ACTIVE' &&
      !!user.subscription?.currentPeriodEnd &&
      user.subscription.currentPeriodEnd.getTime() <= Date.now();

    if (!shouldExpire) {
      return user;
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'EXPIRED' },
      }),
      this.prisma.subscription.updateMany({
        where: { userId: user.id, status: 'ACTIVE' },
        data: { status: 'EXPIRED' },
      }),
    ]);

    return {
      ...user,
      subscriptionStatus: 'EXPIRED',
      subscription: user.subscription
        ? { ...user.subscription, status: 'EXPIRED' }
        : user.subscription,
    };
  }

  async create(data: {
    supabaseId: string;
    companyName: string;
    phone: string;
    email: string;
    businessType: string;
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
        onboardingDone: data.onboardingDone,
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
      },
    });
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  async updateUser(supabaseId: string, data: Prisma.UserUpdateInput) {
    try {
      const user = await this.prisma.user.update({
        where: { supabaseId },
        data,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      throw error;
    }
  }

  async findById(supabaseId: string) {
    
    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      include: {
        subscription: {
          select: {
            currentPeriodEnd: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return user;
    }

    return this.syncExpiredSubscriptionIfNeeded(user);
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

  async getUpcomingReturns(userId: string): Promise<UpcomingReturn[]> {
    const now = new Date();
    const next7Days = new Date(now);
    next7Days.setDate(now.getDate() + 7);

    const rows = await this.prisma.rentalItem.findMany({
      where: {
        rental: { userId },
        deliveryStatus: 'PICKED',
        status: { not: 'RETURNED' },
        toAt: {
          gte: now,
          lte: next7Days,
        },
      },
      select: {
        id: true,
        toAt: true,
        item: {
          select: {
            fullName: true,
          },
        },
        rental: {
          select: {
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
      take: 10,
    });

    return rows
      .filter((row) => !!row.toAt)
      .map((row) => ({
        id: row.id,
        asset: row.item.fullName,
        customer: row.rental.customer.name,
        returnAt: row.toAt!.toISOString(),
      }));
  }

  async getRecentActivities(userId: string): Promise<RecentActivity[]> {
    const [
      recentRentals,
      recentReceipts,
      recentPayouts,
      pickedItems,
      returnedItems,
    ] = await Promise.all([
      this.prisma.rental.findMany({
        where: { userId },
        select: {
          id: true,
          createdAt: true,
          customer: {
            select: {
              name: true,
            },
          },
          rentalItems: {
            select: {
              item: {
                select: {
                  fullName: true,
                },
              },
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
      this.prisma.receipt.findMany({
        where: { userId },
        select: {
          id: true,
          totalReceived: true,
          createdAt: true,
          customer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
      this.prisma.rentalPayment.findMany({
        where: { userId },
        select: {
          id: true,
          totalPaid: true,
          createdAt: true,
          customer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
      this.prisma.rentalItem.findMany({
        where: {
          rental: { userId },
          deliveryStatus: 'PICKED',
          pickedAt: { not: null },
        },
        select: {
          id: true,
          pickedAt: true,
          toAt: true,
          item: {
            select: {
              fullName: true,
            },
          },
          rental: {
            select: {
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          pickedAt: 'desc',
        },
        take: 5,
      }),
      this.prisma.rentalItem.findMany({
        where: {
          rental: { userId },
          status: 'RETURNED',
        },
        select: {
          id: true,
          toAt: true,
          item: {
            select: {
              fullName: true,
            },
          },
          rental: {
            select: {
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          toAt: 'desc',
        },
        take: 5,
      }),
    ]);

    const bookingActivities: RecentActivity[] = recentRentals.map((rental) => ({
      id: `booking-${rental.id}`,
      type: 'BOOKING',
      title: `New Booking: ${rental.rentalItems[0]?.item.fullName ?? 'Rental'}`,
      subtitle: `${rental.customer.name} created a new booking`,
      happenedAt: rental.createdAt.toISOString(),
    }));

    const receiptActivities: RecentActivity[] = recentReceipts.map(
      (receipt) => ({
        id: `receipt-${receipt.id}`,
        type: 'RECEIPT',
        title: 'Receipt Generated',
        subtitle: `${receipt.customer.name} paid ₹${receipt.totalReceived.toLocaleString('en-IN')}`,
        happenedAt: receipt.createdAt.toISOString(),
      }),
    );

    const payoutActivities: RecentActivity[] = recentPayouts.map((payout) => ({
      id: `payout-${payout.id}`,
      type: 'PAYOUT',
      title: 'Return Payment Generated',
      subtitle: `Paid ₹${payout.totalPaid.toLocaleString('en-IN')} to ${payout.customer.name}`,
      happenedAt: payout.createdAt.toISOString(),
    }));

    const pickedActivities: RecentActivity[] = pickedItems
      .filter((row) => !!row.pickedAt)
      .map((row) => ({
        id: `picked-${row.id}`,
        type: 'PICKED',
        title: 'Item Picked',
        subtitle: `${row.item.fullName} picked for ${row.rental.customer.name}`,
        happenedAt: row.pickedAt!.toISOString(),
      }));

    const returnedActivities: RecentActivity[] = returnedItems
      .filter((row) => !!row.toAt)
      .map((row) => ({
        id: `returned-${row.id}`,
        type: 'RETURNED',
        title: 'Item Returned',
        subtitle: `${row.item.fullName} returned by ${row.rental.customer.name}`,
        happenedAt: row.toAt!.toISOString(),
      }));

    return [
      ...bookingActivities,
      ...receiptActivities,
      ...payoutActivities,
      ...pickedActivities,
      ...returnedActivities,
    ]
      .sort(
        (a, b) =>
          new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime(),
      )
      .slice(0, 6);
  }

  async updateUserByInternalId(userId: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateProfile(supabaseId: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { supabaseId },
      data,
    });
  }
}
