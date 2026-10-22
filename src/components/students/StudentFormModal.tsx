import React, { useState, useEffect } from 'react';
import { Student, Gender, StudentStatus, VocationalMajor } from '../../types';
import { Modal } from '../common/Modal';
import { INITIAL_SCHOOL_SETTINGS } from '../../data/initialSettings';
import { parseRupiah } from '../../utils/currency';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: any) => void;
  initialData?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [nis, setNis] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<Gender>('L');
  const [tempatLahir, setTempatLahir] = useState('Jakarta');
  const [tanggalLahir, setTanggalLahir] = useState('2009-05-15');
  const [alamat, setAlamat] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [kelas, setKelas] = useState('X TKRO 1');
  const [programKeahlian, setProgramKeahlian] = useState<VocationalMajor>(
    'Teknik Kendaraan Ringan Otomotif'
  );
  const [tanggalMasuk, setTanggalMasuk] = useState('2026-07-15');
  const [nominalSpp, setNominalSpp] = useState('250000');
  const [status, setStatus] = useState<StudentStatus>('aktif');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNis(initialData.nis);
      setNama(initialData.nama);
      setJenisKelamin(initialData.jenisKelamin);
      setTempatLahir(initialData.tempatLahir);
      setTanggalLahir(initialData.tanggalLahir);
      setAlamat(initialData.alamat);
      setNoWhatsapp(initialData.noWhatsapp);
      setKelas(initialData.kelas);
      setProgramKeahlian(initialData.programKeahlian);
      setTanggalMasuk(initialData.tanggalMasuk);
      setNominalSpp(String(initialData.nominalSpp));
      setStatus(initialData.status);
    } else {
      setNis(`26${Math.floor(1000 + Math.random() * 9000)}`);
      setNama('');
      setJenisKelamin('L');
      setTempatLahir('Jakarta');
      setTanggalLahir('2009-05-15');
      setAlamat('');
      setNoWhatsapp('0812');
      setKelas('X TKRO 1');
      setProgramKeahlian('Teknik Kendaraan Ringan Otomotif');
      setTanggalMasuk('2026-07-15');
      setNominalSpp('250000');
      setStatus('aktif');
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nis.trim() || !nama.trim() || !alamat.trim() || !noWhatsapp.trim()) {
      setErrorMsg('Mohon lengkapi seluruh kolom bertanda bintang (*).');
      return;
    }

    const sppNumber = parseRupiah(nominalSpp);
    if (sppNumber <= 0) {
      setErrorMsg('Besaran nominal SPP bulanan harus lebih dari 0.');
      return;
    }

    try {
      onSubmit({
        nis: nis.trim(),
        nama: nama.trim(),
        jenisKelamin,
        tempatLahir: tempatLahir.trim(),
        tanggalLahir,
        alamat: alamat.trim(),
        noWhatsapp: noWhatsapp.trim(),
        kelas,
        programKeahlian,
        tanggalMasuk,
        nominalSpp: sppNumber,
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data siswa.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
      subtitle="Pengelolaan data pokok siswa SMK Otomotif Cekmobil"
      maxWidth="2xl"
    >
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nomor Induk Siswa (NIS) *
            </label>
            <input
              type="text"
              required
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nama Lengkap Siswa *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Muhammad Bintang Pratama"
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value as Gender)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Tempat Lahir
            </label>
            <input
              type="text"
              value={tempatLahir}
              onChange={(e) => setTempatLahir(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Kelas *
            </label>
            <select
              value={kelas}
              onChange={(e) => {
                setKelas(e.target.value);
                if (e.target.value.includes('TKRO')) {
                  setProgramKeahlian('Teknik Kendaraan Ringan Otomotif');
                } else if (e.target.value.includes('TBSM')) {
                  setProgramKeahlian('Teknik dan Bisnis Sepeda Motor');
                } else if (e.target.value.includes('TBO')) {
                  setProgramKeahlian('Teknik Bodi Otomotif');
                }
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              {INITIAL_SCHOOL_SETTINGS.daftarKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Program Keahlian *
            </label>
            <select
              value={programKeahlian}
              onChange={(e) => setProgramKeahlian(e.target.value as VocationalMajor)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              {INITIAL_SCHOOL_SETTINGS.daftarProgramKeahlian.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              No WhatsApp Wali / Orang Tua *
            </label>
            <input
              type="text"
              required
              value={noWhatsapp}
              onChange={(e) => setNoWhatsapp(e.target.value)}
              placeholder="08123456789"
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Besaran SPP Bulanan (Rp) *
            </label>
            <input
              type="number"
              required
              value={nominalSpp}
              onChange={(e) => setNominalSpp(e.target.value)}
              step="10000"
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Alamat Tempat Tinggal *
          </label>
          <textarea
            required
            rows={2}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Jl. Raya Otomotif No. 12, RT 02/05..."
            className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Tanggal Masuk Sekolah
            </label>
            <input
              type="date"
              value={tanggalMasuk}
              onChange={(e) => setTanggalMasuk(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Status Siswa
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StudentStatus)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="aktif">Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors"
          >
            {initialData ? 'Perbarui Data Siswa' : 'Simpan Siswa Baru'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
