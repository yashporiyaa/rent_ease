import Stripe from 'stripe';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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

    if (user.subscriptionStatus === 'ACTIVE') {
      throw new BadRequestException(
        'Subscription is already active. Wait until it expires or cancel it before subscribing again.',
      );
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      try {
        const customer = await this.stripe.customers.create({
          email: user.email,
        });

        await this.stripeRepository.updateStripeCustomerId(
          user.id,
          customer.id,
        );
        customerId = customer.id;
      } catch (error: unknown) {
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
    } catch (error: unknown) {
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
          await this.onCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.onSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.onSubscriptionDeleted(event.data.object);
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

    await this.syncSubscriptionById(subscriptionId);
  }

  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    await this.syncSubscriptionFromStripe(subscription);
  }

  private async onSubscriptionDeleted(subscription: Stripe.Subscription) {
    await this.syncSubscriptionFromStripe(subscription);
  }

  private async syncSubscriptionById(subscriptionId: string) {
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    await this.syncSubscriptionFromStripe(subscription);
  }

  private async syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
    const item = subscription.items.data[0];
    if (!item?.price?.id) {
      return;
    }

    await this.stripeRepository.createOrUpdateSubscription({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      priceId: item.price.id,
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      status: subscription.status,
    });
  }
}
