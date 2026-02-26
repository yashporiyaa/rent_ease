import { SubscriptionStatus, User } from '@prisma/client';

export interface SubscriptionSnapshot {
  currentPeriodEnd: Date;
  status: SubscriptionStatus;
}

export interface UserWithSubscription extends User {
  subscription: SubscriptionSnapshot | null;
}

export interface UpcomingReturn {
  id: string;
  asset: string;
  customer: string;
  returnAt: string;
}

export interface RecentActivity {
  id: string;
  type: 'BOOKING' | 'RECEIPT' | 'PAYOUT' | 'PICKED' | 'RETURNED';
  title: string;
  subtitle: string;
  happenedAt: string;
}
