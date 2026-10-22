import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { Student, StudentStatus, PageView } from '../types';
import { studentService } from '../services/studentService';
import { formatRupiah } from '../utils/currency';
import { formatTanggalIndo } from '../utils/date';
import { StatusBadge } from '../components/common/StatusBadge';
import { StudentFormModal } from '../components/students/StudentFormModal';
import { StudentDetailModal } from '../components/students/StudentDetailModal';
import { ImportExportModal } from '../components/students/ImportExportModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { INITIAL_SCHOOL_SETTINGS } from '../data/initialSettings';

interface StudentsPageProps {
  onNavigate: (page: PageView) => void;
  onPayForStudent: (studentId: string, invoiceId?: string) => void;
  isAddModalOpenInitially?: boolean;
  onCloseInitialAddModal?: () => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  onNavigate,
  onPayForStudent,
  isAddModalOpenInitially = false,
  onCloseInitialAddModal,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | 'all'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(isAddModalOpenInitially);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Trigger state refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  // Data querying
  const filteredStudents = useMemo(() => {
    return studentService.search(searchQuery, selectedClass, selectedMajor, selectedStatus);
  }, [searchQuery, selectedClass, selectedMajor, selectedStatus, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingStudent) {
      studentService.update(editingStudent.id, data);
    } else {
      studentService.create(data);
    }
    triggerRefresh();
    if (onCloseInitialAddModal) onCloseInitialAddModal();
  };

  const handleDeleteStudent = () => {
    if (studentToDelete) {
      studentService.delete(studentToDelete.id);
      setStudentToDelete(null);
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            <span>Manajemen Data Siswa</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Daftar seluruh siswa aktif, alumni, dan penetapan besaran SPP bulanan SMK Otomotif Cekmobil
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-zinc-500" />
            <span>Impor / Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama, NIS, atau alamat..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Kelas</option>
              {INITIAL_SCHOOL_SETTINGS.daftarKelas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Program Keahlian */}
          <div>
            <select
              value={selectedMajor}
              onChange={(e) => {
                setSelectedMajor(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Program Keahlian</option>
              {INITIAL_SCHOOL_SETTINGS.daftarProgramKeahlian.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            >
              <option value="all">Semua Status Siswa</option>
              <option value="aktif">Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100">
          <span>
            Menampilkan <strong>{filteredStudents.length}</strong> siswa dari total{' '}
            <strong>{studentService.getAll().length}</strong> data terdaftar.
          </span>
          {(searchQuery || selectedClass !== 'all' || selectedMajor !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('all');
                setSelectedMajor('all');
                setSelectedStatus('all');
                setCurrentPage(1);
              }}
              className="text-red-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-bold uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">JK</th>
                <th className="py-3 px-4">Kelas & Program</th>
                <th className="py-3 px-4">No. WA Wali</th>
                <th className="py-3 px-4">SPP / Bulan</th>
                <th className="py-3 px-4">Tgl Masuk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <p className="font-semibold text-zinc-600">Tidak ada data siswa yang cocok.</p>
                    <p className="text-xs text-zinc-400 mt-1">Coba ubah kata kunci pencarian atau filter Anda.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                      {student.nis}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{student.nama}</div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-xs">{student.alamat}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${student.jenisKelamin === 'L' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'}`}>
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-800">{student.kelas}</div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[160px]">{student.programKeahlian}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600">
                      {student.noWhatsapp}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900">
                      {formatRupiah(student.nominalSpp)}
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {formatTanggalIndo(student.tanggalMasuk)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={student.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailStudent(student)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                          title="Buku Keuangan & Profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-zinc-800">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
          if (onCloseInitialAddModal) onCloseInitialAddModal();
        }}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
      />

      <StudentDetailModal
        isOpen={!!detailStudent}
        onClose={() => setDetailStudent(null)}
        student={detailStudent}
        onPayForStudent={onPayForStudent}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onSuccess={triggerRefresh}
      />

      <ConfirmDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteStudent}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa ${studentToDelete?.nama} (${studentToDelete?.nis})? Tindakan ini akan menghapus catatan siswa dari basis data.`}
        confirmLabel="Hapus Siswa"
        isDestructive={true}
      />
    </div>
  );
};
