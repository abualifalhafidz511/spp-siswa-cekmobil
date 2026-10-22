import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  CreditCard,
  Building,
  QrCode,
  Banknote,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Student, Invoice, PaymentMethod, BankName, PaymentTransaction } from '../../types';
import { studentService } from '../../services/studentService';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService';
import { storageService } from '../../services/storage';
import { formatRupiah, parseRupiah } from '../../utils/currency';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PaymentFormProps {
  initialStudentId?: string;
  initialInvoiceId?: string;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
  onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialStudentId,
  initialInvoiceId,
  onPaymentSuccess,
  onCancel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentInvoices, setStudentInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form Inputs
  const [nominalBayarInput, setNominalBayarInput] = useState<string>('');
  const [metodePembayaran, setMetodePembayaran] = useState<PaymentMethod>('TUNAI');
  const [namaBank, setNamaBank] = useState<BankName>('BCA');
  const [catatan, setCatatan] = useState('');

  // UI States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial student or invoice if passed
  useEffect(() => {
    if (initialStudentId) {
      const student = studentService.getById(initialStudentId);
      if (student) handleSelectStudent(student);
    } else if (initialInvoiceId) {
      const inv = invoiceService.getById(initialInvoiceId);
      if (inv) {
        const student = studentService.getById(inv.studentId);
        if (student) {
          setSelectedStudent(student);
          const unpaid = invoiceService.getUnpaidByStudentId(student.id);
          setStudentInvoices(unpaid);
          setSelectedInvoice(inv);
          setNominalBayarInput(String(inv.sisaTagihan));
        }
      }
    }
  }, [initialStudentId, initialInvoiceId]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    const unpaid = invoiceService.getUnpaidByStudentId(student.id);
    setStudentInvoices(unpaid);

    if (unpaid.length > 0) {
      // Auto select earliest unpaid invoice
      setSelectedInvoice(unpaid[0]);
      setNominalBayarInput(String(unpaid[0].sisaTagihan));
    } else {
      setSelectedInvoice(null);
      setNominalBayarInput('');
    }
    setErrorMsg(null);
  };

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setNominalBayarInput(String(inv.sisaTagihan));
    setErrorMsg(null);
  };

  const handleSetFullPayment = () => {
    if (selectedInvoice) {
      setNominalBayarInput(String(selectedInvoice.sisaTagihan));
      setErrorMsg(null);
    }
  };

  const handleSetHalfPayment = () => {
    if (selectedInvoice) {
      const half = Math.floor(selectedInvoice.sisaTagihan / 2);
      setNominalBayarInput(String(half));
      setErrorMsg(null);
    }
  };

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedStudent) {
      setErrorMsg('Silakan pilih data siswa terlebih dahulu.');
      return;
    }

    if (!selectedInvoice) {
      setErrorMsg('Silakan pilih tagihan SPP yang akan dibayar.');
      return;
    }

    const nominal = parseRupiah(nominalBayarInput);
    if (nominal <= 0) {
      setErrorMsg('Nominal pembayaran harus lebih besar dari 0.');
      return;
    }

    if (nominal > selectedInvoice.sisaTagihan) {
      setErrorMsg(
        `Nominal pembayaran (${formatRupiah(nominal)}) tidak boleh melebihi sisa tagihan (${formatRupiah(selectedInvoice.sisaTagihan)}).`
      );
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleExecutePayment = () => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);

    try {
      const nominal = parseRupiah(nominalBayarInput);
      const currentUser = storageService.getCurrentUser();

      const result = paymentService.createPayment({
        invoiceId: selectedInvoice.id,
        jumlahPembayaran: nominal,
        metodePembayaran,
        namaBank: metodePembayaran === 'TRANSFER_BANK' ? namaBank : undefined,
        catatan,
        kasirPetugas: currentUser.name,
      });

      setIsSubmitting(false);
      setIsConfirmOpen(false);
      onPaymentSuccess(result.payment);
    } catch (err: any) {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pembayaran.');
    }
  };

  // Student search results
  const searchResults = searchQuery.trim().length >= 2
    ? studentService.search(searchQuery).slice(0, 6)
    : [];

  const parsedNominal = parseRupiah(nominalBayarInput);
  const remainingAfterPayment = selectedInvoice
    ? Math.max(0, selectedInvoice.sisaTagihan - parsedNominal)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6">
      <div className="pb-5 mb-6 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" />
            <span>Formulir Transaksi Pembayaran SPP</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Pencatatan resmi penerimaan kas SPP bulanan siswa SMK Otomotif Cekmobil
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleValidateAndOpenConfirm} className="space-y-6">
        {/* Step 1 & 2: Search and Select Student */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Cari Data Siswa (NIS atau Nama)</span>
          </label>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik minimal 2 karakter (contoh: 260001 atau Pratama)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown List */}
          {searchResults.length > 0 && !selectedStudent && (
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 bg-white shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    handleSelectStudent(s);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-red-50/60 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-900">{s.nama}</span>
                    <span className="text-zinc-400 ml-2">NIS: {s.nis}</span>
                    <p className="text-[11px] text-zinc-500">{s.kelas} • {s.programKeahlian}</p>
                  </div>
                  <span className="text-red-600 font-semibold flex items-center gap-1">
                    Pilih <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Selected Student Card */}
          {selectedStudent && (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                  {selectedStudent.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <span>{selectedStudent.nama}</span>
                    <StatusBadge status={selectedStudent.status} size="sm" />
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    <span>NIS: <strong className="text-zinc-800">{selectedStudent.nis}</strong></span>
                    <span>·</span>
                    <span>Kelas: <strong className="text-zinc-800">{selectedStudent.kelas}</strong></span>
                    <span>·</span>
                    <span>SPP: <strong>{formatRupiah(selectedStudent.nominalSpp)}/bln</strong></span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{selectedStudent.programKeahlian}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedInvoice(null);
                  setStudentInvoices([]);
                  setNominalBayarInput('');
                }}
                className="text-xs font-semibold text-zinc-500 hover:text-red-600 transition-colors"
              >
                Ganti Siswa
              </button>
            </div>
          )}
        </div>

        {/* Step 3 & 4: Unpaid Bills Selection */}
        {selectedStudent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Pilih Bulan Tagihan SPP ({studentInvoices.length} Belum Lunas)</span>
              </label>
            </div>

            {studentInvoices.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-emerald-300 rounded-xl bg-emerald-50/50">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-900">Semua Tagihan Sudah Lunas</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Siswa ini tidak memiliki tunggakan atau tagihan SPP yang aktif saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {studentInvoices.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  return (
                    <div
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 shadow-xs ring-1 ring-red-500'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-zinc-900">
                          {inv.periodeFormatted}
                        </span>
                        <StatusBadge status={inv.status} size="sm" />
                      </div>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="flex justify-between text-zinc-500">
                          <span>Total Tagihan:</span>
                          <span className="font-semibold text-zinc-800">{formatRupiah(inv.totalTagihan)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500">
                          <span>Sudah Dibayar:</span>
                          <span className="text-zinc-600">{formatRupiah(inv.jumlahDibayar)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-zinc-100 font-bold">
                          <span className="text-red-700">Sisa Tagihan:</span>
                          <span className="text-red-700 font-mono">{formatRupiah(inv.sisaTagihan)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 5 & 6: Nominal & Payment Method */}
        {selectedInvoice && (
          <div className="space-y-6 pt-4 border-t border-zinc-100">
            <div>
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Nominal Pembayaran (Rupiah)</span>
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={nominalBayarInput ? Number(nominalBayarInput).toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const num = parseRupiah(e.target.value);
                      setNominalBayarInput(String(num));
                      setErrorMsg(null);
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 text-base font-bold text-zinc-900 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSetFullPayment}
                  className="px-3.5 py-2.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors shrink-0"
                >
                  Bayar Lunas ({formatRupiah(selectedInvoice.sisaTagihan)})
                </button>
                {selectedInvoice.sisaTagihan > 100000 && (
                  <button
                    type="button"
                    onClick={handleSetHalfPayment}
                    className="px-3 py-2.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg transition-colors shrink-0 hidden sm:inline-block"
                  >
                    50% ({formatRupiah(Math.floor(selectedInvoice.sisaTagihan / 2))})
                  </button>
                )}
              </div>

              {parsedNominal > 0 && (
                <div className="mt-2 text-xs flex items-center justify-between text-zinc-500 px-1">
                  <span>Sisa tagihan setelah transaksi:</span>
                  <span className={`font-mono font-bold ${remainingAfterPayment === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {formatRupiah(remainingAfterPayment)} {remainingAfterPayment === 0 ? '(LUNAS)' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Step 7: Payment Method */}
            <div>
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Metode Pembayaran</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMetodePembayaran('TUNAI')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    metodePembayaran === 'TUNAI'
                      ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-500 text-zinc-900'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <Banknote className={`w-5 h-5 ${metodePembayaran === 'TUNAI' ? 'text-red-600' : 'text-zinc-400'}`} />
                  <div>
                    <p className="text-xs font-bold">Tunai (Cash)</p>
                    <p className="text-[10px] text-zinc-400">Kasir Keuangan Sekolah</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodePembayaran('TRANSFER_BANK')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    metodePembayaran === 'TRANSFER_BANK'
                      ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-500 text-zinc-900'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <Building className={`w-5 h-5 ${metodePembayaran === 'TRANSFER_BANK' ? 'text-red-600' : 'text-zinc-400'}`} />
                  <div>
                    <p className="text-xs font-bold">Transfer Bank</p>
                    <p className="text-[10px] text-zinc-400">Rekening Resmi Sekolah</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodePembayaran('QRIS')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    metodePembayaran === 'QRIS'
                      ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-500 text-zinc-900'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <QrCode className={`w-5 h-5 ${metodePembayaran === 'QRIS' ? 'text-red-600' : 'text-zinc-400'}`} />
                  <div>
                    <p className="text-xs font-bold">QRIS Standar</p>
                    <p className="text-[10px] text-zinc-400">Gopay, OVO, ShopeePay, dll</p>
                  </div>
                </button>
              </div>

              {/* Sub-options for Transfer Bank */}
              {metodePembayaran === 'TRANSFER_BANK' && (
                <div className="mt-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-700">
                    Pilih Bank Tujuan Transfer:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['BCA', 'Mandiri', 'BRI', 'BNI'] as BankName[]).map((bank) => (
                      <button
                        type="button"
                        key={bank}
                        onClick={() => setNamaBank(bank)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          namaBank === bank
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 8: Catatan Transaksi */}
            <div>
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">5</span>
                <span>Catatan Tambahan (Opsional)</span>
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Misal: Diterima oleh orang tua siswa / cicilan pertama..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Step 9: Transaction Summary Preview */}
            <div className="p-4 rounded-xl bg-zinc-900 text-white space-y-2.5">
              <p className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
                Ringkasan Transaksi Pembayaran
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Siswa & Kelas:</span>
                <span className="font-semibold text-white">
                  {selectedStudent?.nama} ({selectedStudent?.kelas})
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Periode Tagihan SPP:</span>
                <span className="font-semibold text-white">{selectedInvoice.periodeFormatted}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Metode Pembayaran:</span>
                <span className="font-semibold text-white">
                  {metodePembayaran} {metodePembayaran === 'TRANSFER_BANK' ? `(${namaBank})` : ''}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-zinc-300">TOTAL BAYAR:</span>
                <span className="text-xl font-black text-red-500 font-mono">
                  {formatRupiah(parsedNominal)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={parsedNominal <= 0}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
              >
                <span>Simpan Transaksi & Cetak Kuitansi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Step 10: Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecutePayment}
        title="Konfirmasi Pembayaran SPP"
        message={`Apakah Anda yakin ingin memproses penerimaan pembayaran SPP sebesar ${formatRupiah(parsedNominal)} untuk siswa ${selectedStudent?.nama} (${selectedInvoice?.periodeFormatted})? Transaksi ini akan tercatat secara resmi dalam pembukuan kas sekolah.`}
        confirmLabel="Ya, Proses Pembayaran"
        cancelLabel="Periksa Kembali"
        isLoading={isSubmitting}
      />
    </div>
  );
};
