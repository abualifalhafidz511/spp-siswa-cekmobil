import { Student, VocationalMajor } from '../types';

const FIRST_NAMES_MALE = [
  'Aditya', 'Agung', 'Ahmad', 'Aldo', 'Andi', 'Arif', 'Bagus', 'Bayu', 'Bima', 'Bintang',
  'Danang', 'Dedi', 'Dimas', 'Eko', 'Fadhil', 'Fajar', 'Galih', 'Gilang', 'Hafizh', 'Hendra',
  'Ilham', 'Indra', 'Joko', 'Kevin', 'Krisna', 'Muhammad', 'Naufal', 'Panji', 'Prasetyo', 'Raditya',
  'Rafi', 'Reza', 'Rian', 'Rifqi', 'Rizky', 'Satria', 'Surya', 'Taufik', 'Wahyu', 'Yoga'
];

const FIRST_NAMES_FEMALE = [
  'Annisa', 'Aulia', 'Citra', 'Dina', 'Fadilah', 'Fitri', 'Indah', 'Lestari', 'Maya', 'Nabila',
  'Nurul', 'Putri', 'Rahma', 'Rina', 'Sari', 'Siti', 'Tri', 'Wulandari', 'Yuni', 'Zahra'
];

const LAST_NAMES = [
  'Pratama', 'Saputra', 'Kusuma', 'Hidayat', 'Wibowo', 'Santoso', 'Nugroho', 'Setiawan',
  'Siregar', 'Lubis', 'Pangestu', 'Kurniawan', 'Ramadhan', 'Firmansyah', 'Wijaya', 'Utomo',
  'Subekti', 'Hakim', 'Mahendra', 'Gunawan', 'Suryono', 'Wardhana', 'Fauzi', 'Permana'
];

const CITIES = ['Jakarta', 'Bekasi', 'Depok', 'Tangerang', 'Bogor', 'Karawang', 'Bandung'];

const STREETS = [
  'Jl. Melati No. ', 'Jl. Mawar No. ', 'Jl. Kenanga No. ', 'Jl. Garuda No. ',
  'Jl. Merpati No. ', 'Jl. Pahlawan No. ', 'Jl. Pemuda No. ', 'Jl. Veteran No. ',
  'Jl. Flamboyan No. ', 'Jl. Dahlia No. '
];

const CLASS_CONFIGS: { kelas: string; program: VocationalMajor; tingkat: number }[] = [
  { kelas: 'X TKRO 1', program: 'Teknik Kendaraan Ringan Otomotif', tingkat: 10 },
  { kelas: 'X TKRO 2', program: 'Teknik Kendaraan Ringan Otomotif', tingkat: 10 },
  { kelas: 'X TBSM 1', program: 'Teknik dan Bisnis Sepeda Motor', tingkat: 10 },
  { kelas: 'X TBO 1', program: 'Teknik Bodi Otomotif', tingkat: 10 },
  
  { kelas: 'XI TKRO 1', program: 'Teknik Kendaraan Ringan Otomotif', tingkat: 11 },
  { kelas: 'XI TKRO 2', program: 'Teknik Kendaraan Ringan Otomotif', tingkat: 11 },
  { kelas: 'XI TBSM 1', program: 'Teknik dan Bisnis Sepeda Motor', tingkat: 11 },
  { kelas: 'XI TBO 1', program: 'Teknik Bodi Otomotif', tingkat: 11 },
  
  { kelas: 'XII TKRO 1', program: 'Teknik Kendaraan Ringan Otomotif', tingkat: 12 },
  { kelas: 'XII TKRO 2', program: 'Teknik Kendaraan Ringan Otomotif', tingkat: 12 },
  { kelas: 'XII TBSM 1', program: 'Teknik dan Bisnis Sepeda Motor', tingkat: 12 },
  { kelas: 'XII TBO 1', program: 'Teknik Bodi Otomotif', tingkat: 12 },
];

export function generateInitialStudents(): Student[] {
  const students: Student[] = [];
  let studentCounter = 1;

  CLASS_CONFIGS.forEach((cfg) => {
    // 10 students per class -> 120 students total
    for (let i = 1; i <= 10; i++) {
      const isFemale = (i % 6 === 0); // Mostly male in automotive vocational school, some female
      const firstName = isFemale
        ? FIRST_NAMES_FEMALE[(studentCounter * 3) % FIRST_NAMES_FEMALE.length]
        : FIRST_NAMES_MALE[(studentCounter * 7) % FIRST_NAMES_MALE.length];
      const lastName = LAST_NAMES[(studentCounter * 5) % LAST_NAMES.length];
      const nama = `${firstName} ${lastName}`;
      
      const yearPrefix = cfg.tingkat === 10 ? '26' : cfg.tingkat === 11 ? '25' : '24';
      const nis = `${yearPrefix}${String(studentCounter).padStart(4, '0')}`;
      
      const city = CITIES[(studentCounter * 2) % CITIES.length];
      const birthYear = cfg.tingkat === 10 ? 2010 : cfg.tingkat === 11 ? 2009 : 2008;
      const birthMonth = String((studentCounter % 12) + 1).padStart(2, '0');
      const birthDay = String((studentCounter % 27) + 1).padStart(2, '0');
      const tanggalLahir = `${birthYear}-${birthMonth}-${birthDay}`;
      
      const street = STREETS[studentCounter % STREETS.length];
      const houseNum = (studentCounter % 90) + 10;
      const alamat = `${street}${houseNum}, RT 0${(studentCounter % 5) + 1}/RW 0${(studentCounter % 4) + 1}, ${city}`;

      const phoneSuffix = String(10000000 + (studentCounter * 8371)).slice(0, 8);
      const noWhatsapp = `0812${phoneSuffix}`;

      const entryYear = cfg.tingkat === 10 ? 2026 : cfg.tingkat === 11 ? 2025 : 2024;
      const tanggalMasuk = `${entryYear}-07-15`;

      // 5% of students have special scholarship/discounted SPP (e.g. Rp 200.000), rest 250.000
      const nominalSpp = studentCounter % 20 === 0 ? 200000 : 250000;

      // Status: 116 active, 2 nonaktif, 2 lulus (or all 120 active as requested)
      const status = studentCounter === 119 ? 'nonaktif' : 'aktif';

      students.push({
        id: `std-${nis}`,
        nis,
        nama,
        jenisKelamin: isFemale ? 'P' : 'L',
        tempatLahir: city,
        tanggalLahir,
        alamat,
        noWhatsapp,
        kelas: cfg.kelas,
        programKeahlian: cfg.program,
        tanggalMasuk,
        nominalSpp,
        status,
        createdAt: `${entryYear}-07-15T08:00:00.000Z`,
        updatedAt: '2026-10-15T10:00:00.000Z',
      });

      studentCounter++;
    }
  });

  return students;
}
