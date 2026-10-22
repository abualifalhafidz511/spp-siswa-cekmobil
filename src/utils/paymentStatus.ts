import { PaymentStatus } from '../types';
import { isDueDatePassed } from './date';

/**
 * Calculates payment status based on total tagihan, jumlah dibayar, and jatuh tempo
 */
export function calculatePaymentStatus(
  totalTagihan: number,
  jumlahDibayar: number,
  jatuhTempo: string
): PaymentStatus {
  if (jumlahDibayar >= totalTagihan && totalTagihan > 0) {
    return 'LUNAS';
  }
  
  const hasRemaining = (totalTagihan - jumlahDibayar) > 0;
  const isPastDue = isDueDatePassed(jatuhTempo);

  if (jumlahDibayar > 0 && hasRemaining) {
    // If past due and partial payment, we can either designate as JATUH_TEMPO or DIBAYAR_SEBAGIAN.
    // The requirement states: "JATUH TEMPO jika masih ada saldo dan tanggal jatuh tempo sudah lewat."
    if (isPastDue) {
      return 'JATUH_TEMPO';
    }
    return 'DIBAYAR_SEBAGIAN';
  }

  if (isPastDue && hasRemaining) {
    return 'JATUH_TEMPO';
  }

  return 'BELUM_LUNAS';
}

/**
 * Returns human-readable label in Indonesian
 */
export function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'LUNAS':
      return 'Lunas';
    case 'DIBAYAR_SEBAGIAN':
      return 'Dibayar Sebagian';
    case 'BELUM_LUNAS':
      return 'Belum Lunas';
    case 'JATUH_TEMPO':
      return 'Jatuh Tempo Terlewati';
    default:
      return status;
  }
}

/**
 * Returns clean semantic styling adhering to anti-pill aesthetic discipline
 */
export function getStatusStyle(status: PaymentStatus): {
  dot: string;
  badge: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'LUNAS':
      return {
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
      };
    case 'DIBAYAR_SEBAGIAN':
      return {
        dot: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
        text: 'text-amber-700',
        border: 'border-amber-300',
      };
    case 'BELUM_LUNAS':
      return {
        dot: 'bg-zinc-400',
        badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        text: 'text-zinc-600',
        border: 'border-zinc-300',
      };
    case 'JATUH_TEMPO':
      return {
        dot: 'bg-rose-600 animate-pulse',
        badge: 'bg-rose-50 text-rose-800 border-rose-200/80',
        text: 'text-rose-700 font-medium',
        border: 'border-rose-300',
      };
    default:
      return {
        dot: 'bg-zinc-400',
        badge: 'bg-zinc-50 text-zinc-700 border-zinc-200',
        text: 'text-zinc-600',
        border: 'border-zinc-200',
      };
  }
}
