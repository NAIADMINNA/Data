/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Plus, RotateCcw, Search, Trash2, Upload, X } from 'lucide-react';
import { BoardView } from './components/BoardView';
import { BulkImportModal } from './components/BulkImportModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { StaffModal } from './components/StaffModal';
import { TableView } from './components/TableView';
import { ToastContainer } from './components/ToastContainer';
import {
  DIVISIONS,
  formatDivisionOptionLabel,
  INITIAL_STAFF,
  STORAGE_KEY,
} from './constants/divisions';
import { StaffMember, ToastMessage, ViewMode } from './types';

function loadInitialStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STAFF;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as Record<string, unknown>).id === 'string' &&
            typeof (item as Record<string, unknown>).name === 'string' &&
            typeof (item as Record<string, unknown>).divisionId === 'string'
        )
        .map((item) => ({
          id: item.id as string,
          name: item.name as string,
          role: typeof item.role === 'string' ? item.role : '',
          staffType: typeof item.staffType === 'string' ? item.staffType : '',
          divisionId: item.divisionId as string,
        }));
    }
    return INITIAL_STAFF;
  } catch {
    return INITIAL_STAFF;
  }
}

export default function App() {
  const [staffList, setStaffList] = useState<StaffMember[]>(loadInitialStaff);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.BOARD);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState('ALL');

  // Modal states
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [defaultModalDivisionId, setDefaultModalDivisionId] = useState('unassigned');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(staffList));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [staffList]);

  const pushToast = useCallback((title: string, variant: ToastMessage['variant'] = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, title, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredStaff = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return staffList.filter((person) => {
      const matchSearch =
        !keyword ||
        person.name.toLowerCase().includes(keyword) ||
        (person.role || '').toLowerCase().includes(keyword) ||
        (person.staffType || '').toLowerCase().includes(keyword);
      const matchDiv = filterDivision === 'ALL' || person.divisionId === filterDivision;
      return matchSearch && matchDiv;
    });
  }, [staffList, searchQuery, filterDivision]);

  const visibleDivisions = useMemo(() => {
    return filterDivision === 'ALL'
      ? DIVISIONS
      : DIVISIONS.filter((d) => d.id === filterDivision);
  }, [filterDivision]);

  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    staffList.forEach((s) => {
      counts[s.divisionId] = (counts[s.divisionId] || 0) + 1;
    });
    return counts;
  }, [staffList]);

  const unassignedCount = divisionCounts['unassigned'] || 0;
  const assignedCount = staffList.length - unassignedCount;

  const handleOpenAddModal = (divisionId = 'unassigned') => {
    setEditingStaff(null);
    setDefaultModalDivisionId(divisionId);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setDefaultModalDivisionId(staff.divisionId);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (
    payload: { name: string; role: string; staffType: string; divisionId: string },
    editId?: string
  ) => {
    if (editId) {
      setStaffList((prev) =>
        prev.map((item) => (item.id === editId ? { ...item, ...payload } : item))
      );
      pushToast(`บันทึกข้อมูล "${payload.name}" เรียบร้อยแล้ว`, 'success');
    } else {
      const newMember: StaffMember = {
        id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ...payload,
      };
      setStaffList((prev) => [...prev, newMember]);
      pushToast(`เพิ่มรายชื่อ "${payload.name}" เรียบร้อยแล้ว`, 'success');
    }
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  const handleBulkImport = (
    entries: Array<{ name: string; role: string; staffType: string }>,
    divisionId: string
  ) => {
    const timestamp = Date.now();
    const added: StaffMember[] = entries.map((entry, idx) => ({
      id: `st_${timestamp}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
      name: entry.name,
      role: entry.role,
      staffType: entry.staffType,
      divisionId,
    }));
    setStaffList((prev) => [...prev, ...added]);
    setIsBulkModalOpen(false);
    pushToast(`นำเข้าสำเร็จ ${added.length} รายชื่อ`, 'success');
  };

  const handleMoveStaff = (staffId: string, targetDivisionId: string) => {
    const person = staffList.find((s) => s.id === staffId);
    if (!person || person.divisionId === targetDivisionId) return;

    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, divisionId: targetDivisionId } : s))
    );

    const targetDiv = DIVISIONS.find((d) => d.id === targetDivisionId);
    if (targetDiv) {
      const targetLabel = targetDiv.isPool ? 'รายการรอจัดสรร' : `กลุ่มงานที่ ${targetDiv.num}`;
      pushToast(`ย้าย "${person.name}" ไปยัง ${targetLabel} แล้ว`, 'success');
    }
  };

  const handleConfirmDelete = (staffId: string) => {
    const target = staffList.find((s) => s.id === staffId);
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    setStaffToDelete(null);
    if (target) {
      pushToast(`ลบรายชื่อ "${target.name}" ออกจากระบบแล้ว`, 'danger');
    }
  };

  const handleConfirmClearAll = () => {
    setStaffList([]);
    setIsClearAllModalOpen(false);
    pushToast('ล้างรายชื่อทั้งหมดเรียบร้อยแล้ว', 'danger');
  };

  const handleExportCSV = () => {
    const headers = ['ลำดับ', 'ชื่อ-สกุล', 'ตำแหน่ง', 'ประเภท', 'รหัสกลุ่มงาน', 'ชื่อกลุ่มงาน'];
    const rows = staffList.map((s, i) => {
      const div = DIVISIONS.find((d) => d.id === s.divisionId) || DIVISIONS[0];
      return [
        i + 1,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.role || '').replace(/"/g, '""')}"`,
        `"${(s.staffType || '').replace(/"/g, '""')}"`,
        div.num,
        `"${div.name.replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายชื่อเจ้าหน้าที่ตามกลุ่มงาน_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    pushToast('ส่งออกไฟล์ Excel (CSV) เรียบร้อยแล้ว', 'info');
  };

  const hasActiveFilter = searchQuery.trim().length > 0 || filterDivision !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setFilterDivision('ALL');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      {/* Top Bar (Strict 3-Zone Contract) */}
      <header className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              resetFilters();
              setCurrentView(ViewMode.BOARD);
            }}
            className="font-heading text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 truncate"
          >
            ระบบจัดสรรรายชื่อเจ้าหน้าที่ตามกลุ่มงาน
          </a>

          <nav
            aria-label="เมนูหลัก"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => setCurrentView(ViewMode.BOARD)}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                currentView === ViewMode.BOARD ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              บอร์ดจัดสรร
            </button>
            <button
              type="button"
              onClick={() => setCurrentView(ViewMode.TABLE)}
              className={`hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                currentView === ViewMode.TABLE ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              ตารางรวม
            </button>
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              นำเข้าหลายรายชื่อ
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              ส่งออก CSV
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() =>
                handleOpenAddModal(filterDivision !== 'ALL' ? filterDivision : 'unassigned')
              }
              className="inline-flex items-center gap-1.5 font-heading bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเจ้าหน้าที่</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Single Unified Command & Summary Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          {/* Left: Search & Division Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative w-full sm:w-72">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ-สกุล ตำแหน่ง หรือประเภท..."
                aria-label="ค้นหาชื่อ-สกุล ตำแหน่ง หรือประเภท"
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200/90 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="ล้างคำค้นหา"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              aria-label="กรองตามกลุ่มงาน"
              className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
            >
              <option value="ALL">แสดงทุกกลุ่มงาน ({staffList.length} คน)</option>
              {DIVISIONS.map((d) => {
                const count = divisionCounts[d.id] || 0;
                return (
                  <option key={d.id} value={d.id}>
                    {formatDivisionOptionLabel(d)} ({count} คน)
                  </option>
                );
              })}
            </select>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200/60 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>

          {/* Right: Live Metrics, Secondary Actions & View Toggle */}
          <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 tabular-nums">
              <span>
                ทั้งหมด <strong className="font-semibold text-slate-900">{staffList.length}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>
                จัดสรรแล้ว <strong className="font-semibold text-blue-700">{assignedCount}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>
                รอจัดสรร <strong className="font-semibold text-amber-700">{unassignedCount}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="md:hidden inline-flex items-center gap-1.5 font-heading bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200/90 transition-colors whitespace-nowrap shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>นำเข้า</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="md:hidden inline-flex items-center gap-1.5 font-heading bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200/90 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>CSV</span>
              </button>

              {staffList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(true)}
                  title="ล้างรายชื่อทั้งหมดเพื่อเริ่มใหม่"
                  className="inline-flex items-center gap-1 font-heading text-xs font-medium text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50/70 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างข้อมูล</span>
                </button>
              )}

              <div
                role="group"
                aria-label="สลับมุมมองการแสดงผล"
                className="inline-flex rounded-xl bg-slate-200/70 p-1 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setCurrentView(ViewMode.BOARD)}
                  className={`font-heading px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    currentView === ViewMode.BOARD
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  บอร์ด
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView(ViewMode.TABLE)}
                  className={`font-heading px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    currentView === ViewMode.TABLE
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ตาราง
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active View Content */}
        {currentView === ViewMode.BOARD ? (
          <BoardView
            divisions={visibleDivisions}
            filteredStaff={filteredStaff}
            totalStaffCount={staffList.length}
            onMoveStaff={handleMoveStaff}
            onEditStaff={handleOpenEditModal}
            onDeleteStaff={(staff) => setStaffToDelete(staff)}
            onAddInDivision={(divId) => handleOpenAddModal(divId)}
          />
        ) : (
          <TableView
            filteredStaff={filteredStaff}
            hasActiveFilter={hasActiveFilter}
            onMoveStaff={handleMoveStaff}
            onEditStaff={handleOpenEditModal}
            onDeleteStaff={(staff) => setStaffToDelete(staff)}
            onResetFilters={resetFilters}
            onAddStaff={() => handleOpenAddModal('unassigned')}
          />
        )}
      </main>

      {/* Modals & Toasts */}
      <StaffModal
        isOpen={isStaffModalOpen}
        editingStaff={editingStaff}
        defaultDivisionId={defaultModalDivisionId}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleSaveStaff}
      />

      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImport={handleBulkImport}
      />

      <ConfirmDeleteModal
        staffToDelete={staffToDelete}
        isClearAllOpen={isClearAllModalOpen}
        totalCount={staffList.length}
        onClose={() => {
          setStaffToDelete(null);
          setIsClearAllModalOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        onConfirmClearAll={handleConfirmClearAll}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
