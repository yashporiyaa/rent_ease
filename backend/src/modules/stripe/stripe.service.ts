import Stripe from 'stripe';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StripeRepository } from './stripe.repository.js';
import { UserRepository } from '../user/user.repository.js';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private readonly stripeRepository: StripeRepository,
    private readonly userRepository: UserRepository,
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not defined',
      );
    }

    this.stripe = new Stripe(secretKey);
  }

  //  Checkout Session
  async createCheckoutSession(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new Error('User not found');
    }
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      try {
        const customer = await this.stripe.customers.create({
          email: user.email,
        });

        const data = await this.stripeRepository.updateStripeCustomerId(
          user.id,
          customer.id,
        );
        customerId = customer.id;
      } catch (error: any) {
        console.error('Stripe customer creation failed:', error);
        throw error;
      }
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID!,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL}/protected/settings`,
        cancel_url: `${process.env.FRONTEND_URL}/protected/settings`,
      });

      return { url: session.url };
    } catch (error: any) {
      console.error('Checkout session creation failed:', error);
      throw error;
    }
  }

  //  Webhook
  async handleWebhook(signature: string, rawBody: Buffer) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.onCheckoutCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'customer.subscription.deleted':
          await this.onSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;
      }

      return { received: true };
    } catch (err) {
      console.error('WEBHOOK ERROR:', err);
      throw err;
    }
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session) {
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) return;

    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    const item = subscription.items.data[0];

    await this.stripeRepository.createOrUpdateSubscription({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      priceId: item.price.id,
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      status: subscription.status,
    });
  }

  private async onSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.stripeRepository.cancelSubscription(subscription.id);
  }
}
