import { Student, StudentStatus } from '../types';
import { storageService } from './storage';

export const studentService = {
  getAll(): Student[] {
    return storageService.getStudents();
  },

  getById(id: string): Student | undefined {
    return storageService.getStudents().find(s => s.id === id);
  },

  getByNis(nis: string): Student | undefined {
    return storageService.getStudents().find(s => s.nis.trim() === nis.trim());
  },

  search(query: string, kelasFilter?: string, majorFilter?: string, statusFilter?: StudentStatus | 'all'): Student[] {
    let list = storageService.getStudents();

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(s => 
        s.nama.toLowerCase().includes(q) || 
        s.nis.toLowerCase().includes(q) ||
        s.alamat.toLowerCase().includes(q)
      );
    }

    if (kelasFilter && kelasFilter !== 'all') {
      list = list.filter(s => s.kelas === kelasFilter);
    }

    if (majorFilter && majorFilter !== 'all') {
      list = list.filter(s => s.programKeahlian === majorFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(s => s.status === statusFilter);
    }

    return list;
  },

  create(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Student {
    const students = storageService.getStudents();
    
    // Check duplicate NIS
    const existing = students.find(s => s.nis.trim() === studentData.nis.trim());
    if (existing) {
      throw new Error(`Siswa dengan NIS ${studentData.nis} sudah terdaftar.`);
    }

    const newStudent: Student = {
      ...studentData,
      id: `std-${studentData.nis}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    students.unshift(newStudent);
    storageService.setStudents(students);

    storageService.addAuditLog({
      action: 'CREATE',
      entity: 'STUDENT',
      entityId: newStudent.id,
      description: `Menambahkan siswa baru: ${newStudent.nama} (${newStudent.nis}) di kelas ${newStudent.kelas}`,
      performedBy: storageService.getCurrentUser().name,
    });

    return newStudent;
  },

  update(id: string, updates: Partial<Student>): Student {
    const students = storageService.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Data siswa tidak ditemukan.');
    }

    // Check duplicate NIS if changed
    if (updates.nis && updates.nis !== students[index].nis) {
      const dup = students.find(s => s.nis === updates.nis && s.id !== id);
      if (dup) {
        throw new Error(`NIS ${updates.nis} sudah digunakan oleh siswa lain.`);
      }
    }

    const updatedStudent: Student = {
      ...students[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    students[index] = updatedStudent;
    storageService.setStudents(students);

    storageService.addAuditLog({
      action: 'UPDATE',
      entity: 'STUDENT',
      entityId: id,
      description: `Memperbarui data siswa: ${updatedStudent.nama} (${updatedStudent.nis})`,
      performedBy: storageService.getCurrentUser().name,
    });

    return updatedStudent;
  },

  delete(id: string): boolean {
    const students = storageService.getStudents();
    const target = students.find(s => s.id === id);
    if (!target) return false;

    // Remove student
    const filtered = students.filter(s => s.id !== id);
    storageService.setStudents(filtered);

    storageService.addAuditLog({
      action: 'DELETE',
      entity: 'STUDENT',
      entityId: id,
      description: `Menghapus siswa: ${target.nama} (${target.nis})`,
      performedBy: storageService.getCurrentUser().name,
    });

    return true;
  },

  bulkImport(newStudents: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]): { added: number; skipped: number } {
    const students = storageService.getStudents();
    let added = 0;
    let skipped = 0;

    newStudents.forEach(item => {
      const exists = students.some(s => s.nis.trim() === item.nis.trim());
      if (exists) {
        skipped++;
      } else {
        const student: Student = {
          ...item,
          id: `std-${item.nis}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        students.push(student);
        added++;
      }
    });

    storageService.setStudents(students);

    if (added > 0) {
      storageService.addAuditLog({
        action: 'CREATE',
        entity: 'STUDENT',
        entityId: 'bulk-import',
        description: `Import massal CSV: ${added} siswa baru ditambahkan, ${skipped} diabaikan (duplikat).`,
        performedBy: storageService.getCurrentUser().name,
      });
    }

    return { added, skipped };
  }
};
