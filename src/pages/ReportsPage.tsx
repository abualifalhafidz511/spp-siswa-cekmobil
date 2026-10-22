import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  Printer,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { PageView } from '../types';
import { reportService, ReportType } from '../services/reportService';
import { formatRupiah } from '../utils/currency';
import { getNamaBulan } from '../utils/date';
import { exportToCsv } from '../utils/csv';
import { INITIAL_SCHOOL_SETTINGS } from '../data/initialSettings';

interface ReportsPageProps {
  onNavigate: (page: PageView) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const [reportType, setReportType] = useState<ReportType>('PENERIMAAN_BULANAN');
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [bulanFilter, setBulanFilter] = useState<number | 'all'>(10);
  const [tahunFilter, setTahunFilter] = useState<number | 'all'>(2026);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportFilter = useMemo(() => ({
    reportType,
    kelas: kelasFilter,
    bulan: bulanFilter,
    tahun: tahunFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [reportType, kelasFilter, bulanFilter, tahunFilter, startDate, endDate]);

  const metrics = useMemo(() => {
    return reportService.getSummaryMetrics(reportFilter);
  }, [reportFilter]);

  const reportData = useMemo(() => {
    return reportService.generateReportData(reportFilter);
  }, [reportFilter]);

  const handleExportCsv = () => {
    const filename = `laporan_${reportType.toLowerCase()}_cekmobil`;
    exportToCsv(filename, reportData.headers, reportData.rows);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportTypeOptions: { id: ReportType; label: string }[] = [
    { id: 'PENERIMAAN_BULANAN', label: '1. Penerimaan SPP Bulanan' },
    { id: 'PENERIMAAN_HARIAN', label: '2. Penerimaan SPP Harian' },
    { id: 'PENERIMAAN_TAHUNAN', label: '3. Penerimaan SPP Tahunan' },
    { id: 'TUNGGAKAN_SISWA', label: '4. Tunggakan per Siswa' },
    { id: 'TUNGGAKAN_KELAS', label: '5. Tunggakan per Kelas' },
    { id: 'STATUS_SISWA', label: '6. Status Siswa (Lunas vs Belum)' },
    { id: 'METODE_PEMBAYARAN', label: '7. Berdasarkan Metode Bayar' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-600" />
            <span>Laporan Keuangan & Akuntabilitas SPP</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Rekapitulasi penerimaan kas, buku tunggakan, dan evaluasi persentase kelunasan siswa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs space-y-4 no-print">
        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Pilih Jenis Laporan Keuangan:
          </label>
          <div className="flex flex-wrap gap-2">
            {reportTypeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setReportType(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  reportType === opt.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-zinc-100">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Filter Kelas</label>
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
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

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Filter Periode Bulan</label>
            <select
              value={bulanFilter}
              onChange={(e) => setBulanFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
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

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Filter Tahun</label>
            <select
              value={tahunFilter}
              onChange={(e) => setTahunFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Tahun</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Mulai Tanggal Bayar</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Total Tagihan
          </p>
          <h4 className="text-lg font-bold font-mono text-zinc-900 mt-1">
            {formatRupiah(metrics.totalTagihan)}
          </h4>
          <p className="text-[10px] text-zinc-400 mt-0.5">Basis data filter aktif</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Total Penerimaan
          </p>
          <h4 className="text-lg font-bold font-mono text-emerald-900 mt-1">
            {formatRupiah(metrics.totalPenerimaan)}
          </h4>
          <p className="text-[10px] text-emerald-700 mt-0.5">{metrics.jumlahTransaksi} transaksi tercatat</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
            Total Tunggakan
          </p>
          <h4 className="text-lg font-bold font-mono text-rose-900 mt-1">
            {formatRupiah(metrics.totalTunggakan)}
          </h4>
          <p className="text-[10px] text-rose-700 mt-0.5">Sisa saldo belum bayar</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Siswa Lunas
          </p>
          <h4 className="text-lg font-bold font-mono text-emerald-600 mt-1">
            {metrics.jumlahSiswaLunas} Siswa
          </h4>
          <p className="text-[10px] text-zinc-400 mt-0.5">Status lunas penuh</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Rasio Kelunasan
          </p>
          <h4 className="text-lg font-black font-mono text-red-600 mt-1">
            {metrics.rasioPembayaranPercent}%
          </h4>
          <p className="text-[10px] text-zinc-400 mt-0.5">Capaian target kas</p>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div id="printable-receipt" className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6">
        {/* Document Header */}
        <div className="pb-6 mb-6 border-b-2 border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
              {reportData.title}
            </h2>
            <p className="text-xs text-zinc-600 font-semibold mt-0.5">
              SMK OTOMOTIF CEKMOBIL • TAHUN AJARAN 2026/2027
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Filter: Kelas ({kelasFilter === 'all' ? 'Semua' : kelasFilter}) • Bulan ({bulanFilter === 'all' ? 'Semua' : getNamaBulan(Number(bulanFilter))}) • Tahun ({tahunFilter})
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 block">
              Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </span>
            <span className="text-[10px] font-semibold text-zinc-600">
              Otoritas Keuangan: Siti Aminah, S.Ak. (Bendahara)
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-zinc-200">
            <thead className="bg-zinc-100 text-zinc-900 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3 border-r border-zinc-200 w-12 text-center">No</th>
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3 border-r border-zinc-200 last:border-r-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length + 1} className="py-8 text-center text-zinc-400">
                    Tidak ada baris data untuk kriteria laporan ini.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50/60">
                    <td className="py-2.5 px-3 text-center text-zinc-500 font-mono border-r border-zinc-200">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => {
                      const isMoney = typeof cell === 'number' && cell > 1000;
                      return (
                        <td
                          key={cIdx}
                          className={`py-2.5 px-3 border-r border-zinc-200 last:border-r-0 ${
                            isMoney ? 'font-mono font-semibold text-zinc-900' : 'text-zinc-700'
                          }`}
                        >
                          {isMoney ? formatRupiah(cell as number) : String(cell)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Report Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-zinc-200 text-xs">
          <div className="text-zinc-500 text-[11px]">
            <p className="font-semibold text-zinc-800">Mengetahui,</p>
            <p>Kepala SMK Otomotif Cekmobil</p>
            <div className="h-16" />
            <p className="font-bold text-zinc-900 underline">Drs. H. Bambang Soedirman, M.T.</p>
            <p className="text-[10px]">NIP. 19680512 199403 1 004</p>
          </div>

          <div className="text-right text-zinc-500 text-[11px]">
            <p className="font-semibold text-zinc-800">Dibuat Oleh,</p>
            <p>Bendahara Penerimaan SPP</p>
            <div className="h-16" />
            <p className="font-bold text-zinc-900 underline">Siti Aminah, S.Ak.</p>
            <p className="text-[10px]">NIP. 19840912 201001 2 008</p>
          </div>
        </div>
      </div>
    </div>
  );
};
