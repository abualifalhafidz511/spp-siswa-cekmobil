import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { parseCsv, exportToCsv } from '../../utils/csv';
import { studentService } from '../../services/studentService';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvTextInput, setCsvTextInput] = useState('');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleCsv = `NIS,Nama Lengkap,Jenis Kelamin,Tempat Lahir,Tanggal Lahir,Alamat,No WhatsApp,Kelas,Program Keahlian,SPP Bulanan
269001,Budi Santoso,L,Jakarta,2009-08-12,"Jl. Garuda No. 45, Jakarta",08123456701,X TKRO 1,Teknik Kendaraan Ringan Otomotif,250000
269002,Dewi Lestari,P,Bekasi,2009-11-20,"Jl. Mawar No. 12, Bekasi",08123456702,X TBSM 1,Teknik dan Bisnis Sepeda Motor,250000`;

  const handleDownloadTemplate = () => {
    exportToCsv('template_import_siswa_cekmobil', [
      'NIS',
      'Nama Lengkap',
      'Jenis Kelamin (L/P)',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Alamat',
      'No WhatsApp',
      'Kelas',
      'Program Keahlian',
      'SPP Bulanan (Angka)'
    ], [
      ['269101', 'Ahmad Reza', 'L', 'Jakarta', '2009-04-10', 'Jl. Flamboyan No. 12, Jakarta', '081299887711', 'X TKRO 1', 'Teknik Kendaraan Ringan Otomotif', 250000],
      ['269102', 'Bima Sakti', 'L', 'Bekasi', '2009-06-25', 'Jl. Merpati No. 34, Bekasi', '081299887722', 'X TBSM 1', 'Teknik dan Bisnis Sepeda Motor', 250000],
    ]);
  };

  const handleExportAll = () => {
    const students = studentService.getAll();
    exportToCsv('data_seluruh_siswa_cekmobil', [
      'NIS',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Kelas',
      'Program Keahlian',
      'Nominal SPP (Rp)',
      'No WhatsApp',
      'Alamat',
      'Status Siswa'
    ], students.map(s => [
      s.nis,
      s.nama,
      s.jenisKelamin,
      s.kelas,
      s.programKeahlian,
      s.nominalSpp,
      s.noWhatsapp,
      s.alamat,
      s.status
    ]));
  };

  const handleParseCsvText = (text: string) => {
    setCsvTextInput(text);
    setErrorMsg(null);
    setImportResult(null);

    if (!text.trim()) {
      setPreviewRows([]);
      return;
    }

    try {
      const { headers, rows } = parseCsv(text);
      if (rows.length === 0) {
        setErrorMsg('Format CSV kosong atau tidak memiliki baris data.');
        return;
      }

      // Convert rows to student candidate objects
      const parsed = rows.map((cols) => ({
        nis: cols[0] || '',
        nama: cols[1] || '',
        jenisKelamin: (cols[2]?.toUpperCase() === 'P' ? 'P' : 'L') as any,
        tempatLahir: cols[3] || 'Jakarta',
        tanggalLahir: cols[4] || '2009-01-01',
        alamat: cols[5] || 'Alamat Belum Diisi',
        noWhatsapp: cols[6] || '0812000000',
        kelas: cols[7] || 'X TKRO 1',
        programKeahlian: (cols[8] || 'Teknik Kendaraan Ringan Otomotif') as any,
        tanggalMasuk: '2026-07-15',
        nominalSpp: parseInt(cols[9], 10) || 250000,
        status: 'aktif' as const,
      }));

      setPreviewRows(parsed);
    } catch (e: any) {
      setErrorMsg('Gagal membaca data CSV: ' + e.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (previewRows.length === 0) {
      setErrorMsg('Tidak ada baris data yang valid untuk diimpor.');
      return;
    }

    try {
      const res = studentService.bulkImport(previewRows);
      setImportResult(res);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal melakukan impor data.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Impor & Ekspor Data Siswa"
      subtitle="Kelola integrasi data master siswa melalui berkas CSV"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Tab Buttons */}
        <div className="flex border-b border-zinc-200">
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Impor Data Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Data Siswa</span>
          </button>
        </div>

        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-600">
                Pilih file CSV atau tempel teks data CSV siswa di bawah ini:
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Format Template CSV</span>
              </button>
            </div>

            {/* File Drop / Select Area */}
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:bg-zinc-50 transition-colors">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-upload"
              />
              <label
                htmlFor="csv-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <Upload className="w-6 h-6 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-700">
                  Klik untuk unggah file .CSV
                </span>
                <span className="text-[11px] text-zinc-400">
                  Mendukung berkas CSV standar (separator koma)
                </span>
              </label>
            </div>

            {/* Paste Box Alternative */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-700">
                  Atau Tempel / Edit Teks CSV Langsung:
                </label>
                <button
                  type="button"
                  onClick={() => handleParseCsvText(sampleCsv)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-800 underline"
                >
                  Gunakan Contoh Data
                </button>
              </div>
              <textarea
                rows={4}
                value={csvTextInput}
                onChange={(e) => handleParseCsvText(e.target.value)}
                placeholder="NIS,Nama Lengkap,Jenis Kelamin,..."
                className="w-full p-2.5 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {importResult && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Berhasil! {importResult.added} siswa baru ditambahkan. {importResult.skipped} dilewati (NIS duplikat).
                </span>
              </div>
            )}

            {/* Preview Table */}
            {previewRows.length > 0 && !importResult && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-800">
                  Pratinjau Data ({previewRows.length} baris terdeteksi):
                </p>
                <div className="border border-zinc-200 rounded-lg overflow-x-auto max-h-40">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-zinc-100 text-zinc-600 uppercase font-semibold">
                      <tr>
                        <th className="p-2">NIS</th>
                        <th className="p-2">Nama</th>
                        <th className="p-2">JK</th>
                        <th className="p-2">Kelas</th>
                        <th className="p-2">SPP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {previewRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono">{row.nis}</td>
                          <td className="p-2 font-medium">{row.nama}</td>
                          <td className="p-2">{row.jenisKelamin}</td>
                          <td className="p-2">{row.kelas}</td>
                          <td className="p-2 font-mono">Rp {row.nominalSpp.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Tutup
              </button>
              {previewRows.length > 0 && !importResult && (
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
                >
                  Impor Sekarang ({previewRows.length} Siswa)
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <h4 className="text-sm font-bold text-zinc-900 mb-1">
                Ekspor Data Siswa ke Format CSV
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Unduh seluruh data siswa aktif dan alumni lengkap dengan NIS, kelas, nomor telepon wali, dan besaran SPP. Berkas ini dapat langsung dibuka di Microsoft Excel atau Google Sheets.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleExportAll}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas CSV (Seluruh Siswa)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
