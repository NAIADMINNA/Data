import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Division } from '../types';

interface DivisionModalProps {
  isOpen: boolean;
  editingDivision: Division | null;
  nextDivisionNum: string;
  assignedStaffCount: number;
  onClose: () => void;
  onSave: (name: string, editId?: string) => void;
  onDelete: (divisionId: string) => void;
}

export function DivisionModal({
  isOpen,
  editingDivision,
  nextDivisionNum,
  assignedStaffCount,
  onClose,
  onSave,
  onDelete,
}: DivisionModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(editingDivision ? editingDivision.name : '');
      setError('');
      setConfirmingDelete(false);
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
        if (editingDivision) {
          inputRef.current?.select();
        }
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, editingDivision]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayNum = (editingDivision ? editingDivision.num : nextDivisionNum).padStart(2, '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('กรุณากรอกชื่อกลุ่มงานหรือฝ่าย');
      inputRef.current?.focus();
      return;
    }
    onSave(trimmed, editingDivision?.id);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="division-modal-title"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-heading text-xs font-bold tabular-nums flex items-center justify-center shrink-0">
              {displayNum}
            </span>
            <h2
              id="division-modal-title"
              className="font-heading text-lg font-semibold text-slate-900"
            >
              {editingDivision ? 'แก้ไขชื่อกลุ่มงาน / ฝ่าย' : 'เพิ่มกลุ่มงานในสังกัด'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="division-name-input"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              ชื่อกลุ่มงาน / ฝ่าย <span className="text-red-600">*</span>
            </label>
            <input
              ref={inputRef}
              id="division-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="เช่น กลุ่มงานบริหารจัดการข้อมูลแรงงานต่างด้าว หรือ ฝ่ายประสานงาน"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          {editingDivision && confirmingDelete && (
            <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 space-y-2.5">
              <div className="flex items-start gap-2 text-xs text-red-800 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  ยืนยันการลบ <strong>"{editingDivision.name}"</strong> หรือไม่?
                  {assignedStaffCount > 0
                    ? ` รายชื่อเจ้าหน้าที่ในสังกัดจำนวน ${assignedStaffCount} คน จะถูกย้ายกลับไปที่รายชื่อรอจัดสรรอัตโนมัติ`
                    : ' กลุ่มงานนี้ยังไม่มีรายชื่อเจ้าหน้าที่ในสังกัด'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="font-heading px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  ยกเลิกการลบ
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(editingDivision.id)}
                  className="font-heading px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0"
                >
                  ยืนยันลบกลุ่มงาน
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
            <div>
              {editingDivision && !confirmingDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="inline-flex items-center gap-1.5 font-heading px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบกลุ่มงานนี้</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="font-heading px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="font-heading px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {editingDivision ? 'บันทึกชื่อใหม่' : 'เพิ่มกลุ่มงาน'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
