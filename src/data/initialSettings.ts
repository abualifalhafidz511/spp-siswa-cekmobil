import { SchoolSettings, UserProfile } from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  namaSekolah: 'SMK Otomotif Cekmobil',
  npsn: '20268901',
  subjudul: 'Administrasi Keuangan Siswa SMK Otomotif Cekmobil',
  alamat: 'Jl. Raya Industri Otomotif No. 88, Kawasan Pendidikan Terpadu, Jakarta Timur 13450',
  telepon: '(021) 8892-0451 / 0812-9988-7766',
  email: 'spp@smkotomotif-cekmobil.sch.id',
  website: 'www.cekmobil.id',
  kepalaSekolah: 'Drs. H. Bambang Soedirman, M.T.',
  bendaharaSekolah: 'Siti Aminah, S.Ak.',
  nipBendahara: '19840912 201001 2 008',
  tahunAjaranAktif: '2026/2027',
  nominalSppStandar: 250000,
  tanggalJatuhTempoDefault: 10,
  daftarKelas: [
    'X TKRO 1',
    'X TKRO 2',
    'X TBSM 1',
    'X TBO 1',
    'XI TKRO 1',
    'XI TKRO 2',
    'XI TBSM 1',
    'XI TBO 1',
    'XII TKRO 1',
    'XII TKRO 2',
    'XII TBSM 1',
    'XII TBO 1',
  ],
  daftarProgramKeahlian: [
    'Teknik Kendaraan Ringan Otomotif',
    'Teknik dan Bisnis Sepeda Motor',
    'Teknik Bodi Otomotif',
    'Teknik Ototronik',
  ],
  metodePembayaranAktif: {
    tunai: true,
    transferBank: true,
    qris: true,
  },
  bankTersedia: [
    {
      nama: 'BCA',
      nomorRekening: '8820-192-888',
      atasNama: 'YAYASAN PENDIDIKAN CEKMOBIL',
      aktif: true,
    },
    {
      nama: 'Mandiri',
      nomorRekening: '157-00-998877-2',
      atasNama: 'SMK OTOMOTIF CEKMOBIL SPP',
      aktif: true,
    },
    {
      nama: 'BRI',
      nomorRekening: '0421-01-002931-50-8',
      atasNama: 'SMK CEKMOBIL KAS KEUANGAN',
      aktif: true,
    },
    {
      nama: 'BNI',
      nomorRekening: '089-234-8891',
      atasNama: 'SMK OTOMOTIF CEKMOBIL',
      aktif: true,
    },
  ],
  catatanKuitansi: 'Kuitansi ini adalah bukti pembayaran SPP yang sah. Simpan bukti ini untuk verifikasi kartu ujian semester.',
  tampilkanCapDigital: true,
};

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'Raden Mas Haryo, S.Kom',
    email: 'admin@cekmobil.id',
    role: 'ADMIN',
    nip: '19790214 200501 1 003',
  },
  {
    id: 'user-bendahara',
    name: 'Siti Aminah, S.Ak.',
    email: 'bendahara@cekmobil.id',
    role: 'BENDAHARA',
    nip: '19840912 201001 2 008',
  },
  {
    id: 'user-staf',
    name: 'Fajar Nugraha, A.Md.',
    email: 'staf.admin@cekmobil.id',
    role: 'STAF_ADMIN',
    nip: '19920518 201802 1 004',
  },
];
