import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  Printer,
  Ban,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { PaymentTransaction, PaymentMethod, PageView } from '../types';
import { paymentService } from '../services/paymentService';
import { storageService } from '../services/storage';
import { formatRupiah } from '../utils/currency';
import { formatTanggalIndo, formatTanggalWaktu, getNamaBulan } from '../utils/date';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { CancelTransactionModal } from '../components/history/CancelTransactionModal';
import { exportToCsv } from '../utils/csv';
import { INITIAL_SCHOOL_SETTINGS } from '../data/initialSettings';

interface PaymentHistoryPageProps {
  onNavigate: (page: PageView) => void;
}

export const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [metodeFilter, setMetodeFilter] = useState<PaymentMethod | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'BERHASIL' | 'DIBATALKAN' | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected for receipt or cancellation
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);
  const [trxToCancel, setTrxToCancel] = useState<PaymentTransaction | null>(null);

  // Refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  const schoolSettings = storageService.getSettings();

  const filteredPayments = useMemo(() => {
    return paymentService.search({
      query: searchQuery,
      kelas: kelasFilter,
      metode: metodeFilter,
      status: statusFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [searchQuery, kelasFilter, metodeFilter, statusFilter, startDate, endDate, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / itemsPerPage));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const handleExportCsv = () => {
    exportToCsv('riwayat_pembayaran_spp_cekmobil', [
      'No Transaksi',
      'Tanggal Pembayaran',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Periode SPP',
      'Nominal (Rp)',
      'Metode',
      'Bank',
      'Petugas Kasir',
      'Status',
      'Alasan Batal'
    ], filteredPayments.map(p => [
      p.nomorTransaksi,
      formatTanggalWaktu(p.tanggalPembayaran),
      p.nis,
      p.namaSiswa,
      p.kelas,
      p.periodeSpp,
      p.jumlahPembayaran,
      p.metodePembayaran,
      p.namaBank || '-',
      p.kasirPetugas,
      p.status,
      p.alasanBatal || '-'
    ]));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-red-600" />
            <span>Riwayat Transaksi Pembayaran</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Jurnal pembukuan penerimaan kas SPP, bukti kuitansi cetak ulang, dan log pembatalan
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-zinc-500" />
          <span>Ekspor Jurnal CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, NIS, no transaksi..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={kelasFilter}
              onChange={(e) => {
                setKelasFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Kelas</option>
              {INITIAL_SCHOOL_SETTINGS.daftarKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Metode */}
          <div>
            <select
              value={metodeFilter}
              onChange={(e) => {
                setMetodeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Metode</option>
              <option value="TUNAI">Tunai</option>
              <option value="TRANSFER_BANK">Transfer Bank</option>
              <option value="QRIS">QRIS</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Status</option>
              <option value="BERHASIL">Berhasil</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
              title="Tanggal Mulai"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          <span>
            Menampilkan <strong>{filteredPayments.length}</strong> catatan transaksi.
          </span>
          {(searchQuery || kelasFilter !== 'all' || metodeFilter !== 'all' || statusFilter !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setKelasFilter('all');
                setMetodeFilter('all');
                setStatusFilter('all');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-red-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">No Transaksi</th>
                <th className="py-3 px-4">Waktu Transaksi</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Periode SPP</th>
                <th className="py-3 px-4">Jumlah Bayar</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Kasir Petugas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400">
                    <p className="font-semibold text-zinc-600">Tidak ada riwayat transaksi ditemukan.</p>
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => {
                  const isCancelled = p.status === 'DIBATALKAN';
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        isCancelled ? 'bg-rose-50/20 opacity-80' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        {p.nomorTransaksi}
                      </td>
                      <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                        {formatTanggalWaktu(p.tanggalPembayaran)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{p.namaSiswa}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">NIS: {p.nis}</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-700">{p.kelas}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-800">{p.periodeSpp}</td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                        <span className={isCancelled ? 'line-through text-zinc-400' : 'text-red-600'}>
                          {formatRupiah(p.jumlahPembayaran)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-zinc-700">
                          {p.metodePembayaran}
                          {p.namaBank ? ` (${p.namaBank})` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600">{p.kasirPetugas}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Cetak Ulang Kuitansi"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {!isCancelled && (
                            <button
                              onClick={() => setTrxToCancel(p)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Batalkan Transaksi Ini"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-zinc-800">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        transaction={selectedReceipt}
        settings={schoolSettings}
      />

      {/* Cancellation Modal */}
      <CancelTransactionModal
        isOpen={!!trxToCancel}
        onClose={() => setTrxToCancel(null)}
        transaction={trxToCancel}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
