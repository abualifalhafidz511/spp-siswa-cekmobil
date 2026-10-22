const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Returns month name in Indonesian (1-12)
 */
export function getNamaBulan(bulanNumber: number): string {
  const index = Math.max(1, Math.min(12, bulanNumber)) - 1;
  return NAMA_BULAN[index] || '';
}

export function getNamaBulanPendek(bulanNumber: number): string {
  const index = Math.max(1, Math.min(12, bulanNumber)) - 1;
  return NAMA_BULAN_PENDEK[index] || '';
}

/**
 * Formats date into standard Indonesian format: "22 Oktober 2026"
 */
export function formatTanggalIndo(dateStrOrObj: string | Date | undefined): string {
  if (!dateStrOrObj) return '-';
  try {
    const d = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
    if (isNaN(d.getTime())) return '-';
    
    const day = d.getDate();
    const month = NAMA_BULAN[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '-';
  }
}

/**
 * Formats date and time: "22 Okt 2026, 14:30 WIB"
 */
export function formatTanggalWaktu(dateStrOrObj: string | Date | undefined): string {
  if (!dateStrOrObj) return '-';
  try {
    const d = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
    if (isNaN(d.getTime())) return '-';
    
    const day = d.getDate();
    const month = NAMA_BULAN_PENDEK[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  } catch {
    return '-';
  }
}

/**
 * Formats period: "Oktober 2026"
 */
export function formatPeriodeBulan(bulan: number, tahun: number): string {
  return `${getNamaBulan(bulan)} ${tahun}`;
}

/**
 * Checks if a due date string has passed
 */
export function isDueDatePassed(dueDateStr: string): boolean {
  if (!dueDateStr) return false;
  const due = new Date(dueDateStr);
  const now = new Date();
  // Set to end of due date day
  due.setHours(23, 59, 59, 999);
  return now.getTime() > due.getTime();
}
