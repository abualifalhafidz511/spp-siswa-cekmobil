import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { PaymentTransaction } from '../../types';
import { Modal } from '../common/Modal';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalWaktu } from '../../utils/date';
import { paymentService } from '../../services/paymentService';

interface CancelTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
  onSuccess: () => void;
}

export const CancelTransactionModal: React.FC<CancelTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}) => {
  const [alasan, setAlasan] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) return null;

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!alasan.trim()) {
      setErrorMsg('Alasan pembatalan transaksi wajib diisi untuk integritas audit keuangan.');
      return;
    }

    setIsSubmitting(true);
    try {
      paymentService.cancelPayment(transaction.id, alasan.trim());
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Gagal membatalkan transaksi.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prosedur Pembatalan Transaksi Kas"
      subtitle={`No. Transaksi: ${transaction.nomorTransaksi}`}
      maxWidth="md"
    >
      <form onSubmit={handleCancel} className="space-y-4">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Peringatan Integritas Pembukuan:</p>
            <p>
              Pembatalan transaksi akan mengembalikan sisa tagihan siswa sebesar{' '}
              <strong>{formatRupiah(transaction.jumlahPembayaran)}</strong>. Transaksi tidak akan dihapus, melainkan ditandai sebagai <strong>DIBATALKAN</strong> dan dicatat ke dalam audit trail.
            </p>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-zinc-500">Siswa:</span>
            <span className="font-semibold text-zinc-900">{transaction.namaSiswa} ({transaction.kelas})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Periode Tagihan:</span>
            <span className="font-semibold">{transaction.periodeSpp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Jumlah Transaksi:</span>
            <span className="font-mono font-bold text-red-600">{formatRupiah(transaction.jumlahPembayaran)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Waktu Pembayaran:</span>
            <span>{formatTanggalWaktu(transaction.tanggalPembayaran)}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-zinc-800 mb-1">
            Alasan Pembatalan Transaksi (Wajib Diisi) *
          </label>
          <textarea
            required
            rows={3}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Contoh: Kesalahan input nominal transfer dari orang tua / cek rekening koran belum kliring..."
            className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs"
          >
            {isSubmitting ? 'Memproses...' : 'Batalkan Transaksi Ini'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
