export type StudentStatus = 'aktif' | 'lulus' | 'nonaktif';
export type Gender = 'L' | 'P';

export type VocationalMajor = 
  | 'Teknik Kendaraan Ringan Otomotif'
  | 'Teknik dan Bisnis Sepeda Motor'
  | 'Teknik Bodi Otomotif'
  | 'Teknik Ototronik';

export interface Student {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  alamat: string;
  noWhatsapp: string;
  kelas: string; // e.g. "X TKRO 1", "XI TBSM 1", "XII TBO 1"
  programKeahlian: VocationalMajor;
  tanggalMasuk: string; // YYYY-MM-DD
  nominalSpp: number; // e.g. 250000
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'LUNAS' | 'DIBAYAR_SEBAGIAN' | 'BELUM_LUNAS' | 'JATUH_TEMPO';

export interface Invoice {
  id: string;
  nomorTagihan: string; // e.g. "INV-202610-001"
  studentId: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  bulan: number; // 1-12
  tahun: number; // 2026
  periodeFormatted: string; // e.g. "Oktober 2026"
  nominalTagihan: number; // original SPP amount
  potongan: number; // keringanan/diskon jika ada
  alasanPotongan?: string;
  totalTagihan: number; // nominalTagihan - potongan
  jumlahDibayar: number;
  sisaTagihan: number;
  jatuhTempo: string; // YYYY-MM-DD
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'TUNAI' | 'TRANSFER_BANK' | 'QRIS';
export type BankName = 'BCA' | 'Mandiri' | 'BRI' | 'BNI' | 'BSI';
export type TransactionStatus = 'BERHASIL' | 'DIBATALKAN';

export interface PaymentTransaction {
  id: string;
  nomorTransaksi: string; // e.g. "TRX-202610-00123"
  invoiceId: string;
  studentId: string;
  nis: string;
  namaSiswa: string;
  kelas: string;
  periodeSpp: string; // e.g. "Oktober 2026"
  jumlahPembayaran: number;
  metodePembayaran: PaymentMethod;
  namaBank?: BankName;
  catatan?: string;
  tanggalPembayaran: string; // ISO string with time
  status: TransactionStatus;
  kasirPetugas: string; // e.g. "Siti Aminah, S.Ak"
  alasanBatal?: string;
  dibatalkanPada?: string;
  dibatalkanOleh?: string;
  sisaTagihanSetelahBayar: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL_PAYMENT' | 'GENERATE_INVOICE';
  entity: 'STUDENT' | 'INVOICE' | 'PAYMENT' | 'SETTINGS';
  entityId: string;
  description: string;
  performedBy: string;
  details?: Record<string, any>;
}

export type UserRole = 'ADMIN' | 'BENDAHARA' | 'STAF_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nip: string;
  avatar?: string;
}

export interface SchoolSettings {
  namaSekolah: string;
  npsn: string;
  subjudul: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  bendaharaSekolah: string;
  nipBendahara: string;
  tahunAjaranAktif: string; // e.g. "2026/2027"
  nominalSppStandar: number; // e.g. 250000
  tanggalJatuhTempoDefault: number; // 10
  daftarKelas: string[];
  daftarProgramKeahlian: VocationalMajor[];
  metodePembayaranAktif: {
    tunai: boolean;
    transferBank: boolean;
    qris: boolean;
  };
  bankTersedia: {
    nama: BankName;
    nomorRekening: string;
    atasNama: string;
    aktif: boolean;
  }[];
  catatanKuitansi: string;
  tampilkanCapDigital: boolean;
}

export type PageView = 
  | 'dashboard'
  | 'students'
  | 'invoices'
  | 'payments'
  | 'history'
  | 'reports'
  | 'settings';
