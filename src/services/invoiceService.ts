import { Invoice, PaymentStatus } from '../types';
import { storageService } from './storage';
import { getNamaBulan } from '../utils/date';
import { calculatePaymentStatus } from '../utils/paymentStatus';

export const invoiceService = {
  getAll(): Invoice[] {
    return storageService.getInvoices();
  },

  getById(id: string): Invoice | undefined {
    return storageService.getInvoices().find(inv => inv.id === id);
  },

  getByStudentId(studentId: string): Invoice[] {
    return storageService.getInvoices().filter(inv => inv.studentId === studentId);
  },

  getUnpaidByStudentId(studentId: string): Invoice[] {
    return storageService.getInvoices().filter(
      inv => inv.studentId === studentId && inv.status !== 'LUNAS' && inv.sisaTagihan > 0
    );
  },

  search(
    query: string,
    statusFilter?: PaymentStatus | 'all',
    kelasFilter?: string,
    bulanFilter?: number | 'all',
    tahunFilter?: number | 'all'
  ): Invoice[] {
    let list = storageService.getInvoices();

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(inv => 
        inv.namaSiswa.toLowerCase().includes(q) ||
        inv.nis.toLowerCase().includes(q) ||
        inv.nomorTagihan.toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(inv => inv.status === statusFilter);
    }

    if (kelasFilter && kelasFilter !== 'all') {
      list = list.filter(inv => inv.kelas === kelasFilter);
    }

    if (bulanFilter && bulanFilter !== 'all') {
      list = list.filter(inv => inv.bulan === bulanFilter);
    }

    if (tahunFilter && tahunFilter !== 'all') {
      list = list.filter(inv => inv.tahun === tahunFilter);
    }

    // Sort by year and month descending, then by name
    return list.sort((a, b) => {
      if (b.tahun !== a.tahun) return b.tahun - a.tahun;
      if (b.bulan !== a.bulan) return b.bulan - a.bulan;
      return a.namaSiswa.localeCompare(b.namaSiswa);
    });
  },

  generateBulk(params: {
    bulan: number;
    tahun: number;
    kelasFilter?: string; // 'all' or specific class
    jatuhTempo: string; // YYYY-MM-DD
    nominalOverride?: number;
  }): { generated: number; skippedDuplicates: number; totalStudentsChecked: number } {
    const allStudents = storageService.getStudents();
    const existingInvoices = storageService.getInvoices();

    // Filter target students (active only)
    let targets = allStudents.filter(s => s.status === 'aktif');
    if (params.kelasFilter && params.kelasFilter !== 'all') {
      targets = targets.filter(s => s.kelas === params.kelasFilter);
    }

    let generated = 0;
    let skippedDuplicates = 0;
    const newInvoices: Invoice[] = [];

    const nowStr = new Date().toISOString();
    let counterSeed = existingInvoices.length + 1;

    targets.forEach(student => {
      // Duplicate prevention rule: check same student + same month + same year
      const alreadyExists = existingInvoices.some(
        inv => inv.studentId === student.id && inv.bulan === params.bulan && inv.tahun === params.tahun
      );

      if (alreadyExists) {
        skippedDuplicates++;
        return;
      }

      const nominal = params.nominalOverride && params.nominalOverride > 0
        ? params.nominalOverride
        : student.nominalSpp;

      const invNumber = `INV-${params.tahun}${String(params.bulan).padStart(2, '0')}-${String(counterSeed).padStart(4, '0')}`;
      counterSeed++;

      const newInv: Invoice = {
        id: invNumber,
        nomorTagihan: invNumber,
        studentId: student.id,
        nis: student.nis,
        namaSiswa: student.nama,
        kelas: student.kelas,
        bulan: params.bulan,
        tahun: params.tahun,
        periodeFormatted: `${getNamaBulan(params.bulan)} ${params.tahun}`,
        nominalTagihan: nominal,
        potongan: 0,
        totalTagihan: nominal,
        jumlahDibayar: 0,
        sisaTagihan: nominal,
        jatuhTempo: params.jatuhTempo,
        status: calculatePaymentStatus(nominal, 0, params.jatuhTempo),
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      newInvoices.push(newInv);
      generated++;
    });

    if (newInvoices.length > 0) {
      storageService.setInvoices([...existingInvoices, ...newInvoices]);

      storageService.addAuditLog({
        action: 'GENERATE_INVOICE',
        entity: 'INVOICE',
        entityId: `bulk-${params.bulan}-${params.tahun}`,
        description: `Generate tagihan SPP ${getNamaBulan(params.bulan)} ${params.tahun} untuk ${generated} siswa (${params.kelasFilter === 'all' ? 'Semua Kelas' : params.kelasFilter}). Duplikat diabaikan: ${skippedDuplicates}.`,
        performedBy: storageService.getCurrentUser().name,
      });
    }

    return {
      generated,
      skippedDuplicates,
      totalStudentsChecked: targets.length,
    };
  },

  applyDiscount(invoiceId: string, potongan: number, alasan: string): Invoice {
    const invoices = storageService.getInvoices();
    const index = invoices.findIndex(i => i.id === invoiceId);
    if (index === -1) throw new Error('Tagihan tidak ditemukan');

    const inv = invoices[index];
    const newTotal = Math.max(0, inv.nominalTagihan - potongan);
    const newSisa = Math.max(0, newTotal - inv.jumlahDibayar);

    const updated: Invoice = {
      ...inv,
      potongan,
      alasanPotongan: alasan,
      totalTagihan: newTotal,
      sisaTagihan: newSisa,
      status: calculatePaymentStatus(newTotal, inv.jumlahDibayar, inv.jatuhTempo),
      updatedAt: new Date().toISOString(),
    };

    invoices[index] = updated;
    storageService.setInvoices(invoices);

    storageService.addAuditLog({
      action: 'UPDATE',
      entity: 'INVOICE',
      entityId: invoiceId,
      description: `Keringanan SPP Rp ${potongan} untuk ${inv.namaSiswa} (${inv.periodeFormatted}). Alasan: ${alasan}`,
      performedBy: storageService.getCurrentUser().name,
    });

    return updated;
  }
};
