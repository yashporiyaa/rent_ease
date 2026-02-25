import type { Request } from 'express';

export type SupabaseUser = {
  sub: string;
  email?: string;
  role?: string;
};

export type AuthenticatedRequest = Request & {
  user: SupabaseUser;
};

export type StripeWebhookRequest = Request & {
  rawBody: Buffer;
  headers: Request['headers'] & {
    'stripe-signature'?: string;
  };
};
