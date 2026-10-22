import { Student, Invoice, PaymentTransaction, PaymentMethod, BankName } from '../types';
import { getNamaBulan } from '../utils/date';
import { calculatePaymentStatus } from '../utils/paymentStatus';

export interface SeedDataResult {
  invoices: Invoice[];
  payments: PaymentTransaction[];
}

export function generateSeedInvoicesAndPayments(students: Student[]): SeedDataResult {
  const invoices: Invoice[] = [];
  const payments: PaymentTransaction[] = [];

  const periods = [
    { bulan: 7, tahun: 2026, dueDay: 10, paymentRate: 0.96 }, // Juli
    { bulan: 8, tahun: 2026, dueDay: 10, paymentRate: 0.90 }, // Agustus
    { bulan: 9, tahun: 2026, dueDay: 10, paymentRate: 0.82 }, // September
    { bulan: 10, tahun: 2026, dueDay: 10, paymentRate: 0.65 }, // Oktober (Bulan Berjalan)
    { bulan: 11, tahun: 2026, dueDay: 10, paymentRate: 0.10 }, // November (Upcoming)
  ];

  const paymentMethods: PaymentMethod[] = ['TUNAI', 'TRANSFER_BANK', 'QRIS'];
  const banks: BankName[] = ['BCA', 'Mandiri', 'BRI', 'BNI'];
  const officers = ['Siti Aminah, S.Ak.', 'Fajar Nugraha, A.Md.'];

  let invoiceCounter = 1;
  let transactionCounter = 101;

  periods.forEach((period) => {
    students.forEach((student, sIdx) => {
      // Only generate for active students
      if (student.status !== 'aktif') return;

      const invId = `INV-${period.tahun}${String(period.bulan).padStart(2, '0')}-${String(invoiceCounter).padStart(4, '0')}`;
      const dueDateStr = `${period.tahun}-${String(period.bulan).padStart(2, '0')}-${String(period.dueDay).padStart(2, '0')}`;
      const nominalTagihan = student.nominalSpp;

      // Deterministic pseudo-randomness based on student index and period
      const hash = (sIdx * 37 + period.bulan * 19) % 100;
      const prob = hash / 100;

      let jumlahDibayar = 0;
      let transactionsForThisInvoice: PaymentTransaction[] = [];

      if (prob < period.paymentRate) {
        // Paid in full
        jumlahDibayar = nominalTagihan;
        const method = paymentMethods[sIdx % paymentMethods.length];
        const bank = method === 'TRANSFER_BANK' ? banks[sIdx % banks.length] : undefined;
        const officer = officers[sIdx % officers.length];
        
        // Transaction day usually 1-12 of that month
        const payDay = Math.min(28, (sIdx % 10) + 2);
        const payHour = 8 + (sIdx % 8);
        const payMinute = (sIdx * 7) % 60;
        const payDateStr = `${period.tahun}-${String(period.bulan).padStart(2, '0')}-${String(payDay).padStart(2, '0')}T${String(payHour).padStart(2, '0')}:${String(payMinute).padStart(2, '0')}:00.000Z`;

        const trxNumber = `TRX-${period.tahun}${String(period.bulan).padStart(2, '0')}-${String(transactionCounter).padStart(5, '0')}`;
        transactionCounter++;

        transactionsForThisInvoice.push({
          id: `trx-${invId}-1`,
          nomorTransaksi: trxNumber,
          invoiceId: invId,
          studentId: student.id,
          nis: student.nis,
          namaSiswa: student.nama,
          kelas: student.kelas,
          periodeSpp: `${getNamaBulan(period.bulan)} ${period.tahun}`,
          jumlahPembayaran: nominalTagihan,
          metodePembayaran: method,
          namaBank: bank,
          catatan: 'Pembayaran lunas SPP bulanan',
          tanggalPembayaran: payDateStr,
          status: 'BERHASIL',
          kasirPetugas: officer,
          sisaTagihanSetelahBayar: 0,
          createdAt: payDateStr,
        });

      } else if (prob < period.paymentRate + 0.15 && period.bulan >= 9) {
        // Partial payment (e.g., paid Rp 150.000 out of Rp 250.000)
        jumlahDibayar = 150000;
        const method = paymentMethods[(sIdx + 1) % paymentMethods.length];
        const bank = method === 'TRANSFER_BANK' ? banks[(sIdx + 1) % banks.length] : undefined;
        const officer = officers[(sIdx + 1) % officers.length];

        const payDay = Math.min(28, (sIdx % 12) + 3);
        const payDateStr = `${period.tahun}-${String(period.bulan).padStart(2, '0')}-${String(payDay).padStart(2, '0')}T10:15:00.000Z`;
        const trxNumber = `TRX-${period.tahun}${String(period.bulan).padStart(2, '0')}-${String(transactionCounter).padStart(5, '0')}`;
        transactionCounter++;

        transactionsForThisInvoice.push({
          id: `trx-${invId}-1`,
          nomorTransaksi: trxNumber,
          invoiceId: invId,
          studentId: student.id,
          nis: student.nis,
          namaSiswa: student.nama,
          kelas: student.kelas,
          periodeSpp: `${getNamaBulan(period.bulan)} ${period.tahun}`,
          jumlahPembayaran: 150000,
          metodePembayaran: method,
          namaBank: bank,
          catatan: 'Pembayaran cicilan tahap 1',
          tanggalPembayaran: payDateStr,
          status: 'BERHASIL',
          kasirPetugas: officer,
          sisaTagihanSetelahBayar: nominalTagihan - 150000,
          createdAt: payDateStr,
        });
      } else {
        // Unpaid
        jumlahDibayar = 0;
      }

      const sisaTagihan = Math.max(0, nominalTagihan - jumlahDibayar);
      const status = calculatePaymentStatus(nominalTagihan, jumlahDibayar, dueDateStr);

      invoices.push({
        id: invId,
        nomorTagihan: invId,
        studentId: student.id,
        nis: student.nis,
        namaSiswa: student.nama,
        kelas: student.kelas,
        bulan: period.bulan,
        tahun: period.tahun,
        periodeFormatted: `${getNamaBulan(period.bulan)} ${period.tahun}`,
        nominalTagihan,
        potongan: 0,
        totalTagihan: nominalTagihan,
        jumlahDibayar,
        sisaTagihan,
        jatuhTempo: dueDateStr,
        status,
        createdAt: `${period.tahun}-${String(period.bulan).padStart(2, '0')}-01T07:00:00.000Z`,
        updatedAt: `${period.tahun}-${String(period.bulan).padStart(2, '0')}-15T12:00:00.000Z`,
      });

      transactionsForThisInvoice.forEach((t) => payments.push(t));
      invoiceCounter++;
    });
  });

  // Add 1 or 2 cancelled transactions for audit trail demo
  if (payments.length > 5) {
    const cancelledTrx = { ...payments[3] };
    cancelledTrx.id = `trx-cancelled-001`;
    cancelledTrx.nomorTransaksi = `TRX-202609-99901`;
    cancelledTrx.status = 'DIBATALKAN' as const;
    cancelledTrx.alasanBatal = 'Koreksi kesalahan input jumlah nominal transfer oleh bendahara';
    cancelledTrx.dibatalkanPada = '2026-09-18T14:22:00.000Z';
    cancelledTrx.dibatalkanOleh = 'Siti Aminah, S.Ak.';
    payments.unshift(cancelledTrx);
  }

  return { invoices, payments };
}
