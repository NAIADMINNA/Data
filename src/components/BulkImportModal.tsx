import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import {
  formatDivisionOptionLabel,
  STAFF_TYPE_OPTIONS,
} from '../constants/divisions';
import { Division } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  divisions: Division[];
  onClose: () => void;
  onImport: (
    entries: Array<{ name: string; role: string; staffType: string }>,
    divisionId: string
  ) => void;
}

export function BulkImportModal({ isOpen, divisions, onClose, onImport }: BulkImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [defaultStaffType, setDefaultStaffType] = useState('');
  const [divisionId, setDivisionId] = useState('unassigned');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRawText('');
      setDefaultStaffType('');
      setDivisionId('unassigned');
      setError('');
      const timer = window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const parsedEntries = useMemo(() => {
    const fallbackType = defaultStaffType.trim();
    return rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        // Support both Excel/Sheets tab-separated paste (\t) and comma-separated (,)
        const delimiter = line.includes('\t') ? '\t' : ',';
        const parts = line.split(delimiter).map((p) => p.replace(/^"|"$/g, '').trim());
        const name = parts[0] ?? '';
        const role = parts[1] ?? '';
        const staffType = parts.slice(2).join(', ').trim() || fallbackType;
        return { name, role, staffType };
      })
      .filter(
        (item) =>
          item.name.length > 0 &&
          item.name !== 'ชื่อ-นามสกุล' &&
          item.name !== 'ชื่อ-สกุล' &&
          item.name !== 'ชื่อ - นามสกุล'
      );
  }, [rawText, defaultStaffType]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const cleaned = text.replace(/^\uFEFF/, '');
      const lines = cleaned
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      // Detect exported 6-column (ลำดับ,ชื่อ-สกุล,ตำแหน่ง,ประเภท,รหัส,ชื่อกลุ่มงาน) or 5-column CSV
      const firstHeader = lines[0] || '';
      const hasStaffTypeCol = firstHeader.includes('ประเภท');

      const converted = lines
        .filter(
          (line, idx) =>
            !(idx === 0 && (line.includes('ชื่อ-สกุล') || line.includes('ชื่อ-นามสกุล')))
        )
        .map((line) => {
          const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3 && /^\d+$/.test(cols[0])) {
            const nameCol = cols[1] || '';
            const roleCol = cols[2] || '';
            const typeCol = hasStaffTypeCol && cols.length >= 4 ? cols[3] || '' : '';
            if (typeCol) return `${nameCol}, ${roleCol}, ${typeCol}`;
            if (roleCol) return `${nameCol}, ${roleCol}`;
            return nameCol;
          }
          return line;
        });

      setRawText((prev) =>
        prev.trim() ? `${prev.trim()}\n${converted.join('\n')}` : converted.join('\n')
      );
      setError('');
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedEntries.length === 0) {
      setError('กรุณาวางรายชื่ออย่างน้อย 1 บรรทัด');
      textareaRef.current?.focus();
      return;
    }
    onImport(parsedEntries, divisionId);
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
        aria-labelledby="bulk-modal-title"
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="bulk-modal-title" className="font-heading text-lg font-semibold text-slate-900">
            นำเข้าหลายรายชื่อพร้อมกัน
          </h2>
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
            <p className="text-xs text-slate-600 leading-relaxed">
              พิมพ์หรือคัดลอกจาก Excel มาวางได้โดยตรงตามหัวข้อ{' '}
              <strong className="font-semibold text-slate-800">ชื่อ-สกุล, ตำแหน่ง, ประเภท</strong>{' '}
              (คั่นด้วยจุลภาค <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800">,</code>{' '}
              หรือคอลัมน์ Tab) เช่น{' '}
              <code className="px-1 py-0.5 bg-slate-100 rounded text-slate-800">
                นายสมชาย ใจดี, นักวิชาการแรงงาน, ข้าราชการ
              </code>
            </p>
            <div className="shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                อ่านจากไฟล์ .txt/.csv
              </button>
            </div>
          </div>

          <div>
            <textarea
              ref={textareaRef}
              rows={5}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                'นายกิตติพงศ์ ทองดี, นักวิชาการแรงงานชำนาญการ, ข้าราชการ\nนางสาวชลธิชา นามสมมติ, นักจัดการงานทั่วไป, พนักงานราชการ'
              }
              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : (
                <span className="text-slate-500 tabular-nums">
                  ตรวจพบรายชื่อพร้อมนำเข้า {parsedEntries.length} คน
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="bulk-default-type"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                ประเภทเริ่มต้น (กรณีไม่ได้ระบุในบรรทัด)
              </label>
              <input
                id="bulk-default-type"
                list="bulk-staff-type-datalist"
                type="text"
                value={defaultStaffType}
                onChange={(e) => setDefaultStaffType(e.target.value)}
                placeholder="เช่น ข้าราชการ หรือเว้นว่าง"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <datalist id="bulk-staff-type-datalist">
                {STAFF_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>

            <div>
              <label
                htmlFor="bulk-division"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                นำเข้าไว้ที่กลุ่มงานเริ่มต้น
              </label>
              <select
                id="bulk-division"
                value={divisionId}
                onChange={(e) => setDivisionId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {formatDivisionOptionLabel(div)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
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
              นำเข้ารายชื่อ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
