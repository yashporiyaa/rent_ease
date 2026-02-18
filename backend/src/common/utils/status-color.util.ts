import { InvoiceStatus } from '@prisma/client';

export function getStatusStyles(status: InvoiceStatus) {
  switch (status) {
    case 'PAID':
      return {
        bg: '#22c55e',
        text: '#ffffff',
      };

    case 'PENDING':
      return {
        bg: '#facc15',
        text: '#000000',
      };

    case 'PARTIAL':
      return {
        bg: '#fb923c',
        text: '#ffffff',
      };

    case 'CANCELLED':
      return {
        bg: '#ef4444',
        text: '#ffffff',
      };

    default:
      return {
        bg: '#94a3b8',
        text: '#ffffff',
      };
  }
}
