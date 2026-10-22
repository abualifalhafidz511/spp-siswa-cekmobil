import React, { useState } from 'react';
import { CreditCard, History, CheckCircle2 } from 'lucide-react';
import { PaymentForm } from '../components/payments/PaymentForm';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { PaymentTransaction, PageView } from '../types';
import { storageService } from '../services/storage';

interface PaymentsPageProps {
  onNavigate: (page: PageView) => void;
  prefilledStudentId?: string;
  prefilledInvoiceId?: string;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({
  onNavigate,
  prefilledStudentId,
  prefilledInvoiceId,
}) => {
  const [completedTransaction, setCompletedTransaction] = useState<PaymentTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const schoolSettings = storageService.getSettings();

  const handlePaymentSuccess = (trx: PaymentTransaction) => {
    setCompletedTransaction(trx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-red-600" />
            <span>Penerimaan Pembayaran SPP</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Kasir penerimaan SPP siswa SMK Otomotif Cekmobil (Tunai, Transfer Bank, & QRIS)
          </p>
        </div>

        <button
          onClick={() => onNavigate('history')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
        >
          <History className="w-4 h-4 text-zinc-500" />
          <span>Lihat Riwayat Transaksi</span>
        </button>
      </div>

      {/* Main Payment Form */}
      <PaymentForm
        initialStudentId={prefilledStudentId}
        initialInvoiceId={prefilledInvoiceId}
        onPaymentSuccess={handlePaymentSuccess}
        onCancel={() => onNavigate('dashboard')}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={completedTransaction}
        settings={schoolSettings}
      />
    </div>
  );
};
