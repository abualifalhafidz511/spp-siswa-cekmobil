import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  CreditCard,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserProfile, UserRole, PageView } from '../../types';
import { INITIAL_USER_PROFILES } from '../../data/initialSettings';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  currentUser: UserProfile;
  onChangeUserRole: (role: UserRole) => void;
  onNavigate: (page: PageView) => void;
  onQuickSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  currentUser,
  onChangeUserRole,
  onNavigate,
  onQuickSearch,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onQuickSearch(searchInput.trim());
      onNavigate('payments');
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'Tagihan SPP Oktober Aktif',
      desc: '120 tagihan SPP bulan berjalan telah terbit.',
      time: 'Hari ini, 08:00 WIB',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 2,
      title: 'Jatuh Tempo Mendekat',
      desc: 'Tgl 10 jatuh tempo pembayaran SPP bulanan.',
      time: 'Kemarin',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 3,
      title: 'Sistem Sinkronisasi Siap',
      desc: 'Data demo 120 siswa & 6 bulan transaksi aktif.',
      time: '2 hari lalu',
      icon: Sparkles,
      color: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-zinc-200/80 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4 no-print shadow-xs">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block truncate">
          <h1 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Sistem Pembayaran SPP</span>
            <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200/60 px-1.5 py-0.2 rounded">
              SMK Otomotif
            </span>
          </h1>
          <p className="text-[11px] text-zinc-500 truncate hidden md:block">
            Administrasi Keuangan Siswa SMK Otomotif Cekmobil
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari siswa, NIS, atau no transaksi..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </form>
      </div>

      {/* Right: Quick actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Transaction Action Button */}
        <button
          onClick={() => onNavigate('payments')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>+ Pembayaran</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
            }}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors relative"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800">Notifikasi</span>
                <span className="text-[10px] text-zinc-400">3 Belum Dibaca</span>
              </div>
              <div className="divide-y divide-zinc-50">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="p-2.5 hover:bg-zinc-50 rounded-lg flex items-start gap-2.5 transition-colors">
                      <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800">{item.title}</p>
                        <p className="text-[11px] text-zinc-500 line-clamp-2">{item.desc}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-zinc-200/80 hover:bg-zinc-50 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-zinc-800 leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] font-medium text-red-600 leading-none">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-zinc-100">
                <p className="text-xs font-bold text-zinc-900">{currentUser.name}</p>
                <p className="text-[11px] text-zinc-500">{currentUser.email}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">NIP: {currentUser.nip}</p>
              </div>

              <div className="py-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3 mb-1">
                  Ganti Hak Akses (Role Switcher)
                </p>
                {INITIAL_USER_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onChangeUserRole(profile.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.role === profile.role
                        ? 'bg-red-50 text-red-700 font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{profile.role}</p>
                      <p className="text-[10px] text-zinc-400">{profile.name}</p>
                    </div>
                    {currentUser.role === profile.role && (
                      <UserCheck className="w-4 h-4 text-red-600" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors font-medium"
                >
                  Buka Pengaturan Profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
