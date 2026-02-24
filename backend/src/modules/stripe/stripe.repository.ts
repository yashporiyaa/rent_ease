import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SubscriptionStatus } from '@prisma/client';

@Injectable()
export class StripeRepository {
  constructor(private readonly prisma: PrismaService) {}

  // async findUserBySupabaseId(supabaseId: string) {
  //   return this.prisma.user.findUnique({
  //     where: { supabaseId },
  //   });
  // }

  async updateStripeCustomerId(userId: string, customerId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  private mapStripeStatus(status: string): SubscriptionStatus {
    switch (status) {
      case 'active':
      case 'trialing':
      case 'past_due':
      case 'unpaid':
        return 'ACTIVE';
      case 'canceled':
        return 'CANCELLED';
      case 'incomplete':
      case 'incomplete_expired':
      case 'paused':
      default:
        return 'EXPIRED';
    }
  }

  async createOrUpdateSubscription(data: {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    priceId: string;
    currentPeriodEnd: Date;
    status: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { stripeCustomerId: data.stripeCustomerId },
    });

    if (!user) {
      throw new Error('User not found for subscription');
    }

    const normalizedStatus = this.mapStripeStatus(data.status);

    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeSubscriptionId: data.stripeSubscriptionId,
        status: normalizedStatus,
        currentPeriodEnd: data.currentPeriodEnd,
        priceId: data.priceId,
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: data.stripeSubscriptionId,
        priceId: data.priceId,
        currentPeriodEnd: data.currentPeriodEnd,
        status: normalizedStatus,
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: normalizedStatus },
    });
  }
}
