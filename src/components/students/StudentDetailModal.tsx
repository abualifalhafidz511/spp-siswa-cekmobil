import React from 'react';
import { Student, Invoice, PaymentTransaction } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { formatRupiah } from '../../utils/currency';
import { formatTanggalIndo } from '../../utils/date';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService';
import { CreditCard, Phone, MapPin, Calendar, BookOpen, AlertCircle } from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onPayForStudent: (studentId: string, invoiceId?: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  onPayForStudent,
}) => {
  if (!student) return null;

  const invoices = invoiceService.getByStudentId(student.id);
  const totalTagihan = invoices.reduce((sum, i) => sum + i.totalTagihan, 0);
  const totalDibayar = invoices.reduce((sum, i) => sum + i.jumlahDibayar, 0);
  const totalTunggakan = invoices.reduce((sum, i) => sum + i.sisaTagihan, 0);

  const studentPayments = paymentService.getAll().filter(p => p.studentId === student.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil & Buku Keuangan Siswa"
      subtitle={`${student.nama} (${student.nis}) - ${student.kelas}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="p-5 rounded-xl bg-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-600 text-white font-black text-2xl flex items-center justify-center shrink-0">
              {student.nama.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{student.nama}</h3>
                <StatusBadge status={student.status} size="sm" />
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                NIS: <span className="font-mono text-white">{student.nis}</span> • {student.kelas}
              </p>
              <p className="text-[11px] text-red-400 mt-0.5 font-medium">
                {student.programKeahlian}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalTunggakan > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPayForStudent(student.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Bayar SPP Sekarang</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial KPI Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
              Total Tagihan
            </p>
            <p className="text-base font-bold text-zinc-900 font-mono mt-0.5">
              {formatRupiah(totalTagihan)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{invoices.length} Periode</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
              Total Diterima
            </p>
            <p className="text-base font-bold text-emerald-800 font-mono mt-0.5">
              {formatRupiah(totalDibayar)}
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">{studentPayments.length} Transaksi</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200">
            <p className="text-[10px] uppercase font-bold tracking-wider text-rose-700">
              Total Tunggakan
            </p>
            <p className="text-base font-bold text-rose-800 font-mono mt-0.5">
              {formatRupiah(totalTunggakan)}
            </p>
            <p className="text-[10px] text-rose-600 mt-0.5">
              {totalTunggakan === 0 ? 'Lunas Bersih' : 'Perlu Ditindaklanjuti'}
            </p>
          </div>
        </div>

        {/* Student Personal Details */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2 text-xs">
          <h4 className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] mb-2">
            Biodata Pokok
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-zinc-600">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>TTL: <strong>{student.tempatLahir}, {formatTanggalIndo(student.tanggalLahir)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>WA Wali: <strong className="font-mono">{student.noWhatsapp}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 sm:col-span-2">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Alamat: <strong>{student.alamat}</strong></span>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-3">
          <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider">
            Riwayat Tagihan SPP ({invoices.length} Periode)
          </h4>

          <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100/80 text-zinc-600 text-[11px] font-bold uppercase border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3">Tagihan</th>
                  <th className="py-2.5 px-3">Dibayar</th>
                  <th className="py-2.5 px-3">Sisa</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/60">
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{inv.periodeFormatted}</td>
                    <td className="py-2.5 px-3 font-mono">{formatRupiah(inv.totalTagihan)}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">{formatRupiah(inv.jumlahDibayar)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{formatRupiah(inv.sisaTagihan)}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={inv.status} size="sm" /></td>
                    <td className="py-2.5 px-3 text-right">
                      {inv.sisaTagihan > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onPayForStudent(student.id, inv.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
