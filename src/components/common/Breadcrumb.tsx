import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { PageView } from '../../types';

interface BreadcrumbProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  subItem?: string;
}

const PAGE_NAMES: Record<PageView, string> = {
  dashboard: 'Dashboard',
  students: 'Data Siswa',
  invoices: 'Tagihan SPP',
  payments: 'Pembayaran Baru',
  history: 'Riwayat Pembayaran',
  reports: 'Laporan Keuangan',
  settings: 'Pengaturan Sistem',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentPage,
  onNavigate,
  subItem,
}) => {
  return (
    <nav className="flex items-center text-xs text-zinc-500 mb-4" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Utama</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-zinc-300" />

      {currentPage === 'dashboard' && !subItem ? (
        <span className="font-semibold text-zinc-800">Dashboard</span>
      ) : (
        <button
          onClick={() => onNavigate(currentPage)}
          className={`hover:text-zinc-900 transition-colors ${
            !subItem ? 'font-semibold text-zinc-800' : ''
          }`}
        >
          {PAGE_NAMES[currentPage]}
        </button>
      )}

      {subItem && (
        <>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-zinc-300" />
          <span className="font-semibold text-zinc-800 truncate max-w-xs">{subItem}</span>
        </>
      )}
    </nav>
  );
};
