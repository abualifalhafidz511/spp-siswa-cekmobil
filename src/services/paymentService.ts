import { PaymentTransaction, PaymentMethod, BankName } from '../types';
import { storageService } from './storage';
import { calculatePaymentStatus } from '../utils/paymentStatus';

export interface CreatePaymentDTO {
  invoiceId: string;
  jumlahPembayaran: number;
  metodePembayaran: PaymentMethod;
  namaBank?: BankName;
  catatan?: string;
  kasirPetugas?: string;
}

export const paymentService = {
  getAll(): PaymentTransaction[] {
    return storageService.getPayments().sort((a, b) => 
      new Date(b.tanggalPembayaran).getTime() - new Date(a.tanggalPembayaran).getTime()
    );
  },

  getById(id: string): PaymentTransaction | undefined {
    return storageService.getPayments().find(p => p.id === id);
  },

  getByInvoiceId(invoiceId: string): PaymentTransaction[] {
    return storageService.getPayments().filter(p => p.invoiceId === invoiceId);
  },

  search(params: {
    query?: string;
    startDate?: string;
    endDate?: string;
    kelas?: string;
    metode?: PaymentMethod | 'all';
    status?: 'BERHASIL' | 'DIBATALKAN' | 'all';
    periodeSpp?: string;
  }): PaymentTransaction[] {
    let list = storageService.getPayments();

    if (params.query && params.query.trim()) {
      const q = params.query.toLowerCase().trim();
      list = list.filter(p => 
        p.nomorTransaksi.toLowerCase().includes(q) ||
        p.namaSiswa.toLowerCase().includes(q) ||
        p.nis.toLowerCase().includes(q) ||
        p.periodeSpp.toLowerCase().includes(q)
      );
    }

    if (params.kelas && params.kelas !== 'all') {
      list = list.filter(p => p.kelas === params.kelas);
    }

    if (params.metode && params.metode !== 'all') {
      list = list.filter(p => p.metodePembayaran === params.metode);
    }

    if (params.status && params.status !== 'all') {
      list = list.filter(p => p.status === params.status);
    }

    if (params.periodeSpp && params.periodeSpp !== 'all') {
      list = list.filter(p => p.periodeSpp === params.periodeSpp);
    }

    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      list = list.filter(p => new Date(p.tanggalPembayaran).getTime() >= start);
    }

    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter(p => new Date(p.tanggalPembayaran).getTime() <= end.getTime());
    }

    return list.sort((a, b) => 
      new Date(b.tanggalPembayaran).getTime() - new Date(a.tanggalPembayaran).getTime()
    );
  },

  createPayment(dto: CreatePaymentDTO): { payment: PaymentTransaction; invoiceUpdated: any } {
    if (!dto.jumlahPembayaran || dto.jumlahPembayaran <= 0) {
      throw new Error('Nominal pembayaran harus lebih dari 0.');
    }

    const invoices = storageService.getInvoices();
    const invIndex = invoices.findIndex(i => i.id === dto.invoiceId);
    if (invIndex === -1) {
      throw new Error('Data tagihan tidak ditemukan.');
    }

    const invoice = invoices[invIndex];

    if (dto.jumlahPembayaran > invoice.sisaTagihan) {
      throw new Error(
        `Nominal pembayaran (Rp ${dto.jumlahPembayaran.toLocaleString('id-ID')}) melebihi sisa tagihan (Rp ${invoice.sisaTagihan.toLocaleString('id-ID')}).`
      );
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const allPayments = storageService.getPayments();
    const trxNumber = `TRX-${yearMonth}-${String(allPayments.length + 101).padStart(5, '0')}`;

    const newJumlahDibayar = invoice.jumlahDibayar + dto.jumlahPembayaran;
    const newSisaTagihan = Math.max(0, invoice.totalTagihan - newJumlahDibayar);
    const newStatus = calculatePaymentStatus(invoice.totalTagihan, newJumlahDibayar, invoice.jatuhTempo);

    const currentUser = storageService.getCurrentUser();
    const cashierName = dto.kasirPetugas || currentUser.name || 'Bendahara Keuangan';

    const transaction: PaymentTransaction = {
      id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nomorTransaksi: trxNumber,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      nis: invoice.nis,
      namaSiswa: invoice.namaSiswa,
      kelas: invoice.kelas,
      periodeSpp: invoice.periodeFormatted,
      jumlahPembayaran: dto.jumlahPembayaran,
      metodePembayaran: dto.metodePembayaran,
      namaBank: dto.namaBank,
      catatan: dto.catatan?.trim() || undefined,
      tanggalPembayaran: nowIso,
      status: 'BERHASIL',
      kasirPetugas: cashierName,
      sisaTagihanSetelahBayar: newSisaTagihan,
      createdAt: nowIso,
    };

    // Update invoice
    invoices[invIndex] = {
      ...invoice,
      jumlahDibayar: newJumlahDibayar,
      sisaTagihan: newSisaTagihan,
      status: newStatus,
      updatedAt: nowIso,
    };

    allPayments.unshift(transaction);

    storageService.setInvoices(invoices);
    storageService.setPayments(allPayments);

    storageService.addAuditLog({
      action: 'CREATE',
      entity: 'PAYMENT',
      entityId: transaction.id,
      description: `Penerimaan SPP ${invoice.periodeFormatted} sebesar Rp ${dto.jumlahPembayaran.toLocaleString('id-ID')} untuk ${invoice.namaSiswa} (${invoice.nis}) via ${dto.metodePembayaran}. No: ${trxNumber}`,
      performedBy: cashierName,
    });

    return { payment: transaction, invoiceUpdated: invoices[invIndex] };
  },

  cancelPayment(transactionId: string, alasan: string, cancelledBy?: string): PaymentTransaction {
    if (!alasan || !alasan.trim()) {
      throw new Error('Alasan pembatalan transaksi wajib diisi untuk catatan audit.');
    }

    const allPayments = storageService.getPayments();
    const trxIndex = allPayments.findIndex(p => p.id === transactionId);
    if (trxIndex === -1) {
      throw new Error('Data transaksi tidak ditemukan.');
    }

    const targetTrx = allPayments[trxIndex];
    if (targetTrx.status === 'DIBATALKAN') {
      throw new Error('Transaksi ini sudah berstatus DIBATALKAN sebelumnya.');
    }

    const invoices = storageService.getInvoices();
    const invIndex = invoices.findIndex(i => i.id === targetTrx.invoiceId);
    if (invIndex === -1) {
      throw new Error('Tagihan terkait transaksi ini tidak ditemukan.');
    }

    const invoice = invoices[invIndex];
    const nowIso = new Date().toISOString();
    const currentUser = storageService.getCurrentUser();
    const operator = cancelledBy || currentUser.name;

    // Revert invoice balances safely
    const restoredJumlahDibayar = Math.max(0, invoice.jumlahDibayar - targetTrx.jumlahPembayaran);
    const restoredSisaTagihan = Math.min(invoice.totalTagihan, invoice.totalTagihan - restoredJumlahDibayar);
    const restoredStatus = calculatePaymentStatus(invoice.totalTagihan, restoredJumlahDibayar, invoice.jatuhTempo);

    invoices[invIndex] = {
      ...invoice,
      jumlahDibayar: restoredJumlahDibayar,
      sisaTagihan: restoredSisaTagihan,
      status: restoredStatus,
      updatedAt: nowIso,
    };

    const updatedTrx: PaymentTransaction = {
      ...targetTrx,
      status: 'DIBATALKAN',
      alasanBatal: alasan.trim(),
      dibatalkanPada: nowIso,
      dibatalkanOleh: operator,
    };

    allPayments[trxIndex] = updatedTrx;

    storageService.setInvoices(invoices);
    storageService.setPayments(allPayments);

    storageService.addAuditLog({
      action: 'CANCEL_PAYMENT',
      entity: 'PAYMENT',
      entityId: targetTrx.id,
      description: `PEMBATALAN TRANSAKSI ${targetTrx.nomorTransaksi} (${targetTrx.namaSiswa} - Rp ${targetTrx.jumlahPembayaran.toLocaleString('id-ID')}). Alasan: ${alasan.trim()}`,
      performedBy: operator,
    });

    return updatedTrx;
  }
};
