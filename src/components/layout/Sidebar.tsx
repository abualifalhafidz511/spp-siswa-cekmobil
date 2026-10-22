import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  History,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { PageView, UserRole } from '../../types';
import { CekmobilLogo } from '../common/CekmobilLogo';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userRole: UserRole;
  schoolYear: string;
}

interface MenuItem {
  id: PageView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  allowedRoles?: UserRole[];
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Data Siswa', icon: Users },
  { id: 'invoices', label: 'Tagihan SPP', icon: FileText },
  { id: 'payments', label: 'Pembayaran', icon: CreditCard },
  { id: 'history', label: 'Riwayat Pembayaran', icon: History },
  { id: 'reports', label: 'Laporan', icon: BarChart3, allowedRoles: ['ADMIN', 'BENDAHARA'] },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  userRole,
  schoolYear,
}) => {
  const handleItemClick = (page: PageView) => {
    onNavigate(page);
    onCloseMobile();
  };

  const roleLabelMap: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    BENDAHARA: 'Bendahara Keuangan',
    STAF_ADMIN: 'Staf Administrasi',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 flex flex-col bg-zinc-950 text-zinc-300 border-r border-zinc-800/80 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} no-print`}
      >
        {/* Top Header & Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80">
          <div className="flex items-center overflow-hidden">
            {isCollapsed ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <CekmobilLogo size="md" imageOnly={true} />
              </div>
            ) : (
              <CekmobilLogo size="md" showSubtitle={true} />
            )}
          </div>

          {/* Close for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className={`px-3 mb-2 ${isCollapsed ? 'hidden' : 'block'}`}>
            <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
              Menu Utama
            </p>
          </div>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isRestricted = item.allowedRoles && !item.allowedRoles.includes(userRole);

            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && handleItemClick(item.id)}
                disabled={isRestricted}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-red-600/15 text-white font-semibold'
                    : isRestricted
                    ? 'opacity-40 cursor-not-allowed text-zinc-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {/* Active indicator bar on left */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-red-600 rounded-r-md" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-200'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && isRestricted && (
                  <span className="text-[10px] uppercase font-bold text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                    Terkunci
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User Role & Collapse Toggle */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80">
          {!isCollapsed && (
            <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">
                    {roleLabelMap[userRole]}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    TA {schoolYear}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium">
                <ChevronLeft className="w-4 h-4" />
                <span>Ciutkan Menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
