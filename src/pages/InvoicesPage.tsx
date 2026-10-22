import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  CreditCard,
  Percent,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Invoice, PaymentStatus, PageView } from '../types';
import { invoiceService } from '../services/invoiceService';
import { formatRupiah } from '../utils/currency';
import { formatTanggalIndo, getNamaBulan } from '../utils/date';
import { StatusBadge } from '../components/common/StatusBadge';
import { GenerateInvoiceModal } from '../components/invoices/GenerateInvoiceModal';
import { InvoiceDiscountModal } from '../components/invoices/InvoiceDiscountModal';
import { exportToCsv } from '../utils/csv';
import { INITIAL_SCHOOL_SETTINGS } from '../data/initialSettings';

interface InvoicesPageProps {
  onNavigate: (page: PageView) => void;
  onPayForInvoice: (invoiceId: string) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({
  onNavigate,
  onPayForInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [bulanFilter, setBulanFilter] = useState<number | 'all'>('all');
  const [tahunFilter, setTahunFilter] = useState<number | 'all'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [discountInvoice, setDiscountInvoice] = useState<Invoice | null>(null);

  // Refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  const filteredInvoices = useMemo(() => {
    return invoiceService.search(
      searchQuery,
      statusFilter,
      classFilter,
      bulanFilter,
      tahunFilter
    );
  }, [searchQuery, statusFilter, classFilter, bulanFilter, tahunFilter, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const handleExportCsv = () => {
    exportToCsv('daftar_tagihan_spp_cekmobil', [
      'No Tagihan',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Periode SPP',
      'Nominal Asli',
      'Potongan',
      'Total Tagihan',
      'Jumlah Dibayar',
      'Sisa Tagihan',
      'Jatuh Tempo',
      'Status'
    ], filteredInvoices.map(i => [
      i.nomorTagihan,
      i.nis,
      i.namaSiswa,
      i.kelas,
      i.periodeFormatted,
      i.nominalTagihan,
      i.potongan,
      i.totalTagihan,
      i.jumlahDibayar,
      i.sisaTagihan,
      formatTanggalIndo(i.jatuhTempo),
      i.status
    ]));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-600" />
            <span>Manajemen Tagihan SPP</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Penerbitan surat tagihan bulanan, pencatatan keringanan/potongan, dan status jatuh tempo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Tagihan Massal</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari siswa, NIS, atau no tagihan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
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
              <option value="all">Semua Status Tagihan</option>
              <option value="LUNAS">Lunas</option>
              <option value="DIBAYAR_SEBAGIAN">Dibayar Sebagian</option>
              <option value="BELUM_LUNAS">Belum Lunas</option>
              <option value="JATUH_TEMPO">Jatuh Tempo Terlewati</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
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

          {/* Filter Bulan */}
          <div>
            <select
              value={bulanFilter}
              onChange={(e) => {
                setBulanFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getNamaBulan(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tahun */}
          <div>
            <select
              value={tahunFilter}
              onChange={(e) => {
                setTahunFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Tahun</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          <span>
            Menampilkan <strong>{filteredInvoices.length}</strong> tagihan SPP.
          </span>
          {(searchQuery || statusFilter !== 'all' || classFilter !== 'all' || bulanFilter !== 'all' || tahunFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setClassFilter('all');
                setBulanFilter('all');
                setTahunFilter('all');
                setCurrentPage(1);
              }}
              className="text-red-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Invoice Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">No Tagihan</th>
                <th className="py-3 px-4">Nama Siswa & NIS</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Dibayar</th>
                <th className="py-3 px-4">Sisa Tagihan</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400">
                    <p className="font-semibold text-zinc-600">Tidak ada tagihan yang cocok dengan filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                      {inv.nomorTagihan}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{inv.namaSiswa}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">NIS: {inv.nis}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-700 font-medium">{inv.kelas}</td>
                    <td className="py-3 px-4 font-semibold text-zinc-800">{inv.periodeFormatted}</td>
                    <td className="py-3 px-4 font-mono">
                      <div>{formatRupiah(inv.totalTagihan)}</div>
                      {inv.potongan > 0 && (
                        <div className="text-[10px] text-emerald-600 font-sans">
                          Pot. {formatRupiah(inv.potongan)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                      {formatRupiah(inv.jumlahDibayar)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                      {inv.sisaTagihan === 0 ? (
                        <span className="text-zinc-400">Rp 0</span>
                      ) : (
                        <span className="text-red-600">{formatRupiah(inv.sisaTagihan)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {formatTanggalIndo(inv.jatuhTempo)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {inv.sisaTagihan > 0 && (
                          <button
                            onClick={() => onPayForInvoice(inv.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-2xs transition-colors flex items-center gap-1"
                            title="Proses Pembayaran"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Bayar</span>
                          </button>
                        )}

                        {inv.sisaTagihan > 0 && inv.potongan === 0 && (
                          <button
                            onClick={() => setDiscountInvoice(inv)}
                            className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                            title="Catat Potongan / Beasiswa"
                          >
                            <Percent className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* Modals */}
      <GenerateInvoiceModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={triggerRefresh}
      />

      <InvoiceDiscountModal
        isOpen={!!discountInvoice}
        onClose={() => setDiscountInvoice(null)}
        invoice={discountInvoice}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};
