import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Rows3,
  Trash2,
} from 'lucide-react';
import {
  formatDivisionOptionLabel,
  getLeadershipRank,
  getThaiInitial,
} from '../constants/divisions';
import { Division, LeadershipRole, StaffMember } from '../types';

interface BoardViewProps {
  divisions: Division[];
  allDivisions: Division[];
  filteredStaff: StaffMember[];
  totalStaffCount: number;
  onMoveStaff: (staffId: string, targetDivisionId: string) => void;
  onUpdateLeadershipRole: (staffId: string, leadershipRole: LeadershipRole) => void;
  onEditWorkLocation: (staff: StaffMember) => void;
  onEditStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staff: StaffMember) => void;
  onAddInDivision: (divisionId: string) => void;
  onAddDivision: () => void;
  onEditDivision: (division: Division) => void;
}

export function BoardView({
  divisions,
  allDivisions,
  filteredStaff,
  onMoveStaff,
  onUpdateLeadershipRole,
  onEditWorkLocation,
  onEditStaff,
  onDeleteStaff,
  onAddInDivision,
  onAddDivision,
  onEditDivision,
}: BoardViewProps) {
  const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
  const [activeDropDivId, setActiveDropDivId] = useState<string | null>(null);
  const [divisionLayout, setDivisionLayout] = useState<'grid2' | 'stack'>('grid2');
  const [hideEmptyDivisions, setHideEmptyDivisions] = useState(false);
  const [collapsedDivIds, setCollapsedDivIds] = useState<Record<string, boolean>>({});
  const [poolRoleFilter, setPoolRoleFilter] = useState<string>('ALL');
  const [poolTypeFilter, setPoolTypeFilter] = useState<string>('ALL');

  const poolDivision = divisions.find((d) => d.isPool);
  const regularDivisions = divisions.filter((d) => !d.isPool);
  const onlyPoolSelected = divisions.length === 1 && Boolean(divisions[0]?.isPool);
  const isSplitMode = Boolean(poolDivision) && !onlyPoolSelected;

  const populatedDivCount = useMemo(
    () =>
      regularDivisions.filter((d) => filteredStaff.some((s) => s.divisionId === d.id)).length,
    [regularDivisions, filteredStaff]
  );
  const emptyDivCount = regularDivisions.length - populatedDivCount;

  const displayedRegularDivisions = useMemo(() => {
    if (!hideEmptyDivisions || draggedStaffId || regularDivisions.length <= 1) {
      return regularDivisions;
    }
    return regularDivisions.filter((d) =>
      filteredStaff.some((s) => s.divisionId === d.id)
    );
  }, [regularDivisions, hideEmptyDivisions, draggedStaffId, filteredStaff]);

  const toggleCollapseDivision = (divId: string) => {
    setCollapsedDivIds((prev) => ({ ...prev, [divId]: !prev[divId] }));
  };

  const draggedPerson = draggedStaffId
    ? filteredStaff.find((s) => s.id === draggedStaffId)
    : null;

  const handleDragStart = (e: React.DragEvent<HTMLElement>, staffId: string) => {
    setDraggedStaffId(staffId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', staffId);
  };

  const handleDragEnd = () => {
    setDraggedStaffId(null);
    setActiveDropDivId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>, divId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropDivId !== divId) {
      setActiveDropDivId(divId);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>, divId: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (activeDropDivId === divId) {
        setActiveDropDivId(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, targetDivId: string) => {
    e.preventDefault();
    const idFromTransfer = e.dataTransfer.getData('text/plain');
    const staffId = draggedStaffId || idFromTransfer;
    setActiveDropDivId(null);
    setDraggedStaffId(null);
    if (staffId) {
      onMoveStaff(staffId, targetDivId);
    }
  };

  const renderMoveSelector = (person: StaffMember) => (
    <div className="relative flex items-center min-w-0">
      <select
        id={`move-${person.id}`}
        aria-label={`ย้ายกลุ่มงานของ ${person.name}`}
        value={person.divisionId}
        onChange={(e) => onMoveStaff(person.id, e.target.value)}
        className="w-full appearance-none pl-2.5 pr-6 py-1.5 rounded-lg text-xs text-slate-700 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-colors cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {allDivisions.map((d) => (
          <option key={d.id} value={d.id}>
            {formatDivisionOptionLabel(d, true)}
          </option>
        ))}
      </select>
      <ChevronDown
        className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );

  const renderLeadershipSelector = (person: StaffMember) => {
    const currentLeadership = person.leadershipRole || '';
    return (
      <div className="relative flex items-center min-w-0">
        <select
          id={`leader-${person.id}`}
          aria-label={`ระบุบทบาทในกลุ่มงานของ ${person.name}`}
          value={currentLeadership}
          onChange={(e) =>
            onUpdateLeadershipRole(person.id, e.target.value as LeadershipRole)
          }
          className={`w-full appearance-none pl-2.5 pr-6 py-1.5 rounded-lg text-xs transition-colors cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            currentLeadership === 'หัวหน้ากลุ่ม'
              ? 'bg-blue-50 hover:bg-blue-100/70 border border-blue-300 text-blue-800 font-semibold'
              : currentLeadership === 'หัวหน้าฝ่าย'
                ? 'bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-300 text-indigo-800 font-semibold'
                : 'bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-600'
          }`}
        >
          <option value="">เจ้าหน้าที่ทั่วไป</option>
          <option value="หัวหน้ากลุ่ม">หัวหน้ากลุ่ม</option>
          <option value="หัวหน้าฝ่าย">หัวหน้าฝ่าย</option>
        </select>
        <ChevronDown
          className={`w-3.5 h-3.5 absolute right-2 pointer-events-none ${
            currentLeadership === 'หัวหน้ากลุ่ม'
              ? 'text-blue-600'
              : currentLeadership === 'หัวหน้าฝ่าย'
                ? 'text-indigo-600'
                : 'text-slate-400'
          }`}
          aria-hidden="true"
        />
      </div>
    );
  };

  return (
    <div
      className={
        isSplitMode
          ? 'grid grid-cols-1 xl:grid-cols-12 gap-6 items-start'
          : 'space-y-6'
      }
    >
      {/* LEFT PANE: Unassigned Pool Section (Sticky on Desktop Split) */}
      {poolDivision && (() => {
        const poolMembers = filteredStaff.filter((s) => s.divisionId === poolDivision.id);
        const isDropTarget = activeDropDivId === poolDivision.id;
        const canAcceptDrop =
          Boolean(draggedStaffId) && draggedPerson?.divisionId !== poolDivision.id;

        const matchesPoolRole = (s: StaffMember, roleFilter: string) => {
          if (roleFilter === 'ALL') return true;
          const val = (s.role || '').trim();
          return roleFilter === '__EMPTY__' ? val === '' : val === roleFilter;
        };

        const matchesPoolType = (s: StaffMember, typeFilter: string) => {
          if (typeFilter === 'ALL') return true;
          const val = (s.staffType || '').trim();
          return typeFilter === '__EMPTY__' ? val === '' : val === typeFilter;
        };

        // Compute available ตำแหน่ง options (respecting active ประเภท filter)
        const rolePoolBase = poolMembers.filter((s) => matchesPoolType(s, poolTypeFilter));
        const roleCountsMap = new Map<string, number>();
        let emptyRoleCount = 0;
        rolePoolBase.forEach((s) => {
          const val = (s.role || '').trim();
          if (!val) {
            emptyRoleCount += 1;
          } else {
            roleCountsMap.set(val, (roleCountsMap.get(val) || 0) + 1);
          }
        });
        if (
          poolRoleFilter !== 'ALL' &&
          poolRoleFilter !== '__EMPTY__' &&
          !roleCountsMap.has(poolRoleFilter)
        ) {
          roleCountsMap.set(poolRoleFilter, 0);
        }
        const roleOptions = Array.from(roleCountsMap.entries()).sort((a, b) =>
          a[0].localeCompare(b[0], 'th')
        );

        // Compute available ประเภท options (respecting active ตำแหน่ง filter)
        const typePoolBase = poolMembers.filter((s) => matchesPoolRole(s, poolRoleFilter));
        const typeCountsMap = new Map<string, number>();
        let emptyTypeCount = 0;
        typePoolBase.forEach((s) => {
          const val = (s.staffType || '').trim();
          if (!val) {
            emptyTypeCount += 1;
          } else {
            typeCountsMap.set(val, (typeCountsMap.get(val) || 0) + 1);
          }
        });
        if (
          poolTypeFilter !== 'ALL' &&
          poolTypeFilter !== '__EMPTY__' &&
          !typeCountsMap.has(poolTypeFilter)
        ) {
          typeCountsMap.set(poolTypeFilter, 0);
        }
        const typeOptions = Array.from(typeCountsMap.entries()).sort((a, b) =>
          a[0].localeCompare(b[0], 'th')
        );

        const displayedPoolMembers = poolMembers.filter(
          (s) => matchesPoolRole(s, poolRoleFilter) && matchesPoolType(s, poolTypeFilter)
        );

        const hasPoolColumnFilter = poolRoleFilter !== 'ALL' || poolTypeFilter !== 'ALL';

        return (
          <section
            onDragOver={(e) => handleDragOver(e, poolDivision.id)}
            onDragLeave={(e) => handleDragLeave(e, poolDivision.id)}
            onDrop={(e) => handleDrop(e, poolDivision.id)}
            aria-label={poolDivision.name}
            className={`bg-white rounded-2xl overflow-hidden transition-all duration-150 flex flex-col ${
              isSplitMode ? 'xl:col-span-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6.25rem)]' : ''
            } ${
              isDropTarget
                ? 'border-2 border-dashed border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10'
                : canAcceptDrop
                  ? 'border border-dashed border-amber-300 shadow-[0_1px_2px_rgba(15,23,42,0.03)]'
                  : 'border border-slate-200/85 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-14px_rgba(15,23,42,0.08)]'
            }`}
          >
            {/* Left Panel Header */}
            <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-amber-50/80 via-amber-50/35 to-white border-b border-slate-200/75 space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-9 h-9 rounded-xl font-heading text-xs font-bold flex items-center justify-center shrink-0 ${
                      poolMembers.length > 0
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_2px_6px_rgba(217,119,6,0.28)]'
                        : 'bg-amber-100/70 text-amber-800 border border-amber-200/70'
                    }`}
                  >
                    รอ
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h2 className="font-heading font-semibold text-sm sm:text-[15px] text-slate-900 truncate">
                        รายชื่อรอจัดสรร
                      </h2>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs sm:text-sm text-amber-800 font-medium tabular-nums whitespace-nowrap">
                        {hasPoolColumnFilter
                          ? `แสดง ${displayedPoolMembers.length} / ${poolMembers.length} คน`
                          : `${poolMembers.length} คน`}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 truncate">
                      ลากรายชื่อไปวางในการ์ดกลุ่มงานทางขวา หรือเลือกสังกัดจากแถว
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddInDivision(poolDivision.id)}
                  className="inline-flex items-center gap-1 font-heading text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-amber-50/70 border border-slate-200/90 hover:border-amber-200 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>เพิ่มรายชื่อ</span>
                </button>
              </div>

              {/* Pinned Filter Bar for ตำแหน่ง & ประเภท */}
              {poolMembers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="relative min-w-0">
                    <select
                      aria-label="เลือกกรองตามตำแหน่ง"
                      value={poolRoleFilter}
                      onChange={(e) => setPoolRoleFilter(e.target.value)}
                      className={`w-full appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs transition-colors cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        poolRoleFilter !== 'ALL'
                          ? 'bg-blue-50 border border-blue-400 text-blue-800 font-semibold'
                          : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <option value="ALL">ตำแหน่ง: ทั้งหมด ({rolePoolBase.length})</option>
                      {roleOptions.map(([roleName, count]) => (
                        <option key={roleName} value={roleName}>
                          {roleName} ({count})
                        </option>
                      ))}
                      {(emptyRoleCount > 0 || poolRoleFilter === '__EMPTY__') && (
                        <option value="__EMPTY__">ไม่ระบุตำแหน่ง ({emptyRoleCount})</option>
                      )}
                    </select>
                    <ChevronDown
                      className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <select
                        aria-label="เลือกกรองตามประเภท"
                        value={poolTypeFilter}
                        onChange={(e) => setPoolTypeFilter(e.target.value)}
                        className={`w-full appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs transition-colors cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          poolTypeFilter !== 'ALL'
                            ? 'bg-blue-50 border border-blue-400 text-blue-800 font-semibold'
                            : 'bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <option value="ALL">ประเภท: ทั้งหมด ({typePoolBase.length})</option>
                        {typeOptions.map(([typeName, count]) => (
                          <option key={typeName} value={typeName}>
                            {typeName} ({count})
                          </option>
                        ))}
                        {(emptyTypeCount > 0 || poolTypeFilter === '__EMPTY__') && (
                          <option value="__EMPTY__">ไม่ระบุประเภท ({emptyTypeCount})</option>
                        )}
                      </select>
                      <ChevronDown
                        className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>

                    {hasPoolColumnFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          setPoolRoleFilter('ALL');
                          setPoolTypeFilter('ALL');
                        }}
                        title="ล้างตัวกรองตำแหน่งและประเภท"
                        aria-label="ล้างตัวกรองตำแหน่งและประเภท"
                        className="p-1.5 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 transition-colors shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Left Panel Body */}
            {poolMembers.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-400 leading-relaxed">
                {isDropTarget
                  ? 'ปล่อยเมาส์เพื่อย้ายกลับมาพักในรายชื่อรอจัดสรร'
                  : 'ไม่มีรายชื่อรอจัดสรร · ลากรายชื่อจากกลุ่มงานทางขวามาวางที่นี่หากต้องการพักสังกัด'}
              </div>
            ) : isSplitMode ? (
              /* Compact Zero-Overflow Table for Left Sticky Panel */
              <div className="flex-1 overflow-y-auto overflow-x-auto max-h-[380px] xl:max-h-none subtle-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 text-slate-600 font-heading text-xs">
                    <tr>
                      <th scope="col" className="px-3 py-2.5 w-12 text-right tabular-nums whitespace-nowrap">
                        ลำดับ
                      </th>
                      <th scope="col" className="px-3 py-2.5 whitespace-nowrap">
                        รายชื่อ · ตำแหน่ง · ประเภท
                      </th>
                      <th scope="col" className="px-3 py-2.5 w-44 min-w-[155px] whitespace-nowrap">
                        จัดสรรเข้ากลุ่มงาน
                      </th>
                      <th scope="col" className="px-2.5 py-2.5 w-16 text-center whitespace-nowrap">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedPoolMembers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">
                          <span>ไม่พบรายชื่อที่ตรงกับตำแหน่งหรือประเภทที่เลือก</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPoolRoleFilter('ALL');
                              setPoolTypeFilter('ALL');
                            }}
                            className="ml-2 font-heading font-medium text-blue-600 hover:underline"
                          >
                            แสดงทั้งหมด ({poolMembers.length} คน)
                          </button>
                        </td>
                      </tr>
                    ) : (
                      displayedPoolMembers.map((person, idx) => {
                        const isDragging = draggedStaffId === person.id;
                        return (
                          <tr
                            key={person.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, person.id)}
                            onDragEnd={handleDragEnd}
                            className={`group hover:bg-amber-50/35 cursor-grab active:cursor-grabbing transition-colors ${
                              isDragging ? 'opacity-35' : 'opacity-100'
                            }`}
                          >
                            <td className="px-3 py-2.5 text-right text-slate-400 tabular-nums whitespace-nowrap align-top">
                              <div className="inline-flex items-center justify-end gap-1 mt-1">
                                <GripVertical
                                  className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 shrink-0 transition-colors"
                                  aria-hidden="true"
                                />
                                <span className="text-xs">{idx + 1}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 align-top">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="w-7 h-7 mt-0.5 rounded-full bg-amber-100/80 text-amber-900 font-heading text-xs font-semibold flex items-center justify-center shrink-0">
                                  {getThaiInitial(person.name)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-slate-900 leading-snug">
                                    {person.name}
                                  </div>
                                  <div className="mt-0.5 text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                    <span>{person.role || 'ไม่ระบุตำแหน่ง'}</span>
                                    {person.staffType && (
                                      <>
                                        <span className="text-slate-300" aria-hidden="true">
                                          ·
                                        </span>
                                        <span className="text-slate-600 font-medium">
                                          {person.staffType}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 align-middle">{renderMoveSelector(person)}</td>
                            <td className="px-2.5 py-2.5 text-center whitespace-nowrap align-middle">
                              <div className="inline-flex items-center justify-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => onEditStaff(person)}
                                  title="แก้ไขข้อมูล"
                                  aria-label={`แก้ไขข้อมูล ${person.name}`}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteStaff(person)}
                                  title="ลบรายชื่อ"
                                  aria-label={`ลบรายชื่อ ${person.name}`}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Full-Width 6-Column Table when only Unassigned Pool is selected */
              <div className="overflow-x-auto subtle-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 text-slate-600 font-heading text-xs">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 w-14 text-right tabular-nums whitespace-nowrap">
                        ลำดับ
                      </th>
                      <th scope="col" className="px-4 py-2.5 whitespace-nowrap">
                        ชื่อ-สกุล
                      </th>
                      <th scope="col" className="px-4 py-2.5 whitespace-nowrap">
                        ตำแหน่ง
                      </th>
                      <th scope="col" className="px-4 py-2.5 whitespace-nowrap">
                        ประเภท
                      </th>
                      <th scope="col" className="px-4 py-2.5 w-72 min-w-[220px] whitespace-nowrap">
                        เลือกจัดสรรกลุ่มงาน
                      </th>
                      <th scope="col" className="px-4 py-2.5 w-24 text-center whitespace-nowrap">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedPoolMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                          <span>ไม่พบรายชื่อรอจัดสรรที่ตรงกับตำแหน่งหรือประเภทที่เลือก</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPoolRoleFilter('ALL');
                              setPoolTypeFilter('ALL');
                            }}
                            className="ml-2 font-heading font-medium text-blue-600 hover:underline"
                          >
                            แสดงทั้งหมด ({poolMembers.length} คน)
                          </button>
                        </td>
                      </tr>
                    ) : (
                      displayedPoolMembers.map((person, idx) => (
                        <tr
                          key={person.id}
                          className="group hover:bg-amber-50/25 transition-colors"
                        >
                          <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums whitespace-nowrap">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-amber-100/80 text-amber-900 font-heading text-xs font-semibold flex items-center justify-center shrink-0">
                                {getThaiInitial(person.name)}
                              </div>
                              <span className="font-medium text-slate-900">{person.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{person.role || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                            {person.staffType || '-'}
                          </td>
                          <td className="px-4 py-2">{renderMoveSelector(person)}</td>
                          <td className="px-4 py-2.5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => onEditStaff(person)}
                                title="แก้ไขข้อมูล"
                                aria-label={`แก้ไขข้อมูล ${person.name}`}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteStaff(person)}
                                title="ลบรายชื่อ"
                                aria-label={`ลบรายชื่อ ${person.name}`}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {isDropTarget && poolMembers.length > 0 && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-200/80 text-center text-xs font-heading font-medium text-amber-800 shrink-0">
                ปล่อยเมาส์เพื่อย้ายกลับมาพักในรายชื่อรอจัดสรร
              </div>
            )}
          </section>
        );
      })()}

      {/* RIGHT PANE: Active Divisions Section */}
      {!onlyPoolSelected && (
        <div className={`space-y-4 min-w-0 ${isSplitMode ? 'xl:col-span-7' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                กลุ่มงานในสังกัด
              </h2>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="text-xs sm:text-sm text-slate-500 tabular-nums">
                มีผู้สังกัดแล้ว{' '}
                <strong className="font-semibold text-slate-800">{populatedDivCount}</strong> จาก{' '}
                {regularDivisions.length} กลุ่มงาน
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onAddDivision}
                className="inline-flex items-center gap-1.5 font-heading px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200/90 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มกลุ่มงาน</span>
              </button>

              {regularDivisions.length > 1 && emptyDivCount > 0 && (
                <button
                  type="button"
                  onClick={() => setHideEmptyDivisions((prev) => !prev)}
                  className={`font-heading px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    hideEmptyDivisions
                      ? 'bg-blue-700 border-blue-700 text-white'
                      : 'bg-white border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {hideEmptyDivisions ? `แสดงกลุ่มงานว่าง (${emptyDivCount})` : 'ซ่อนกลุ่มงานว่าง'}
                </button>
              )}

              {regularDivisions.length > 1 && (
                <div
                  role="group"
                  aria-label="รูปแบบการแสดงผลกลุ่มงาน"
                  className="inline-flex rounded-xl bg-slate-200/70 p-1 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setDivisionLayout('grid2')}
                    className={`inline-flex items-center gap-1.5 font-heading px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      divisionLayout === 'grid2'
                        ? 'bg-white text-blue-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>การ์ด 2 คอลัมน์</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDivisionLayout('stack')}
                    className={`inline-flex items-center gap-1.5 font-heading px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      divisionLayout === 'stack'
                        ? 'bg-white text-blue-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Rows3 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>ตารางเต็มแถว</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {regularDivisions.length === 0 ? (
            <div className="bg-white border border-slate-200/85 rounded-2xl px-6 py-10 text-center">
              <p className="text-sm text-slate-500">ยังไม่มีกลุ่มงานในสังกัดในระบบ</p>
              <button
                type="button"
                onClick={onAddDivision}
                className="mt-3 inline-flex items-center gap-1.5 font-heading px-4 py-2 rounded-xl text-xs font-medium bg-blue-700 hover:bg-blue-800 text-white transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มกลุ่มงานแรก</span>
              </button>
            </div>
          ) : displayedRegularDivisions.length === 0 ? (
            <div className="bg-white border border-slate-200/85 rounded-2xl px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                ยังไม่มีกลุ่มงานที่มีเจ้าหน้าที่สังกัดตามเงื่อนไขปัจจุบัน
              </p>
              <button
                type="button"
                onClick={() => setHideEmptyDivisions(false)}
                className="mt-3 font-heading px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                แสดงครบทั้ง {regularDivisions.length} กลุ่มงาน
              </button>
            </div>
          ) : (
            <div
              className={
                divisionLayout === 'grid2' && displayedRegularDivisions.length > 1
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch'
                  : 'space-y-3.5'
              }
            >
              {displayedRegularDivisions.map((div) => {
                const rawMembers = filteredStaff.filter((s) => s.divisionId === div.id);
                const members = [...rawMembers].sort(
                  (a, b) =>
                    getLeadershipRank(a.leadershipRole) - getLeadershipRank(b.leadershipRole)
                );
                const hasMembers = members.length > 0;
                const isDropTarget = activeDropDivId === div.id;
                const canAcceptDrop =
                  Boolean(draggedStaffId) && draggedPerson?.divisionId !== div.id;
                const paddedNum = div.num.padStart(2, '0');
                const isCollapsed = Boolean(collapsedDivIds[div.id]) && !isDropTarget;

                const groupHeads = members.filter((m) => m.leadershipRole === 'หัวหน้ากลุ่ม');
                const sectionHeads = members.filter((m) => m.leadershipRole === 'หัวหน้าฝ่าย');
                const offsiteCount = members.filter((m) =>
                  Boolean((m.workLocation || '').trim())
                ).length;

                const typeCounts: Record<string, number> = {};
                members.forEach((m) => {
                  const key = (m.staffType || '').trim();
                  if (key) {
                    typeCounts[key] = (typeCounts[key] || 0) + 1;
                  }
                });
                const typeSummaryParts = Object.entries(typeCounts).map(
                  ([typeName, count]) => `${typeName} ${count}`
                );

                const isCompactCard =
                  divisionLayout === 'grid2' && displayedRegularDivisions.length > 1;

                return (
                  <section
                    key={div.id}
                    onDragOver={(e) => handleDragOver(e, div.id)}
                    onDragLeave={(e) => handleDragLeave(e, div.id)}
                    onDrop={(e) => handleDrop(e, div.id)}
                    aria-label={`${div.num}. ${div.name}`}
                    className={`bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-150 ${
                      isDropTarget
                        ? 'border-2 border-dashed border-blue-600 bg-blue-50/35 ring-4 ring-blue-500/10'
                        : canAcceptDrop
                          ? 'border border-dashed border-blue-300 shadow-[0_1px_2px_rgba(15,23,42,0.03)]'
                          : hasMembers
                            ? 'border border-slate-200/85 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_22px_-14px_rgba(15,23,42,0.08)] hover:border-blue-200/90'
                            : 'border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.02)] hover:border-slate-300/90'
                    }`}
                  >
                    {/* Division Header */}
                    <div
                      className={`px-4 py-4 flex items-start justify-between gap-2.5 ${
                        hasMembers
                          ? 'bg-gradient-to-r from-blue-50/95 via-slate-50/80 to-white border-b border-blue-200/70'
                          : isCompactCard
                            ? 'bg-slate-100/75 border-b border-slate-200/80'
                            : 'bg-slate-50/90 border-b border-slate-200/75'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span
                          className={`w-9 h-9 rounded-xl font-heading text-sm font-bold tabular-nums flex items-center justify-center shrink-0 mt-0.5 ${
                            hasMembers
                              ? 'bg-gradient-to-br from-blue-700 to-blue-800 text-white shadow-[0_2px_6px_rgba(29,78,216,0.28)]'
                              : 'bg-blue-100/90 text-blue-900 border border-blue-200/80'
                          }`}
                        >
                          {paddedNum}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-heading font-bold text-[15px] sm:text-base tracking-[-0.01em] leading-snug ${
                              hasMembers ? 'text-slate-950' : 'text-slate-900'
                            }`}
                          >
                            {div.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs tabular-nums">
                            {hasMembers ? (
                              <>
                                <span className="text-blue-700 font-medium">
                                  อัตรากำลัง {members.length} คน
                                </span>
                                {offsiteCount > 0 && (
                                  <>
                                    <span className="text-slate-300" aria-hidden="true">
                                      ·
                                    </span>
                                    <span className="text-amber-700 font-medium">
                                      ปฏิบัติงานที่อื่น {offsiteCount}
                                    </span>
                                  </>
                                )}
                                {groupHeads.length > 0 && (
                                  <>
                                    <span className="text-slate-300" aria-hidden="true">
                                      ·
                                    </span>
                                    <span className="text-blue-800 font-medium">
                                      หัวหน้ากลุ่ม: {groupHeads.map((h) => h.name).join(', ')}
                                    </span>
                                  </>
                                )}
                                {sectionHeads.length > 0 && (
                                  <>
                                    <span className="text-slate-300" aria-hidden="true">
                                      ·
                                    </span>
                                    <span className="text-indigo-800 font-medium">
                                      หัวหน้าฝ่าย: {sectionHeads.map((h) => h.name).join(', ')}
                                    </span>
                                  </>
                                )}
                                {typeSummaryParts.map((part) => (
                                  <React.Fragment key={part}>
                                    <span className="text-slate-300" aria-hidden="true">
                                      ·
                                    </span>
                                    <span className="text-slate-500">{part}</span>
                                  </React.Fragment>
                                ))}
                              </>
                            ) : (
                              <span
                                className={
                                  isDropTarget ? 'text-blue-700 font-medium' : 'text-slate-400'
                                }
                              >
                                {isDropTarget
                                  ? 'ปล่อยเมาส์เพื่อจัดสรรเข้ากลุ่มงานนี้'
                                  : 'ยังไม่มีผู้สังกัด · ลากรายชื่อมาวางที่นี่'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditDivision(div)}
                          title={`แก้ไขชื่อ ${div.name}`}
                          aria-label={`แก้ไขชื่อ ${div.name}`}
                          className={`inline-flex items-center gap-1 font-heading text-xs font-medium rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isCompactCard ? 'p-1.5' : 'px-2.5 py-1.5'
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          {!isCompactCard && <span className="hidden sm:inline">แก้ไขชื่อ</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddInDivision(div.id)}
                          title={`เพิ่มเจ้าหน้าที่ใน ${div.name}`}
                          aria-label={`เพิ่มเจ้าหน้าที่ใน ${div.name}`}
                          className={`inline-flex items-center gap-1 font-heading text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isCompactCard ? 'px-2 py-1.5' : 'px-3 py-1.5'
                          } ${
                            hasMembers
                              ? 'bg-white border-slate-200/90 text-blue-700 hover:bg-blue-50 hover:border-blue-200'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-white hover:text-blue-700 hover:border-blue-200'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isCompactCard ? 'เพิ่ม' : 'เพิ่มรายชื่อ'}</span>
                        </button>
                        {hasMembers && (
                          <button
                            type="button"
                            onClick={() => toggleCollapseDivision(div.id)}
                            aria-expanded={!isCollapsed}
                            aria-label={isCollapsed ? 'ขยายรายชื่อ' : 'ย่อรายชื่อ'}
                            title={isCollapsed ? 'ขยายรายชื่อ' : 'ย่อรายชื่อ'}
                            className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            {isCollapsed ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Division Body */}
                    {!hasMembers ? (
                      isCompactCard ? (
                        <div
                          className={`flex-1 min-h-[76px] px-4 py-4 flex items-center justify-center text-center text-xs transition-colors ${
                            isDropTarget
                              ? 'bg-blue-50/55 text-blue-700 font-medium'
                              : 'bg-slate-50/20 text-slate-400'
                          }`}
                        >
                          {isDropTarget
                            ? `ปล่อยเมาส์เพื่อจัดสรรเข้ากลุ่มงานที่ ${div.num}`
                            : 'พื้นที่ว่างสำหรับลากวางรายชื่อ'}
                        </div>
                      ) : null
                    ) : isCollapsed ? (
                      <div className="px-4 py-2.5 bg-white text-xs text-slate-500 flex items-center justify-between">
                        <span>ซ่อนรายชื่อไว้ชั่วคราว ({members.length} คน)</span>
                        <button
                          type="button"
                          onClick={() => toggleCollapseDivision(div.id)}
                          className="font-heading font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0"
                        >
                          แสดงรายชื่อ
                        </button>
                      </div>
                    ) : !isCompactCard ? (
                      /* Full-Width Spacious Table (1-column stack mode) */
                      <div className="overflow-x-auto subtle-scrollbar bg-white">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-heading text-xs">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-2.5 w-14 text-right tabular-nums whitespace-nowrap"
                              >
                                ลำดับ
                              </th>
                              <th scope="col" className="px-4 py-2.5 whitespace-nowrap">
                                ชื่อ-สกุล
                              </th>
                              <th scope="col" className="px-4 py-2.5 whitespace-nowrap">
                                ตำแหน่ง
                              </th>
                              <th scope="col" className="px-4 py-2.5 whitespace-nowrap">
                                ประเภท
                              </th>
                              <th scope="col" className="px-4 py-2.5 w-40 min-w-[145px] whitespace-nowrap">
                                บทบาทในกลุ่มงาน
                              </th>
                              <th scope="col" className="px-4 py-2.5 w-56 min-w-[180px] whitespace-nowrap">
                                ย้ายสังกัดกลุ่มงาน
                              </th>
                              <th scope="col" className="px-4 py-2.5 w-28 text-center whitespace-nowrap">
                                จัดการ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {members.map((person, idx) => {
                              const isDragging = draggedStaffId === person.id;
                              const leaderRole = person.leadershipRole || '';
                              const offsiteLocation = (person.workLocation || '').trim();
                              return (
                                <tr
                                  key={person.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, person.id)}
                                  onDragEnd={handleDragEnd}
                                  className={`group hover:bg-blue-50/25 cursor-grab active:cursor-grabbing transition-colors ${
                                    isDragging ? 'opacity-35' : 'opacity-100'
                                  } ${
                                    leaderRole === 'หัวหน้ากลุ่ม'
                                      ? 'bg-blue-50/20'
                                      : leaderRole === 'หัวหน้าฝ่าย'
                                        ? 'bg-indigo-50/20'
                                        : ''
                                  }`}
                                >
                                  <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums whitespace-nowrap">
                                    <div className="inline-flex items-center justify-end gap-1.5">
                                      <GripVertical
                                        className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors"
                                        aria-hidden="true"
                                      />
                                      <span>{idx + 1}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      <div
                                        className={`w-7 h-7 mt-0.5 rounded-full font-heading text-xs font-semibold flex items-center justify-center shrink-0 ${
                                          leaderRole === 'หัวหน้ากลุ่ม'
                                            ? 'bg-blue-600 text-white'
                                            : leaderRole === 'หัวหน้าฝ่าย'
                                              ? 'bg-indigo-600 text-white'
                                              : 'bg-blue-50 text-blue-700'
                                        }`}
                                      >
                                        {getThaiInitial(person.name)}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
                                          <span className="font-medium text-slate-900">
                                            {person.name}
                                          </span>
                                          {leaderRole && (
                                            <>
                                              <span className="text-slate-300" aria-hidden="true">
                                                ·
                                              </span>
                                              <span
                                                className={`text-xs font-heading font-semibold whitespace-nowrap ${
                                                  leaderRole === 'หัวหน้าฝ่าย'
                                                    ? 'text-indigo-700'
                                                    : 'text-blue-700'
                                                }`}
                                              >
                                                {leaderRole}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        {offsiteLocation && (
                                          <button
                                            type="button"
                                            onClick={() => onEditWorkLocation(person)}
                                            title="คลิกเพื่อแก้ไขหรือยกเลิกสถานที่ปฏิบัติงานจริง"
                                            className="mt-0.5 inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 hover:underline text-left"
                                          >
                                            <MapPin className="w-3 h-3 shrink-0 text-amber-600" aria-hidden="true" />
                                            <span>ปฏิบัติงานที่: {offsiteLocation}</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600">
                                    {person.role || '-'}
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                                    {person.staffType || '-'}
                                  </td>
                                  <td className="px-4 py-2">{renderLeadershipSelector(person)}</td>
                                  <td className="px-4 py-2">{renderMoveSelector(person)}</td>
                                  <td className="px-4 py-2.5 text-center whitespace-nowrap">
                                    <div className="inline-flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => onEditWorkLocation(person)}
                                        title={
                                          offsiteLocation
                                            ? `ปฏิบัติงานที่: ${offsiteLocation} (คลิกเพื่อแก้ไข)`
                                            : 'ระบุกรณีปฏิบัติงานที่อื่น'
                                        }
                                        aria-label={`ระบุสถานที่ปฏิบัติงานจริงของ ${person.name}`}
                                        className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                                          offsiteLocation
                                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                            : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                        }`}
                                      >
                                        <MapPin className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onEditStaff(person)}
                                        title="แก้ไขข้อมูล"
                                        aria-label={`แก้ไขข้อมูล ${person.name}`}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDeleteStaff(person)}
                                        title="ลบรายชื่อ"
                                        aria-label={`ลบรายชื่อ ${person.name}`}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {isDropTarget && (
                          <div className="px-4 py-2 bg-blue-50/70 border-t border-blue-100 text-center text-xs font-heading font-medium text-blue-700">
                            ปล่อยเมาส์เพื่อย้ายเข้ากลุ่มงานที่ {div.num}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Symmetrical 2-Column Division Cards (2-Tier Clean Member Rows — Zero Overflow) */
                      <div className="divide-y divide-slate-100 flex-1 bg-white">
                        {members.map((person, idx) => {
                          const isDragging = draggedStaffId === person.id;
                          const leaderRole = person.leadershipRole || '';
                          const offsiteLocation = (person.workLocation || '').trim();
                          return (
                            <div
                              key={person.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, person.id)}
                              onDragEnd={handleDragEnd}
                              className={`group px-4 py-3 hover:bg-blue-50/25 cursor-grab active:cursor-grabbing transition-colors space-y-2 ${
                                isDragging ? 'opacity-35' : 'opacity-100'
                              } ${
                                leaderRole === 'หัวหน้ากลุ่ม'
                                  ? 'bg-blue-50/20'
                                  : leaderRole === 'หัวหน้าฝ่าย'
                                    ? 'bg-indigo-50/20'
                                    : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 min-w-0 flex-1">
                                  <GripVertical
                                    className="w-3.5 h-3.5 mt-1 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors"
                                    aria-hidden="true"
                                  />
                                  <span className="text-xs mt-0.5 text-slate-400 tabular-nums w-4 text-right shrink-0">
                                    {idx + 1}.
                                  </span>
                                  <div
                                    className={`w-6 h-6 mt-0.5 rounded-full font-heading text-[11px] font-semibold flex items-center justify-center shrink-0 ${
                                      leaderRole === 'หัวหน้ากลุ่ม'
                                        ? 'bg-blue-600 text-white'
                                        : leaderRole === 'หัวหน้าฝ่าย'
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-blue-50 text-blue-700'
                                    }`}
                                  >
                                    {getThaiInitial(person.name)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                                      <span className="font-medium text-sm text-slate-900">
                                        {person.name}
                                      </span>
                                      {leaderRole && (
                                        <>
                                          <span className="text-slate-300" aria-hidden="true">
                                            ·
                                          </span>
                                          <span
                                            className={`text-xs font-heading font-semibold whitespace-nowrap shrink-0 ${
                                              leaderRole === 'หัวหน้าฝ่าย'
                                                ? 'text-indigo-700'
                                                : 'text-blue-700'
                                            }`}
                                          >
                                            {leaderRole}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                      <span>{person.role || 'ไม่ระบุตำแหน่ง'}</span>
                                      {person.staffType && (
                                        <>
                                          <span className="text-slate-300" aria-hidden="true">
                                            ·
                                          </span>
                                          <span className="text-slate-600 shrink-0">
                                            {person.staffType}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {offsiteLocation && (
                                      <button
                                        type="button"
                                        onClick={() => onEditWorkLocation(person)}
                                        title="คลิกเพื่อแก้ไขหรือยกเลิกสถานที่ปฏิบัติงานจริง"
                                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 hover:underline text-left max-w-full"
                                      >
                                        <MapPin
                                          className="w-3 h-3 shrink-0 text-amber-600"
                                          aria-hidden="true"
                                        />
                                        <span className="truncate">
                                          ปฏิบัติงานที่: {offsiteLocation}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => onEditWorkLocation(person)}
                                    title={
                                      offsiteLocation
                                        ? `ปฏิบัติงานที่: ${offsiteLocation} (คลิกเพื่อแก้ไข)`
                                        : 'ระบุกรณีปฏิบัติงานที่อื่น'
                                    }
                                    aria-label={`ระบุสถานที่ปฏิบัติงานจริงของ ${person.name}`}
                                    className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                                      offsiteLocation
                                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                                        : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                    }`}
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onEditStaff(person)}
                                    title="แก้ไขข้อมูล"
                                    aria-label={`แก้ไขข้อมูล ${person.name}`}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteStaff(person)}
                                    title="ลบรายชื่อ"
                                    aria-label={`ลบรายชื่อ ${person.name}`}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="pl-11 grid grid-cols-2 gap-1.5">
                                {renderLeadershipSelector(person)}
                                {renderMoveSelector(person)}
                              </div>
                            </div>
                          );
                        })}

                        {isDropTarget && (
                          <div className="px-4 py-2 bg-blue-50/70 text-center text-xs font-heading font-medium text-blue-700">
                            ปล่อยเมาส์เพื่อย้ายเข้ากลุ่มงานที่ {div.num}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
