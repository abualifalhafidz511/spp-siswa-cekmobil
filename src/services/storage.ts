import { Student, Invoice, PaymentTransaction, SchoolSettings, UserProfile, AuditLog } from '../types';
import { generateInitialStudents } from '../data/mockStudents';
import { generateSeedInvoicesAndPayments } from '../data/mockDataGenerator';
import { INITIAL_SCHOOL_SETTINGS, INITIAL_USER_PROFILES } from '../data/initialSettings';

const STORAGE_KEYS = {
  STUDENTS: 'cekmobil_spp_students_v1',
  INVOICES: 'cekmobil_spp_invoices_v1',
  PAYMENTS: 'cekmobil_spp_payments_v1',
  SETTINGS: 'cekmobil_spp_settings_v1',
  CURRENT_USER: 'cekmobil_spp_current_user_v1',
  AUDIT_LOGS: 'cekmobil_spp_audit_logs_v1',
};

class StorageService {
  private initialized = false;

  public init() {
    if (this.initialized) return;

    try {
      const existingStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!existingStudents) {
        this.resetToDefaults();
      }
      this.initialized = true;
    } catch (e) {
      console.warn('LocalStorage error, falling back to memory state', e);
    }
  }

  public resetToDefaults() {
    const students = generateInitialStudents();
    const { invoices, payments } = generateSeedInvoicesAndPayments(students);
    const settings = INITIAL_SCHOOL_SETTINGS;
    const currentUser = INITIAL_USER_PROFILES[1]; // default to Bendahara (Siti Aminah) for financial workflows

    const initialAudit: AuditLog[] = [
      {
        id: 'audit-001',
        timestamp: new Date().toISOString(),
        action: 'CREATE',
        entity: 'SETTINGS',
        entityId: 'settings-root',
        description: 'Sistem Keuangan SPP Cekmobil diinisialisasi',
        performedBy: 'System Admin',
      },
      {
        id: 'audit-002',
        timestamp: new Date().toISOString(),
        action: 'GENERATE_INVOICE',
        entity: 'INVOICE',
        entityId: 'batch-2026',
        description: 'Pembuatan tagihan SPP massal semester ganjil 2026/2027',
        performedBy: 'Siti Aminah, S.Ak.',
      }
    ];

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAudit));
  }

  // --- Students ---
  public getStudents(): Student[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public setStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  // --- Invoices ---
  public getInvoices(): Invoice[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public setInvoices(invoices: Invoice[]) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  // --- Payments ---
  public getPayments(): PaymentTransaction[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public setPayments(payments: PaymentTransaction[]) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }

  // --- Settings ---
  public getSettings(): SchoolSettings {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SCHOOL_SETTINGS;
    } catch {
      return INITIAL_SCHOOL_SETTINGS;
    }
  }

  public setSettings(settings: SchoolSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Current User Profile ---
  public getCurrentUser(): UserProfile {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_USER_PROFILES[1];
    } catch {
      return INITIAL_USER_PROFILES[1];
    }
  }

  public setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 300 logs
    if (logs.length > 300) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }
}

export const storageService = new StorageService();
