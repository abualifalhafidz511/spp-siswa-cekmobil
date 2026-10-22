import React from 'react';
import { PaymentStatus, StudentStatus, TransactionStatus } from '../../types';
import { getStatusLabel, getStatusStyle } from '../../utils/paymentStatus';

interface StatusBadgeProps {
  status: PaymentStatus | StudentStatus | TransactionStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  // Check if it's payment status
  if (status === 'LUNAS' || status === 'DIBAYAR_SEBAGIAN' || status === 'BELUM_LUNAS' || status === 'JATUH_TEMPO') {
    const style = getStatusStyle(status);
    const label = getStatusLabel(status);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${style.badge} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        <span>{label}</span>
      </span>
    );
  }

  // Student status: aktif, lulus, nonaktif
  if (status === 'aktif') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Aktif</span>
      </span>
    );
  }
  if (status === 'lulus') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200/80 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
        <span>Lulus</span>
      </span>
    );
  }
  if (status === 'nonaktif') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
        <span>Nonaktif</span>
      </span>
    );
  }

  // Transaction status: BERHASIL, DIBATALKAN
  if (status === 'BERHASIL') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Berhasil</span>
      </span>
    );
  }
  if (status === 'DIBATALKAN') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        <span>Dibatalkan</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs text-zinc-600 bg-zinc-100 ${className}`}>
      {status}
    </span>
  );
};
