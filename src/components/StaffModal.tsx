import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import {
  formatDivisionOptionLabel,
  LEADERSHIP_ROLE_OPTIONS,
  STAFF_TYPE_OPTIONS,
  WORK_LOCATION_SUGGESTIONS,
} from '../constants/divisions';
import { Division, LeadershipRole, StaffMember } from '../types';

interface StaffModalProps {
  isOpen: boolean;
  divisions: Division[];
  recentLocations: string[];
  editingStaff: StaffMember | null;
  defaultDivisionId?: string;
  onClose: () => void;
  onSave: (
    payload: {
      name: string;
      role: string;
      staffType: string;
      divisionId: string;
      leadershipRole: LeadershipRole;
      workLocation: string;
    },
    editId?: string
  ) => void;
}

export function StaffModal({
  isOpen,
  divisions,
  recentLocations,
  editingStaff,
  defaultDivisionId = 'unassigned',
  onClose,
  onSave,
}: StaffModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [staffType, setStaffType] = useState('');
  const [divisionId, setDivisionId] = useState(defaultDivisionId);
  const [leadershipRole, setLeadershipRole] = useState<LeadershipRole>('');
  const [isOffsite, setIsOffsite] = useState(false);
  const [workLocation, setWorkLocation] = useState('');
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const locationSuggestions = useMemo(() => {
    const merged = new Set<string>([...recentLocations, ...WORK_LOCATION_SUGGESTIONS]);
    return Array.from(merged).slice(0, 6);
  }, [recentLocations]);

  useEffect(() => {
    if (isOpen) {
      if (editingStaff) {
        setName(editingStaff.name);
        setRole(editingStaff.role);
        setStaffType(editingStaff.staffType || '');
        setDivisionId(editingStaff.divisionId);
        setLeadershipRole(
          editingStaff.divisionId === 'unassigned' ? '' : editingStaff.leadershipRole || ''
        );
        const existingLoc =
          editingStaff.divisionId === 'unassigned' ? '' : (editingStaff.workLocation || '').trim();
        setIsOffsite(Boolean(existingLoc));
        setWorkLocation(existingLoc);
      } else {
        setName('');
        setRole('');
        setStaffType('');
        setDivisionId(defaultDivisionId);
        setLeadershipRole('');
        setIsOffsite(false);
        setWorkLocation('');
      }
      setError('');
      setLocationError('');
      const timer = window.setTimeout(() => {
        nameInputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, editingStaff, defaultDivisionId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    const trimmedStaffType = staffType.trim();
    const trimmedWorkLocation = workLocation.trim();
    if (!trimmedName) {
      setError('กรุณากรอกชื่อ-สกุล');
      nameInputRef.current?.focus();
      return;
    }
    if (divisionId !== 'unassigned' && isOffsite && !trimmedWorkLocation) {
      setLocationError('กรุณาระบุหน่วยงานหรือสถานที่ปฏิบัติงานจริง');
      locationInputRef.current?.focus();
      return;
    }
    onSave(
      {
        name: trimmedName,
        role: trimmedRole,
        staffType: trimmedStaffType,
        divisionId,
        leadershipRole: divisionId === 'unassigned' ? '' : leadershipRole,
        workLocation: divisionId !== 'unassigned' && isOffsite ? trimmedWorkLocation : '',
      },
      editingStaff?.id
    );
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
        aria-labelledby="staff-modal-title"
        className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="staff-modal-title" className="font-heading text-lg font-semibold text-slate-900">
            {editingStaff ? 'แก้ไขข้อมูลเจ้าหน้าที่' : 'เพิ่มรายชื่อเจ้าหน้าที่'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label htmlFor="staff-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              ชื่อ-สกุล <span className="text-red-600">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="staff-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="เช่น นายสมศักดิ์ รักงาน"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          <div>
            <label htmlFor="staff-role" className="block text-sm font-medium text-slate-700 mb-1.5">
              ตำแหน่ง
            </label>
            <input
              id="staff-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="เช่น นักวิชาการแรงงานปฏิบัติการ"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="staff-type" className="block text-sm font-medium text-slate-700 mb-1.5">
              ประเภท
            </label>
            <input
              id="staff-type"
              list="staff-type-datalist"
              type="text"
              value={staffType}
              onChange={(e) => setStaffType(e.target.value)}
              placeholder="เช่น ข้าราชการ, พนักงานราชการ หรือพิมพ์ระบุเอง"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id="staff-type-datalist">
              {STAFF_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} />
              ))}
            </datalist>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {STAFF_TYPE_OPTIONS.map((opt) => {
                const isSelected = staffType.trim() === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStaffType(opt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="staff-division" className="block text-sm font-medium text-slate-700 mb-1.5">
              สังกัดกลุ่มงาน
            </label>
            <select
              id="staff-division"
              value={divisionId}
              onChange={(e) => {
                const nextDiv = e.target.value;
                setDivisionId(nextDiv);
                if (nextDiv === 'unassigned') {
                  setLeadershipRole('');
                  setIsOffsite(false);
                  setWorkLocation('');
                  setLocationError('');
                }
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {formatDivisionOptionLabel(div)}
                </option>
              ))}
            </select>
          </div>

          {divisionId !== 'unassigned' && (
            <>
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                  บทบาทในกลุ่มงาน / ฝ่าย
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {LEADERSHIP_ROLE_OPTIONS.map((opt) => {
                    const isSelected = leadershipRole === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setLeadershipRole(opt.value)}
                        className={`font-heading px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                          isSelected
                            ? opt.value === 'หัวหน้าฝ่าย'
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : opt.value === 'หัวหน้ากลุ่ม'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-slate-800 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100 space-y-2.5">
                <span className="block text-sm font-medium text-slate-700">
                  สถานที่ปฏิบัติงานจริง
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOffsite(false);
                      setLocationError('');
                    }}
                    className={`font-heading px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                      !isOffsite
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    ปฏิบัติงานตามสังกัด
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOffsite(true);
                      window.setTimeout(() => locationInputRef.current?.focus(), 30);
                    }}
                    className={`inline-flex items-center gap-1.5 font-heading px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                      isOffsite
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>ปฏิบัติงานที่อื่น</span>
                  </button>
                </div>

                {isOffsite && (
                  <div className="space-y-2">
                    <input
                      ref={locationInputRef}
                      id="staff-work-location"
                      list="staff-work-location-datalist"
                      type="text"
                      value={workLocation}
                      onChange={(e) => {
                        setWorkLocation(e.target.value);
                        if (locationError) setLocationError('');
                      }}
                      placeholder="เช่น ช่วยปฏิบัติงานกลุ่มงานอื่น, ปฏิบัติงานสำนักงานส่วนกลาง หรือระบุสถานที่อื่น"
                      className="w-full px-3.5 py-2.5 border border-amber-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 bg-amber-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <datalist id="staff-work-location-datalist">
                      {locationSuggestions.map((item) => (
                        <option key={item} value={item} />
                      ))}
                      {divisions
                        .filter((d) => !d.isPool && d.id !== divisionId)
                        .map((d) => (
                          <option key={d.id} value={`ช่วยปฏิบัติงาน ${d.name}`} />
                        ))}
                    </datalist>
                    {locationError && <p className="text-xs text-red-600">{locationError}</p>}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {locationSuggestions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setWorkLocation(opt);
                            if (locationError) setLocationError('');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            workLocation.trim() === opt
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
