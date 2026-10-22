import React, { useState } from 'react';
import { FileText, Calendar, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { invoiceService } from '../../services/invoiceService';
import { INITIAL_SCHOOL_SETTINGS } from '../../data/initialSettings';
import { getNamaBulan } from '../../utils/date';
import { parseRupiah } from '../../utils/currency';

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [bulan, setBulan] = useState<number>(currentMonth === 12 ? 1 : currentMonth + 1);
  const [tahun, setTahun] = useState<number>(currentMonth === 12 ? currentYear + 1 : currentYear);
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [jatuhTempo, setJatuhTempo] = useState<string>(
    `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`
  );
  const [nominalOverride, setNominalOverride] = useState<string>('');
  const [result, setResult] = useState<{ generated: number; skippedDuplicates: number; totalStudentsChecked: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);

    try {
      const overrideVal = nominalOverride ? parseRupiah(nominalOverride) : undefined;
      const res = invoiceService.generateBulk({
        bulan: Number(bulan),
        tahun: Number(tahun),
        kelasFilter,
        jatuhTempo,
        nominalOverride: overrideVal,
      });

      setResult(res);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat tagihan SPP.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Terbitkan Tagihan SPP Massal"
      subtitle="Membuat tagihan bulanan otomatis untuk siswa aktif"
      maxWidth="lg"
    >
      {result ? (
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Proses Terbit Tagihan Berhasil!</span>
            </div>
            <ul className="text-xs space-y-1 text-emerald-800">
              <li>• Periode: <strong>{getNamaBulan(bulan)} {tahun}</strong></li>
              <li>• Tagihan Baru Dibuat: <strong>{result.generated} siswa</strong></li>
              <li>• Dilewati (Sudah Memiliki Tagihan): <strong>{result.skippedDuplicates} siswa</strong></li>
              <li>• Total Siswa Diperiksa: <strong>{result.totalStudentsChecked} siswa</strong></li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Bulan Tagihan
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getNamaBulan(m)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Tahun
              </label>
              <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Target Kelas Penerima Tagihan
            </label>
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Seluruh Siswa Aktif (Semua Kelas)</option>
              {INITIAL_SCHOOL_SETTINGS.daftarKelas.map((k) => (
                <option key={k} value={k}>
                  Khusus Kelas: {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Tanggal Jatuh Tempo Pembayaran
            </label>
            <input
              type="date"
              required
              value={jatuhTempo}
              onChange={(e) => setJatuhTempo(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Standar jatuh tempo sekolah: Tanggal 10 setiap bulannya.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nominal SPP Khusus (Opsional)
            </label>
            <input
              type="text"
              value={nominalOverride}
              onChange={(e) => setNominalOverride(e.target.value)}
              placeholder="Kosongkan untuk memakai nominal SPP bawaan siswa (Rp 250.000)"
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
            <p className="font-semibold text-zinc-800 mb-0.5">Pencegahan Tagihan Ganda Aktif:</p>
            <p>
              Sistem secara otomatis memeriksa setiap siswa. Jika siswa sudah memiliki tagihan untuk bulan {getNamaBulan(bulan)} {tahun}, tagihan tidak akan dibuat ulang.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
            >
              Terbitkan Tagihan Sekarang
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
