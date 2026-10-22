import React, { useState } from 'react';
import { Invoice } from '../../types';
import { Modal } from '../common/Modal';
import { formatRupiah, parseRupiah } from '../../utils/currency';
import { invoiceService } from '../../services/invoiceService';

interface InvoiceDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess: () => void;
}

export const InvoiceDiscountModal: React.FC<InvoiceDiscountModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [potonganInput, setPotonganInput] = useState('');
  const [alasan, setAlasan] = useState('Beasiswa Prestasi Akademik / Kejuruan');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const amount = parseRupiah(potonganInput);
    if (amount <= 0) {
      setErrorMsg('Nominal potongan keringanan harus lebih dari 0.');
      return;
    }
    if (amount > invoice.nominalTagihan) {
      setErrorMsg('Potongan tidak boleh melebihi nominal tagihan awal.');
      return;
    }
    if (!alasan.trim()) {
      setErrorMsg('Alasan potongan keringanan wajib dicatat.');
      return;
    }

    try {
      invoiceService.applyDiscount(invoice.id, amount, alasan.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menerapkan potongan.');
    }
  };

  const currentDiscount = parseRupiah(potonganInput);
  const projectedTotal = Math.max(0, invoice.nominalTagihan - currentDiscount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Potongan / Keringanan SPP"
      subtitle={`${invoice.namaSiswa} (${invoice.nis}) - ${invoice.periodeFormatted}`}
      maxWidth="md"
    >
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
          <div className="flex justify-between text-zinc-600">
            <span>Nominal Tagihan Asli:</span>
            <span className="font-semibold text-zinc-900 font-mono">
              {formatRupiah(invoice.nominalTagihan)}
            </span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Sudah Dibayar:</span>
            <span className="font-mono">{formatRupiah(invoice.jumlahDibayar)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Nominal Potongan / Keringanan (Rp) *
          </label>
          <input
            type="text"
            required
            value={potonganInput ? Number(potonganInput).toLocaleString('id-ID') : ''}
            onChange={(e) => setPotonganInput(String(parseRupiah(e.target.value)))}
            placeholder="Contoh: 50.000"
            className="w-full px-3 py-2 text-xs font-bold font-mono bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Alasan Keringanan SPP *
          </label>
          <select
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
          >
            <option value="Beasiswa Prestasi Akademik / Kejuruan">
              Beasiswa Prestasi Akademik / Kejuruan
            </option>
            <option value="Bantuan Siswa Yatim / Dhuafa">
              Bantuan Siswa Yatim / Dhuafa
            </option>
            <option value="Keringanan Khusus Kepala Sekolah">
              Keringanan Khusus Kepala Sekolah
            </option>
            <option value="Diskon Bersaudara Kandung di SMK Cekmobil">
              Diskon Bersaudara Kandung di SMK Cekmobil
            </option>
          </select>
        </div>

        {currentDiscount > 0 && (
          <div className="p-3 rounded-lg bg-red-50/60 border border-red-200/60 text-xs">
            <div className="flex justify-between font-bold text-zinc-900">
              <span>Total Tagihan Baru:</span>
              <span className="text-red-700 font-mono">{formatRupiah(projectedTotal)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
          >
            Simpan Potongan
          </button>
        </div>
      </form>
    </Modal>
  );
};
