import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

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

  async activateSubscription(customerId: string) {
    return this.prisma.user.update({
      where: { stripeCustomerId: customerId },
      data: { subscriptionStatus: 'ACTIVE' },
    });
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      console.warn('Subscription not found:', stripeSubscriptionId);
      return;
    }

    await this.prisma.subscription.update({
      where: { userId: subscription.userId },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.user.update({
      where: { id: subscription.userId },
      data: { subscriptionStatus: 'CANCELLED' },
    });
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

    // Upsert by userId (since userId is unique)
    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        stripeSubscriptionId: data.stripeSubscriptionId, // important for resubscribe
        status: 'ACTIVE',
        currentPeriodEnd: data.currentPeriodEnd,
        priceId: data.priceId,
      },
      create: {
        userId: user.id,
        stripeSubscriptionId: data.stripeSubscriptionId,
        priceId: data.priceId,
        currentPeriodEnd: data.currentPeriodEnd,
        status: 'ACTIVE',
      },
    });

    // Always sync user table
    await this.prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'ACTIVE' },
    });
  }
}
