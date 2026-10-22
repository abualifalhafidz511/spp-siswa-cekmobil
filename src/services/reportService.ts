import { Invoice, PaymentTransaction } from '../types';
import { storageService } from './storage';
import { getNamaBulan } from '../utils/date';

export type ReportType =
  | 'PENERIMAAN_HARIAN'
  | 'PENERIMAAN_BULANAN'
  | 'PENERIMAAN_TAHUNAN'
  | 'TUNGGAKAN_SISWA'
  | 'TUNGGAKAN_KELAS'
  | 'STATUS_SISWA'
  | 'METODE_PEMBAYARAN';

export interface ReportFilter {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  bulan?: number | 'all';
  tahun?: number | 'all';
  kelas?: string | 'all';
}

export interface ReportSummaryMetrics {
  totalTagihan: number;
  totalPenerimaan: number;
  totalTunggakan: number;
  jumlahTransaksi: number;
  jumlahSiswaLunas: number;
  jumlahSiswaBelumLunas: number;
  rasioPembayaranPercent: number;
}

export const reportService = {
  getSummaryMetrics(filter: ReportFilter): ReportSummaryMetrics {
    const invoices = storageService.getInvoices();
    const payments = storageService.getPayments().filter(p => p.status === 'BERHASIL');

    // Filter invoices by class, month, year
    let filteredInvoices = invoices;
    if (filter.kelas && filter.kelas !== 'all') {
      filteredInvoices = filteredInvoices.filter(i => i.kelas === filter.kelas);
    }
    if (filter.bulan && filter.bulan !== 'all') {
      filteredInvoices = filteredInvoices.filter(i => i.bulan === filter.bulan);
    }
    if (filter.tahun && filter.tahun !== 'all') {
      filteredInvoices = filteredInvoices.filter(i => i.tahun === filter.tahun);
    }

    // Filter payments by date range or class
    let filteredPayments = payments;
    if (filter.kelas && filter.kelas !== 'all') {
      filteredPayments = filteredPayments.filter(p => p.kelas === filter.kelas);
    }
    if (filter.startDate) {
      const start = new Date(filter.startDate).getTime();
      filteredPayments = filteredPayments.filter(p => new Date(p.tanggalPembayaran).getTime() >= start);
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
      filteredPayments = filteredPayments.filter(p => new Date(p.tanggalPembayaran).getTime() <= end.getTime());
    }

    const totalTagihan = filteredInvoices.reduce((sum, inv) => sum + inv.totalTagihan, 0);
    const totalPenerimaan = filteredPayments.reduce((sum, p) => sum + p.jumlahPembayaran, 0);
    const totalTunggakan = filteredInvoices.reduce((sum, inv) => sum + inv.sisaTagihan, 0);
    const jumlahTransaksi = filteredPayments.length;

    const studentStatusMap = new Map<string, { totalSisa: number }>();
    filteredInvoices.forEach(inv => {
      const cur = studentStatusMap.get(inv.studentId) || { totalSisa: 0 };
      cur.totalSisa += inv.sisaTagihan;
      studentStatusMap.set(inv.studentId, cur);
    });

    let jumlahSiswaLunas = 0;
    let jumlahSiswaBelumLunas = 0;
    studentStatusMap.forEach((val) => {
      if (val.totalSisa === 0) {
        jumlahSiswaLunas++;
      } else {
        jumlahSiswaBelumLunas++;
      }
    });

    const rasioPembayaranPercent = totalTagihan > 0
      ? Math.round(((totalTagihan - totalTunggakan) / totalTagihan) * 100)
      : 0;

    return {
      totalTagihan,
      totalPenerimaan,
      totalTunggakan,
      jumlahTransaksi,
      jumlahSiswaLunas,
      jumlahSiswaBelumLunas,
      rasioPembayaranPercent,
    };
  },

  // Generates 6-month historical chart data for Dashboard
  getMonthlyTrends() {
    const invoices = storageService.getInvoices();
    const payments = storageService.getPayments().filter(p => p.status === 'BERHASIL');

    const monthList = [
      { bulan: 7, tahun: 2026, label: 'Juli 26' },
      { bulan: 8, tahun: 2026, label: 'Agu 26' },
      { bulan: 9, tahun: 2026, label: 'Sep 26' },
      { bulan: 10, tahun: 2026, label: 'Okt 26' },
      { bulan: 11, tahun: 2026, label: 'Nov 26' },
      { bulan: 12, tahun: 2026, label: 'Des 26' },
    ];

    return monthList.map(m => {
      const mInvoices = invoices.filter(i => i.bulan === m.bulan && i.tahun === m.tahun);
      const mTagihan = mInvoices.reduce((sum, i) => sum + i.totalTagihan, 0);
      const mTunggakan = mInvoices.reduce((sum, i) => sum + i.sisaTagihan, 0);

      // Payments made in that month
      const mPenerimaan = payments.filter(p => {
        const d = new Date(p.tanggalPembayaran);
        return d.getMonth() + 1 === m.bulan && d.getFullYear() === m.tahun;
      }).reduce((sum, p) => sum + p.jumlahPembayaran, 0);

      return {
        bulan: m.label,
        tagihan: mTagihan,
        penerimaan: mPenerimaan,
        tunggakan: mTunggakan,
      };
    });
  },

  // Generates current month breakdown for dashboard pie/summary
  getCurrentMonthStatus(bulan: number = 10, tahun: number = 2026) {
    const invoices = storageService.getInvoices().filter(i => i.bulan === bulan && i.tahun === tahun);
    
    let lunas = 0;
    let belumLunas = 0;
    let sebagian = 0;
    let totalNominal = 0;
    let totalDibayar = 0;

    invoices.forEach(i => {
      totalNominal += i.totalTagihan;
      totalDibayar += i.jumlahDibayar;
      if (i.status === 'LUNAS') lunas++;
      else if (i.status === 'DIBAYAR_SEBAGIAN') sebagian++;
      else belumLunas++;
    });

    const totalInvoices = invoices.length || 1;
    const percentLunas = Math.round((lunas / totalInvoices) * 100);
    const percentAmount = totalNominal > 0 ? Math.round((totalDibayar / totalNominal) * 100) : 0;

    return {
      bulanNama: getNamaBulan(bulan),
      tahun,
      totalSiswa: invoices.length,
      lunas,
      belumLunas,
      sebagian,
      percentLunas,
      percentAmount,
      totalNominal,
      totalDibayar,
      totalTunggakan: Math.max(0, totalNominal - totalDibayar),
    };
  },

  // Generates row-level data for the 7 report types
  generateReportData(filter: ReportFilter): {
    headers: string[];
    rows: (string | number)[][];
    title: string;
  } {
    const invoices = storageService.getInvoices();
    const payments = storageService.getPayments().filter(p => p.status === 'BERHASIL');

    switch (filter.reportType) {
      case 'PENERIMAAN_HARIAN': {
        // Group payments by date (YYYY-MM-DD)
        const dailyMap = new Map<string, { count: number; tunai: number; bank: number; qris: number; total: number }>();
        payments.forEach(p => {
          const dateStr = p.tanggalPembayaran.split('T')[0];
          const cur = dailyMap.get(dateStr) || { count: 0, tunai: 0, bank: 0, qris: 0, total: 0 };
          cur.count++;
          cur.total += p.jumlahPembayaran;
          if (p.metodePembayaran === 'TUNAI') cur.tunai += p.jumlahPembayaran;
          else if (p.metodePembayaran === 'TRANSFER_BANK') cur.bank += p.jumlahPembayaran;
          else if (p.metodePembayaran === 'QRIS') cur.qris += p.jumlahPembayaran;
          dailyMap.set(dateStr, cur);
        });

        const sortedDates = Array.from(dailyMap.keys()).sort().reverse();
        return {
          title: 'Laporan Penerimaan SPP Harian',
          headers: ['Tanggal', 'Jumlah Transaksi', 'Penerimaan Tunai', 'Transfer Bank', 'QRIS', 'Total Penerimaan'],
          rows: sortedDates.map(d => {
            const row = dailyMap.get(d)!;
            return [d, row.count, row.tunai, row.bank, row.qris, row.total];
          })
        };
      }

      case 'PENERIMAAN_BULANAN': {
        const monthlyMap = new Map<string, { count: number; total: number }>();
        payments.forEach(p => {
          const d = new Date(p.tanggalPembayaran);
          const key = `${getNamaBulan(d.getMonth() + 1)} ${d.getFullYear()}`;
          const cur = monthlyMap.get(key) || { count: 0, total: 0 };
          cur.count++;
          cur.total += p.jumlahPembayaran;
          monthlyMap.set(key, cur);
        });

        return {
          title: 'Laporan Penerimaan SPP Bulanan',
          headers: ['Bulan & Tahun', 'Jumlah Transaksi', 'Total Penerimaan (Rp)'],
          rows: Array.from(monthlyMap.entries()).map(([month, data]) => [month, data.count, data.total])
        };
      }

      case 'PENERIMAAN_TAHUNAN': {
        const yearlyMap = new Map<number, { count: number; total: number }>();
        payments.forEach(p => {
          const year = new Date(p.tanggalPembayaran).getFullYear();
          const cur = yearlyMap.get(year) || { count: 0, total: 0 };
          cur.count++;
          cur.total += p.jumlahPembayaran;
          yearlyMap.set(year, cur);
        });

        return {
          title: 'Laporan Penerimaan SPP Tahunan',
          headers: ['Tahun Kalender', 'Jumlah Transaksi', 'Total Penerimaan (Rp)'],
          rows: Array.from(yearlyMap.entries()).map(([year, data]) => [year, data.count, data.total])
        };
      }

      case 'TUNGGAKAN_SISWA': {
        const studentMap = new Map<string, { nis: string; nama: string; kelas: string; unpaidCount: number; totalTunggakan: number }>();
        invoices.filter(i => i.sisaTagihan > 0).forEach(inv => {
          const cur = studentMap.get(inv.studentId) || {
            nis: inv.nis,
            nama: inv.namaSiswa,
            kelas: inv.kelas,
            unpaidCount: 0,
            totalTunggakan: 0
          };
          cur.unpaidCount++;
          cur.totalTunggakan += inv.sisaTagihan;
          studentMap.set(inv.studentId, cur);
        });

        const sorted = Array.from(studentMap.values()).sort((a, b) => b.totalTunggakan - a.totalTunggakan);
        return {
          title: 'Laporan Tunggakan SPP per Siswa',
          headers: ['NIS', 'Nama Siswa', 'Kelas', 'Bulan Menunggak', 'Total Tunggakan (Rp)'],
          rows: sorted.map(s => [s.nis, s.nama, s.kelas, `${s.unpaidCount} Bulan`, s.totalTunggakan])
        };
      }

      case 'TUNGGAKAN_KELAS': {
        const classMap = new Map<string, { totalTagihan: number; totalBayar: number; totalTunggakan: number; countSiswa: number }>();
        invoices.forEach(inv => {
          const cur = classMap.get(inv.kelas) || { totalTagihan: 0, totalBayar: 0, totalTunggakan: 0, countSiswa: 0 };
          cur.totalTagihan += inv.totalTagihan;
          cur.totalBayar += inv.jumlahDibayar;
          cur.totalTunggakan += inv.sisaTagihan;
          classMap.set(inv.kelas, cur);
        });

        const sorted = Array.from(classMap.entries()).sort((a, b) => b[1].totalTunggakan - a[1].totalTunggakan);
        return {
          title: 'Laporan Tunggakan SPP per Kelas',
          headers: ['Kelas', 'Total Tagihan', 'Total Dibayar', 'Total Tunggakan', 'Tingkat Pelunasan (%)'],
          rows: sorted.map(([cls, data]) => {
            const pct = data.totalTagihan > 0 ? Math.round((data.totalBayar / data.totalTagihan) * 100) : 0;
            return [cls, data.totalTagihan, data.totalBayar, data.totalTunggakan, `${pct}%`];
          })
        };
      }

      case 'STATUS_SISWA': {
        // Status of students for selected month
        const targetBulan = typeof filter.bulan === 'number' ? filter.bulan : 10;
        const targetTahun = typeof filter.tahun === 'number' ? filter.tahun : 2026;
        const monthInvoices = invoices.filter(i => i.bulan === targetBulan && i.tahun === targetTahun);

        return {
          title: `Laporan Kelunasan Siswa Bulan ${getNamaBulan(targetBulan)} ${targetTahun}`,
          headers: ['NIS', 'Nama Siswa', 'Kelas', 'Total Tagihan', 'Jumlah Dibayar', 'Sisa Tagihan', 'Status'],
          rows: monthInvoices.map(i => [
            i.nis,
            i.namaSiswa,
            i.kelas,
            i.totalTagihan,
            i.jumlahDibayar,
            i.sisaTagihan,
            i.status
          ])
        };
      }

      case 'METODE_PEMBAYARAN': {
        const methodMap = new Map<string, { count: number; total: number }>();
        payments.forEach(p => {
          const cur = methodMap.get(p.metodePembayaran) || { count: 0, total: 0 };
          cur.count++;
          cur.total += p.jumlahPembayaran;
          methodMap.set(p.metodePembayaran, cur);
        });

        return {
          title: 'Laporan Transaksi Berdasarkan Metode Pembayaran',
          headers: ['Metode Pembayaran', 'Jumlah Transaksi', 'Total Nominal (Rp)'],
          rows: Array.from(methodMap.entries()).map(([m, data]) => [m, data.count, data.total])
        };
      }

      default:
        return { title: 'Laporan', headers: [], rows: [] };
    }
  }
};
