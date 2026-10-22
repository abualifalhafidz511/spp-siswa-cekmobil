import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
  Printer,
  RotateCcw,
  Save,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';
import { SchoolSettings, UserRole } from '../types';
import { storageService } from '../services/storage';
import { formatRupiah, parseRupiah } from '../utils/currency';
import { INITIAL_USER_PROFILES } from '../data/initialSettings';
import { CekmobilLogo } from '../components/common/CekmobilLogo';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface SettingsPageProps {
  onRefreshAll: () => void;
  currentUserRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onRefreshAll,
  currentUserRole,
  onChangeUserRole,
}) => {
  const [settings, setSettings] = useState<SchoolSettings>(() => storageService.getSettings());
  const [activeTab, setActiveTab] = useState<'sekolah' | 'spp' | 'metode' | 'kuitansi' | 'hak_akses' | 'database'>('sekolah');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.setSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefreshAll();
  };

  const handleResetDatabase = () => {
    storageService.resetToDefaults();
    setSettings(storageService.getSettings());
    setIsResetConfirmOpen(false);
    onRefreshAll();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-600" />
            <span>Pengaturan Sistem Pembayaran SPP</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Konfigurasi profil sekolah, nominal standar, channel pembayaran, dan hak akses
          </p>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data (120 Siswa)</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Pengaturan berhasil disimpan ke penyimpanan lokal aplikasi.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 pb-2">
        {[
          { id: 'sekolah', label: 'Profil Sekolah', icon: Building2 },
          { id: 'spp', label: 'Ketentuan SPP', icon: Calendar },
          { id: 'metode', label: 'Metode Bayar', icon: CreditCard },
          { id: 'kuitansi', label: 'Tampilan Kuitansi', icon: Printer },
          { id: 'hak_akses', label: 'Hak Akses & Role', icon: ShieldCheck },
          { id: 'database', label: 'Arsitektur Supabase', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Profil Sekolah */}
        {activeTab === 'sekolah' && (
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
              <CekmobilLogo size="lg" />
              <div>
                <p className="text-xs font-bold text-zinc-900">Logo Resmi Aplikasi Cekmobil.id</p>
                <p className="text-[11px] text-zinc-500">Identitas visual hitam, merah, dan putih.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={settings.namaSekolah}
                  onChange={(e) => setSettings({ ...settings, namaSekolah: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={settings.npsn}
                  onChange={(e) => setSettings({ ...settings, npsn: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={settings.alamat}
                  onChange={(e) => setSettings({ ...settings, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nomor Telepon / Hotline</label>
                <input
                  type="text"
                  value={settings.telepon}
                  onChange={(e) => setSettings({ ...settings, telepon: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Administrasi</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Kepala Sekolah</label>
                <input
                  type="text"
                  value={settings.kepalaSekolah}
                  onChange={(e) => setSettings({ ...settings, kepalaSekolah: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Bendahara Sekolah</label>
                <input
                  type="text"
                  value={settings.bendaharaSekolah}
                  onChange={(e) => setSettings({ ...settings, bendaharaSekolah: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ketentuan SPP */}
        {activeTab === 'spp' && (
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tahun Ajaran Aktif</label>
                <input
                  type="text"
                  value={settings.tahunAjaranAktif}
                  onChange={(e) => setSettings({ ...settings, tahunAjaranAktif: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nominal SPP Standar (Rp)</label>
                <input
                  type="number"
                  value={settings.nominalSppStandar}
                  onChange={(e) => setSettings({ ...settings, nominalSppStandar: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Tanggal Jatuh Tempo Bulanan</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={settings.tanggalJatuhTempoDefault}
                  onChange={(e) => setSettings({ ...settings, tanggalJatuhTempoDefault: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Daftar Rombongan Belajar (Kelas)
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                {settings.daftarKelas.map((k) => (
                  <span key={k} className="px-2.5 py-1 bg-white border border-zinc-200 rounded-md font-semibold text-zinc-800">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Metode Pembayaran */}
        {activeTab === 'metode' && (
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900">Aktivasi Kanal Pembayaran</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.metodePembayaranAktif.tunai}
                  onChange={(e) => setSettings({
                    ...settings,
                    metodePembayaranAktif: { ...settings.metodePembayaranAktif, tunai: e.target.checked }
                  })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900">Pembayaran Tunai (Kasir)</p>
                  <p className="text-[10px] text-zinc-400">Penerimaan fisik di loket</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.metodePembayaranAktif.transferBank}
                  onChange={(e) => setSettings({
                    ...settings,
                    metodePembayaranAktif: { ...settings.metodePembayaranAktif, transferBank: e.target.checked }
                  })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900">Transfer Bank</p>
                  <p className="text-[10px] text-zinc-400">Rekening giro yayasan</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.metodePembayaranAktif.qris}
                  onChange={(e) => setSettings({
                    ...settings,
                    metodePembayaranAktif: { ...settings.metodePembayaranAktif, qris: e.target.checked }
                  })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900">QRIS Statis/Dinamis</p>
                  <p className="text-[10px] text-zinc-400">E-wallet & mobile banking</p>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
                Daftar Rekening Bank Resmi Sekolah
              </h4>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg">
                {settings.bankTersedia.map((b, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-zinc-900">{b.nama}</span>
                      <span className="font-mono text-zinc-600 ml-2">{b.nomorRekening}</span>
                      <p className="text-[10px] text-zinc-400">{b.atasNama}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tampilan Kuitansi */}
        {activeTab === 'kuitansi' && (
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Catatan Kaki Kuitansi / Bukti Bayar
              </label>
              <textarea
                rows={3}
                value={settings.catatanKuitansi}
                onChange={(e) => setSettings({ ...settings, catatanKuitansi: e.target.value })}
                className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.tampilkanCapDigital}
                onChange={(e) => setSettings({ ...settings, tampilkanCapDigital: e.target.checked })}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <div>
                <p className="text-xs font-bold text-zinc-900">Tampilkan Stempel Digital "LUNAS"</p>
                <p className="text-[10px] text-zinc-400">Mencetak cap verifikasi otomatis pada kuitansi lunas</p>
              </div>
            </label>
          </div>
        )}

        {/* Tab 5: Hak Akses & Role Management */}
        {activeTab === 'hak_akses' && (
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Matriks Hak Akses Pengguna (RBAC)</h3>
              <p className="text-xs text-zinc-500">
                Pemisahan tanggung jawab antara Administrator, Bendahara, dan Staf Administrasi
              </p>
            </div>

            {/* Role Matrix */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Fitur & Modul</th>
                    <th className="p-3 text-center">Administrator</th>
                    <th className="p-3 text-center">Bendahara</th>
                    <th className="p-3 text-center">Staf Administrasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-700">
                  <tr>
                    <td className="p-3 font-medium">Dashboard & Statistik</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Akses Penuh</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Akses Penuh</td>
                    <td className="p-3 text-center text-zinc-600">✓ Terbatas</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Data Siswa (CRUD, Impor/Ekspor)</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Akses Penuh</td>
                    <td className="p-3 text-center text-zinc-600">Lihat Saja</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Akses Penuh</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Penerbitan Tagihan SPP Massal</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                    <td className="p-3 text-center text-zinc-300">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Transaksi Pembayaran & Kasir</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Utama</td>
                    <td className="p-3 text-center text-zinc-300">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Laporan Keuangan & Audit Jurnal</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Utama</td>
                    <td className="p-3 text-center text-zinc-300">✗</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Pembatalan Transaksi Kas</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ (Dengan Alasan)</td>
                    <td className="p-3 text-center text-zinc-300">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Active Role Selector */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <label className="text-xs font-bold text-zinc-800">
                Pilih Peran Aktif Anda Saat Ini:
              </label>
              <div className="flex flex-wrap gap-2">
                {INITIAL_USER_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => onChangeUserRole(profile.role)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                      currentUserRole === profile.role
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {profile.role} ({profile.name})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Arsitektur Supabase */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-xl border border-zinc-200/80 p-6 shadow-xs space-y-4">
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Database className="w-5 h-5 text-sky-600" />
                <span>Kesiapan Arsitektur Supabase (Modular Service Layer)</span>
              </div>
              <p className="leading-relaxed">
                Aplikasi ini telah dirancang dengan arsitektur modular yang memisahkan UI dari lapisan data melalui <strong>studentService</strong>, <strong>invoiceService</strong>, <strong>paymentService</strong>, dan <strong>reportService</strong>.
              </p>
              <p className="leading-relaxed">
                Saat akan beralih ke backend Supabase sesungguhnya:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ganti implementasi pada folder <code>src/services/</code> untuk memanggil <code>supabase.from('students')</code>, <code>supabase.from('invoices')</code>, dan <code>supabase.from('payments')</code>.</li>
                <li>Aktifkan Row Level Security (RLS) di tabel Supabase sesuai peran pengguna.</li>
                <li>Gunakan Supabase Auth untuk otentikasi login email/password resmi sekolah.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDatabase}
        title="Reset Data Demo SPP"
        message="Apakah Anda yakin ingin mengatur ulang data aplikasi kembali ke data default 120 siswa aktif dan 6 bulan simulasi tagihan? Tindakan ini akan mengembalikan data ke kondisi awal."
        confirmLabel="Ya, Reset Data Demo"
        isDestructive={true}
      />
    </div>
  );
};
