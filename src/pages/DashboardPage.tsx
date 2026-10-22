import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  FileText,
  AlertTriangle,
  ArrowRight,
  Download,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageView, PaymentTransaction } from '../types';
import { studentService } from '../services/studentService';
import { invoiceService } from '../services/invoiceService';
import { paymentService } from '../services/paymentService';
import { reportService } from '../services/reportService';
import { storageService } from '../services/storage';
import { formatRupiah } from '../utils/currency';
import { formatTanggalWaktu, formatTanggalIndo } from '../utils/date';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { exportToCsv } from '../utils/csv';

interface DashboardPageProps {
  onNavigate: (page: PageView) => void;
  onSelectPaymentForReceipt: (trx: PaymentTransaction) => void;
  onOpenAddStudent: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectPaymentForReceipt,
  onOpenAddStudent,
}) => {
  const currentMonth = 10; // Oktober 2026
  const currentYear = 2026;

  // Active students count
  const allStudents = studentService.getAll();
  const activeStudents = allStudents.filter(s => s.status === 'aktif');

  // Current month invoice metrics
  const monthStatus = reportService.getCurrentMonthStatus(currentMonth, currentYear);
  const chartData = reportService.getMonthlyTrends();
  const recentPayments = paymentService.getAll().slice(0, 8);
  const schoolSettings = storageService.getSettings();

  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);

  const handleExportRecentPayments = () => {
    exportToCsv('transaksi_terbaru_spp_cekmobil', [
      'No Transaksi',
      'Tanggal',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Periode SPP',
      'Jumlah Pembayaran',
      'Metode',
      'Petugas',
      'Status'
    ], recentPayments.map(p => [
      p.nomorTransaksi,
      formatTanggalIndo(p.tanggalPembayaran),
      p.nis,
      p.namaSiswa,
      p.kelas,
      p.periodeSpp,
      p.jumlahPembayaran,
      p.metodePembayaran,
      p.kasirPetugas,
      p.status
    ]));
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Ringkasan Keuangan SPP</span>
            <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
              Oktober 2026
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitoring tagihan, penerimaan kas harian, dan tunggakan siswa SMK Otomotif Cekmobil
          </p>
        </div>

        {/* Action Buttons as specified in prompt */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('payments')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pembayaran</span>
          </button>

          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
          >
            <Users className="w-4 h-4 text-zinc-500" />
            <span>Tambah Siswa</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Unduh Laporan</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Siswa Aktif */}
        <StatCard
          title="Total Siswa Aktif"
          value={`${activeStudents.length} Siswa`}
          subtitle="Dari 12 rombongan belajar (TKRO, TBSM, TBO)"
          icon={Users}
          accentColor="zinc"
          onClick={() => onNavigate('students')}
          trend={{ value: '100%', isPositive: true, label: 'Data terverifikasi' }}
        />

        {/* 2. Total Tagihan SPP Bulan Ini */}
        <StatCard
          title="Tagihan SPP Bulan Ini"
          value={formatRupiah(monthStatus.totalNominal)}
          subtitle={`Periode ${monthStatus.bulanNama} ${monthStatus.tahun}`}
          icon={FileText}
          accentColor="blue"
          onClick={() => onNavigate('invoices')}
          trend={{ value: `${monthStatus.totalSiswa} Siswa`, isPositive: true, label: 'Ketetapan per bulan' }}
        />

        {/* 3. Total Pembayaran Diterima */}
        <StatCard
          title="Pembayaran Diterima"
          value={formatRupiah(monthStatus.totalDibayar)}
          subtitle={`${monthStatus.percentAmount}% dari target tagihan`}
          icon={CreditCard}
          accentColor="emerald"
          onClick={() => onNavigate('history')}
          trend={{ value: `+${monthStatus.lunas} Lunas`, isPositive: true, label: 'Kas masuk' }}
        />

        {/* 4. Total Tunggakan SPP */}
        <StatCard
          title="Total Tunggakan SPP"
          value={formatRupiah(monthStatus.totalTunggakan)}
          subtitle={`${monthStatus.belumLunas + monthStatus.sebagian} siswa belum lunas`}
          icon={AlertTriangle}
          accentColor="red"
          onClick={() => onNavigate('reports')}
          trend={{ value: `${monthStatus.sebagian} Sebagian`, isPositive: false, label: 'Perlu penagihan' }}
        />
      </div>

      {/* Financial Comparison Chart & Current Month Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                Tren Pembayaran SPP Bulanan (6 Bulan Terakhir)
              </h2>
              <p className="text-xs text-zinc-500">
                Perbandingan Total Tagihan vs Pembayaran Diterima vs Tunggakan
              </p>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
              Semester Ganjil 2026
            </span>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}jt`}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  labelStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Bar dataKey="tagihan" name="Total Tagihan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="penerimaan" name="Diterima" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tunggakan" name="Tunggakan" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ringkasan Status Pembayaran Bulan Berjalan */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                Status Pembayaran Bulan Ini
              </h2>
              <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                Oktober 2026
              </span>
            </div>

            {/* Percentage Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-700">Persentase Pelunasan:</span>
                <span className="font-black text-red-600 font-mono text-sm">
                  {monthStatus.percentAmount}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${monthStatus.percentAmount}%` }}
                  title={`Lunas: ${monthStatus.percentAmount}%`}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${Math.round((monthStatus.sebagian / (monthStatus.totalSiswa || 1)) * 100)}%` }}
                  title="Sebagian"
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${Math.max(0, 100 - monthStatus.percentAmount)}%` }}
                  title="Belum Lunas"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                {formatRupiah(monthStatus.totalDibayar)} terkumpul dari target {formatRupiah(monthStatus.totalNominal)}
              </p>
            </div>

            {/* Status Breakdown Counters */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-900">Sudah Membayar Penuh</span>
                </div>
                <span className="font-bold text-emerald-800 font-mono">
                  {monthStatus.lunas} Siswa
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-900">Membayar Sebagian (Cicil)</span>
                </div>
                <span className="font-bold text-amber-800 font-mono">
                  {monthStatus.sebagian} Siswa
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-semibold text-rose-900">Belum Membayar</span>
                </div>
                <span className="font-bold text-rose-800 font-mono">
                  {monthStatus.belumLunas} Siswa
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-100">
            <button
              onClick={() => onNavigate('invoices')}
              className="w-full py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Kelola Daftar Tagihan SPP</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Pembayaran Terbaru */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Tabel Pembayaran Terbaru
            </h2>
            <p className="text-xs text-zinc-500">
              Transaksi kas dan penerimaan SPP siswa yang baru tercatat di sistem
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportRecentPayments}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg border border-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>Lihat Semua Transaksi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 text-zinc-600 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">No Transaksi</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Bulan SPP</th>
                <th className="py-3 px-4">Jumlah Bayar</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-zinc-900">
                    {p.nomorTransaksi}
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {formatTanggalIndo(p.tanggalPembayaran)}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-600">{p.nis}</td>
                  <td className="py-3 px-4 font-semibold text-zinc-900">{p.namaSiswa}</td>
                  <td className="py-3 px-4 text-zinc-600">{p.kelas}</td>
                  <td className="py-3 px-4 text-zinc-700">{p.periodeSpp}</td>
                  <td className="py-3 px-4 font-mono font-bold text-red-600">
                    {formatRupiah(p.jumlahPembayaran)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-zinc-700">
                      {p.metodePembayaran}
                      {p.namaBank ? ` (${p.namaBank})` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Lihat & Cetak Kuitansi"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        transaction={selectedReceipt}
        settings={schoolSettings}
      />
    </div>
  );
};
