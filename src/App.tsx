/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageView, UserRole, UserProfile, PaymentTransaction } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Breadcrumb } from './components/common/Breadcrumb';
import { ReceiptModal } from './components/payments/ReceiptModal';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { storageService } from './services/storage';
import { INITIAL_USER_PROFILES } from './data/initialSettings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getCurrentUser());
  const [schoolSettings, setSchoolSettings] = useState(() => storageService.getSettings());

  // Responsive sidebar states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Workflow bridge states
  const [prefilledStudentId, setPrefilledStudentId] = useState<string | undefined>();
  const [prefilledInvoiceId, setPrefilledInvoiceId] = useState<string | undefined>();
  const [openStudentAddModalDirectly, setOpenStudentAddModalDirectly] = useState(false);

  // Global receipt modal trigger
  const [globalReceiptTransaction, setGlobalReceiptTransaction] = useState<PaymentTransaction | null>(null);

  // Refresh trigger
  const [appRefreshKey, setAppRefreshKey] = useState(0);
  const handleRefreshAll = () => {
    setSchoolSettings(storageService.getSettings());
    setCurrentUser(storageService.getCurrentUser());
    setAppRefreshKey(k => k + 1);
  };

  const handleRoleChange = (newRole: UserRole) => {
    const targetProfile = INITIAL_USER_PROFILES.find(p => p.role === newRole) || INITIAL_USER_PROFILES[0];
    storageService.setCurrentUser(targetProfile);
    setCurrentUser(targetProfile);

    // If currently on reports and new role is STAF_ADMIN (which has no access), redirect to dashboard
    if (currentPage === 'reports' && newRole === 'STAF_ADMIN') {
      setCurrentPage('dashboard');
    }
  };

  const handleNavigate = (page: PageView) => {
    // If navigating away, reset prefilled states if needed
    if (page !== 'payments') {
      setPrefilledStudentId(undefined);
      setPrefilledInvoiceId(undefined);
    }
    if (page !== 'students') {
      setOpenStudentAddModalDirectly(false);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayForStudent = (studentId: string, invoiceId?: string) => {
    setPrefilledStudentId(studentId);
    setPrefilledInvoiceId(invoiceId);
    setCurrentPage('payments');
  };

  const handlePayForInvoice = (invoiceId: string) => {
    setPrefilledInvoiceId(invoiceId);
    setPrefilledStudentId(undefined);
    setCurrentPage('payments');
  };

  const handleOpenAddStudentFromDashboard = () => {
    setOpenStudentAddModalDirectly(true);
    setCurrentPage('students');
  };

  const handleQuickSearch = (query: string) => {
    // Navigate to payments with search input active
    setCurrentPage('payments');
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col antialiased text-zinc-900 selection:bg-red-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userRole={currentUser.role}
        schoolYear={schoolSettings.tahunAjaranAktif}
      />

      {/* Main Content Layout */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          currentUser={currentUser}
          onChangeUserRole={handleRoleChange}
          onNavigate={handleNavigate}
          onQuickSearch={handleQuickSearch}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Breadcrumb Hierarchy */}
          <Breadcrumb currentPage={currentPage} onNavigate={handleNavigate} />

          {/* Dynamic Page Views */}
          {currentPage === 'dashboard' && (
            <DashboardPage
              key={appRefreshKey}
              onNavigate={handleNavigate}
              onSelectPaymentForReceipt={setGlobalReceiptTransaction}
              onOpenAddStudent={handleOpenAddStudentFromDashboard}
            />
          )}

          {currentPage === 'students' && (
            <StudentsPage
              key={appRefreshKey}
              onNavigate={handleNavigate}
              onPayForStudent={handlePayForStudent}
              isAddModalOpenInitially={openStudentAddModalDirectly}
              onCloseInitialAddModal={() => setOpenStudentAddModalDirectly(false)}
            />
          )}

          {currentPage === 'invoices' && (
            <InvoicesPage
              key={appRefreshKey}
              onNavigate={handleNavigate}
              onPayForInvoice={handlePayForInvoice}
            />
          )}

          {currentPage === 'payments' && (
            <PaymentsPage
              key={`${appRefreshKey}-${prefilledStudentId}-${prefilledInvoiceId}`}
              onNavigate={handleNavigate}
              prefilledStudentId={prefilledStudentId}
              prefilledInvoiceId={prefilledInvoiceId}
            />
          )}

          {currentPage === 'history' && (
            <PaymentHistoryPage
              key={appRefreshKey}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsPage
              key={appRefreshKey}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              key={appRefreshKey}
              onRefreshAll={handleRefreshAll}
              currentUserRole={currentUser.role}
              onChangeUserRole={handleRoleChange}
            />
          )}
        </main>
      </div>

      {/* Global Receipt Modal */}
      <ReceiptModal
        isOpen={!!globalReceiptTransaction}
        onClose={() => setGlobalReceiptTransaction(null)}
        transaction={globalReceiptTransaction}
        settings={schoolSettings}
      />
    </div>
  );
}
