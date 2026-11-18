import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, RotateCcw, X } from 'lucide-react';
import { WORK_LOCATION_SUGGESTIONS } from '../constants/divisions';
import { Division, StaffMember } from '../types';

interface WorkLocationModalProps {
  staff: StaffMember | null;
  divisions: Division[];
  recentLocations: string[];
  onClose: () => void;
  onSave: (staffId: string, workLocation: string) => void;
}

export function WorkLocationModal({
  staff,
  divisions,
  recentLocations,
  onClose,
  onSave,
}: WorkLocationModalProps) {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = Boolean(staff);

  useEffect(() => {
    if (staff) {
      setLocation(staff.workLocation || '');
      setError('');
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [staff]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentDivision = useMemo(
    () => (staff ? divisions.find((d) => d.id === staff.divisionId) : undefined),
    [staff, divisions]
  );

  const otherDivisions = useMemo(
    () => divisions.filter((d) => !d.isPool && d.id !== staff?.divisionId),
    [divisions, staff]
  );

  const quickSuggestions = useMemo(() => {
    const merged = new Set<string>([...recentLocations, ...WORK_LOCATION_SUGGESTIONS]);
    return Array.from(merged).slice(0, 8);
  }, [recentLocations]);

  if (!staff) return null;

  const hasExistingLocation = Boolean((staff.workLocation || '').trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = location.trim();
    if (!trimmed) {
      setError('กรุณาระบุหน่วยงานหรือสถานที่ปฏิบัติงานจริง (หรือกด "ปฏิบัติงานตามสังกัด" เพื่อยกเลิก)');
      inputRef.current?.focus();
      return;
    }
    onSave(staff.id, trimmed);
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
        aria-labelledby="work-location-modal-title"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <MapPin className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
            <h2
              id="work-location-modal-title"
              className="font-heading text-base sm:text-lg font-semibold text-slate-900 truncate"
            >
              ระบุกรณีปฏิบัติงานที่อื่น
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
          <div className="text-xs sm:text-sm text-slate-600 space-y-0.5 pb-3 border-b border-slate-100">
            <div className="font-semibold text-slate-900">{staff.name}</div>
            <div className="text-xs text-slate-500">
              สังกัดปัจจุบัน: {currentDivision ? `${currentDivision.num}) ${currentDivision.name}` : '-'}
            </div>
          </div>

          <div>
            <label
              htmlFor="work-location-input"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              สถานที่ / หน่วยงานที่ไปปฏิบัติงานจริง <span className="text-red-600">*</span>
            </label>
            <input
              ref={inputRef}
              id="work-location-input"
              list="work-location-datalist"
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (error) setError('');
              }}
              placeholder="เช่น ช่วยปฏิบัติงานกลุ่มงานอื่น, ปฏิบัติงานสำนักงานส่วนกลาง หรือระบุสถานที่อื่น"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <datalist id="work-location-datalist">
              {quickSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
              {otherDivisions.map((div) => (
                <option key={div.id} value={`ช่วยปฏิบัติงาน ${div.name}`} />
              ))}
            </datalist>
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500">เลือกข้อความที่ใช้บ่อย</div>
            <div className="flex flex-wrap items-center gap-1.5">
              {quickSuggestions.map((opt) => {
                const isSelected = location.trim() === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setLocation(opt);
                      if (error) setError('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {otherDivisions.length > 0 && (
            <div>
              <label
                htmlFor="work-location-other-div"
                className="block text-xs font-medium text-slate-500 mb-1.5"
              >
                หรือเลือกกรณีไปช่วยปฏิบัติงานในกลุ่มงานอื่นของสังกัด
              </label>
              <select
                id="work-location-other-div"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setLocation(e.target.value);
                    if (error) setError('');
                  }
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 bg-slate-50/70 hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- เลือกกลุ่มงานปลายทางที่ไปช่วยปฏิบัติงาน --</option>
                {otherDivisions.map((div) => (
                  <option key={div.id} value={`ช่วยปฏิบัติงาน ${div.name}`}>
                    {div.num}) {div.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
            <div>
              {hasExistingLocation && (
                <button
                  type="button"
                  onClick={() => onSave(staff.id, '')}
                  className="inline-flex items-center gap-1.5 font-heading px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ปฏิบัติงานตามสังกัด</span>
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
                className="font-heading px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                บันทึกสถานที่ปฏิบัติงาน
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
