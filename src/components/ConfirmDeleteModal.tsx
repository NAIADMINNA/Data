import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { StaffMember } from '../types';

interface ConfirmDeleteModalProps {
  staffToDelete: StaffMember | null;
  isClearAllOpen?: boolean;
  totalCount?: number;
  onClose: () => void;
  onConfirm: (staffId: string) => void;
  onConfirmClearAll?: () => void;
}

export function ConfirmDeleteModal({
  staffToDelete,
  isClearAllOpen = false,
  totalCount = 0,
  onClose,
  onConfirm,
  onConfirmClearAll,
}: ConfirmDeleteModalProps) {
  const isOpen = Boolean(staffToDelete) || isClearAllOpen;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isClearingAll = isClearAllOpen && !staffToDelete;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-desc"
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
            <h2 id="delete-modal-title" className="font-heading text-base font-semibold text-slate-900">
              {isClearingAll ? 'ล้างรายชื่อเจ้าหน้าที่ทั้งหมด?' : 'ลบรายชื่อเจ้าหน้าที่?'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isClearingAll ? (
            <p id="delete-modal-desc" className="text-sm text-slate-600 leading-relaxed">
              ต้องการล้างข้อมูลรายชื่อเจ้าหน้าที่ทั้งหมดจำนวน{' '}
              <span className="font-semibold text-slate-900 tabular-nums">{totalCount} คน</span>{' '}
              ออกจากระบบเพื่อเริ่มต้นใหม่หรือไม่
            </p>
          ) : (
            <p id="delete-modal-desc" className="text-sm text-slate-600 leading-relaxed">
              ต้องการลบ{' '}
              <span className="font-semibold text-slate-900">"{staffToDelete?.name}"</span>{' '}
              ออกจากระบบหรือไม่
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="font-heading px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                if (isClearingAll) {
                  onConfirmClearAll?.();
                } else if (staffToDelete) {
                  onConfirm(staffToDelete.id);
                }
              }}
              className="font-heading px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {isClearingAll ? 'ล้างรายชื่อทั้งหมด' : 'ลบรายชื่อ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
