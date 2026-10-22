import React from 'react';
import { Printer, Check, Copy, Download, Share2 } from 'lucide-react';
import { PaymentTransaction, SchoolSettings } from '../../types';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalWaktu } from '../../utils/date';
import { CekmobilLogo } from '../common/CekmobilLogo';
import { Modal } from '../common/Modal';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
  settings: SchoolSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  settings,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
BUKTI PEMBAYARAN SPP - ${settings.namaSekolah}
No. Kuitansi: ${transaction.nomorTransaksi}
Tanggal: ${formatTanggalWaktu(transaction.tanggalPembayaran)}
Siswa: ${transaction.namaSiswa} (NIS: ${transaction.nis})
Kelas: ${transaction.kelas}
Periode: ${transaction.periodeSpp}
Jumlah Dibayar: ${formatRupiah(transaction.jumlahPembayaran)}
Sisa Tagihan: ${formatRupiah(transaction.sisaTagihanSetelahBayar)}
Metode: ${transaction.metodePembayaran} ${transaction.namaBank ? `(${transaction.namaBank})` : ''}
Status: ${transaction.sisaTagihanSetelahBayar === 0 ? 'LUNAS' : 'DIBAYAR SEBAGIAN'}
Petugas: ${transaction.kasirPetugas}
----------------------------------------
${settings.catatanKuitansi}
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLunas = transaction.sisaTagihanSetelahBayar === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bukti Pembayaran SPP (Kuitansi)"
      subtitle="Kuitansi resmi administrasi keuangan sekolah"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Printable Receipt Card */}
        <div
          id="printable-receipt"
          className="bg-white border border-zinc-300 rounded-xl p-6 sm:p-8 shadow-xs relative text-zinc-900"
        >
          {/* Header Receipt */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-zinc-900">
            <div>
              <CekmobilLogo variant="print" size="md" showSubtitle={false} />
              <h2 className="text-base font-extrabold text-zinc-900 uppercase mt-1 tracking-tight">
                {settings.namaSekolah}
              </h2>
              <p className="text-xs text-zinc-600 max-w-md">{settings.alamat}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Telp: {settings.telepon} • NPSN: {settings.npsn}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                Kuitansi Pembayaran SPP
              </span>
              <p className="text-sm font-mono font-bold text-zinc-900 mt-2">
                {transaction.nomorTransaksi}
              </p>
              <p className="text-[11px] text-zinc-500">
                {formatTanggalWaktu(transaction.tanggalPembayaran)}
              </p>
            </div>
          </div>

          {/* Student & Bill Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500">Nama Siswa:</span>
                <span className="font-bold text-zinc-900">{transaction.namaSiswa}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500">NIS:</span>
                <span className="font-mono font-semibold">{transaction.nis}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500">Kelas:</span>
                <span className="font-semibold">{transaction.kelas}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500">Periode Tagihan:</span>
                <span className="font-semibold text-zinc-900">{transaction.periodeSpp}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500">Metode Bayar:</span>
                <span className="font-semibold">
                  {transaction.metodePembayaran}
                  {transaction.namaBank ? ` (${transaction.namaBank})` : ''}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500">Status Pembayaran:</span>
                <span
                  className={`font-bold uppercase ${
                    isLunas ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isLunas ? 'LUNAS' : 'DIBAYAR SEBAGIAN'}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-1">
                <span className="text-zinc-500">Petugas Penerima:</span>
                <span className="font-semibold">{transaction.kasirPetugas}</span>
              </div>
              {transaction.catatan && (
                <div className="flex justify-between border-b border-zinc-100 pb-1">
                  <span className="text-zinc-500">Catatan:</span>
                  <span className="text-zinc-700 italic">{transaction.catatan}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 mb-6">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Rincian Pembayaran SPP {transaction.periodeSpp}</span>
                <span className="font-mono font-medium">
                  {formatRupiah(transaction.jumlahPembayaran)}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="font-bold text-zinc-900 text-sm">TOTAL PEMBAYARAN:</span>
                <span className="text-xl font-black text-red-600 font-mono">
                  {formatRupiah(transaction.jumlahPembayaran)}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 pt-1">
                <span className="text-zinc-500">Sisa Tagihan Periode Ini:</span>
                <span className="font-mono font-semibold text-zinc-800">
                  {formatRupiah(transaction.sisaTagihanSetelahBayar)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-xs">
            <div className="text-zinc-500 text-[11px] leading-relaxed">
              <p className="font-semibold text-zinc-700 mb-1">Catatan Sekolah:</p>
              <p>{settings.catatanKuitansi}</p>
            </div>

            <div className="text-right flex flex-col items-end">
              <p className="text-[11px] text-zinc-500">
                Jakarta, {formatTanggalWaktu(transaction.tanggalPembayaran).split(',')[0]}
              </p>
              <p className="text-[11px] font-semibold text-zinc-800 mt-0.5">
                Bendahara Keuangan Sekolah
              </p>

              {/* Digital Stamp Simulation */}
              <div className="my-2 border-2 border-dashed border-red-500/40 rounded-lg p-2 text-center w-36">
                <span className="text-[9px] font-bold text-red-600 tracking-wider uppercase block">
                  CEKMOBIL LUNAS
                </span>
                <span className="text-[8px] text-zinc-400 font-mono">TERVERIFIKASI SISTEM</span>
              </div>

              <p className="font-bold text-zinc-900 underline mt-1">
                {transaction.kasirPetugas}
              </p>
              <p className="text-[10px] text-zinc-500">NIP: {settings.nipBendahara}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print border-t border-zinc-100">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks Kuitansi'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kuitansi / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
