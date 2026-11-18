import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  LayoutGrid,
  Pencil,
  Plus,
  Rows3,
  Trash2,
} from 'lucide-react';
import {
  DIVISIONS,
  formatDivisionOptionLabel,
  getThaiInitial,
} from '../constants/divisions';
import { Division, StaffMember } from '../types';

interface BoardViewProps {
  divisions: Division[];
  filteredStaff: StaffMember[];
  totalStaffCount: number;
  onMoveStaff: (staffId: string, targetDivisionId: string) => void;
  onEditStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staff: StaffMember) => void;
  onAddInDivision: (divisionId: string) => void;
}

export function BoardView({
  divisions,
  filteredStaff,
  onMoveStaff,
  onEditStaff,
  onDeleteStaff,
  onAddInDivision,
}: BoardViewProps) {
  const [draggedStaffId, setDraggedStaffId] = useState<string | null>(null);
  const [activeDropDivId, setActiveDropDivId] = useState<string | null>(null);
  const [divisionLayout, setDivisionLayout] = useState<'grid2' | 'stack'>('stack');
  const [hideEmptyDivisions, setHideEmptyDivisions] = useState(false);
  const [collapsedDivIds, setCollapsedDivIds] = useState<Record<string, boolean>>({});

  const poolDivision = divisions.find((d) => d.isPool);
  const regularDivisions = divisions.filter((d) => !d.isPool);

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
        {DIVISIONS.map((d) => (
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

  return (
    <div className="space-y-8">
      {/* 1. Unassigned Pool Section */}
      {poolDivision && (() => {
        const poolMembers = filteredStaff.filter((s) => s.divisionId === poolDivision.id);
        const isDropTarget = activeDropDivId === poolDivision.id;
        const canAcceptDrop =
          Boolean(draggedStaffId) && draggedPerson?.divisionId !== poolDivision.id;

        return (
          <section
            onDragOver={(e) => handleDragOver(e, poolDivision.id)}
            onDragLeave={(e) => handleDragLeave(e, poolDivision.id)}
            onDrop={(e) => handleDrop(e, poolDivision.id)}
            aria-label={poolDivision.name}
            className={`bg-white rounded-2xl overflow-hidden transition-colors duration-150 ${
              isDropTarget
                ? 'border-2 border-dashed border-amber-500 bg-amber-50/40'
                : canAcceptDrop
                  ? 'border border-dashed border-amber-300'
                  : 'border border-slate-200/85'
            }`}
          >
            <div className="px-5 py-3.5 bg-amber-50/40 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <h2 className="font-heading font-semibold text-sm sm:text-base text-slate-900 truncate">
                  รายชื่อรอจัดสรร
                </h2>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs sm:text-sm text-amber-800 font-medium tabular-nums whitespace-nowrap">
                  {poolMembers.length} คน
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAddInDivision(poolDivision.id)}
                className="inline-flex items-center gap-1 font-heading text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>เพิ่มรายชื่อ</span>
              </button>
            </div>

            {poolMembers.length === 0 ? (
              <div className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                  {isDropTarget
                    ? 'ปล่อยเมาส์เพื่อย้ายกลับมาพักในรายชื่อรอจัดสรร'
                    : 'ไม่มีรายชื่อรอจัดสรร · ลากรายชื่อจากกลุ่มงานมาวางที่นี่หากต้องการพักสังกัด'}
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-heading text-xs">
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
                    {poolMembers.map((person, idx) => {
                      const isDragging = draggedStaffId === person.id;
                      return (
                        <tr
                          key={person.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, person.id)}
                          onDragEnd={handleDragEnd}
                          className={`group hover:bg-amber-50/25 cursor-grab active:cursor-grabbing transition-colors ${
                            isDragging ? 'opacity-35' : 'opacity-100'
                          }`}
                        >
                          <td className="px-4 py-2.5 text-right text-slate-400 tabular-nums whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <GripVertical
                                className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 shrink-0 transition-colors"
                                aria-hidden="true"
                              />
                              <span>{idx + 1}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-amber-100/70 text-amber-900 font-heading text-xs font-semibold flex items-center justify-center shrink-0">
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })()}

      {/* 2. Active Divisions Section (8 Divisions) */}
      {regularDivisions.length > 0 && (
        <div className="space-y-4">
          {regularDivisions.length > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
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

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {emptyDivCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setHideEmptyDivisions((prev) => !prev)}
                    className={`font-heading px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                      hideEmptyDivisions
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {hideEmptyDivisions ? `แสดงกลุ่มงานว่าง (${emptyDivCount})` : 'ซ่อนกลุ่มงานว่าง'}
                  </button>
                )}

                <div
                  role="group"
                  aria-label="รูปแบบการแสดงผลกลุ่มงาน"
                  className="inline-flex rounded-xl bg-slate-200/70 p-1 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setDivisionLayout('stack')}
                    className={`inline-flex items-center gap-1.5 font-heading px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      divisionLayout === 'stack'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Rows3 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>แถวตาราง</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDivisionLayout('grid2')}
                    className={`inline-flex items-center gap-1.5 font-heading px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      divisionLayout === 'grid2'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>2 คอลัมน์</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {displayedRegularDivisions.length === 0 ? (
            <div className="bg-white border border-slate-200/85 rounded-2xl px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                ยังไม่มีกลุ่มงานที่มีเจ้าหน้าที่สังกัดตามเงื่อนไขปัจจุบัน
              </p>
              <button
                type="button"
                onClick={() => setHideEmptyDivisions(false)}
                className="mt-3 font-heading px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                แสดงครบทั้ง {regularDivisions.length} กลุ่มงาน
              </button>
            </div>
          ) : (
            <div
              className={
                divisionLayout === 'grid2' && displayedRegularDivisions.length > 1
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch'
                  : 'space-y-3'
              }
            >
              {displayedRegularDivisions.map((div) => {
                const members = filteredStaff.filter((s) => s.divisionId === div.id);
                const hasMembers = members.length > 0;
                const isDropTarget = activeDropDivId === div.id;
                const canAcceptDrop =
                  Boolean(draggedStaffId) && draggedPerson?.divisionId !== div.id;
                const paddedNum = div.num.padStart(2, '0');
                const isCollapsed = Boolean(collapsedDivIds[div.id]) && !isDropTarget;

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

                return (
                  <section
                    key={div.id}
                    onDragOver={(e) => handleDragOver(e, div.id)}
                    onDragLeave={(e) => handleDragLeave(e, div.id)}
                    onDrop={(e) => handleDrop(e, div.id)}
                    aria-label={`${div.num}. ${div.name}`}
                    className={`bg-white rounded-2xl flex flex-col overflow-hidden transition-colors duration-150 ${
                      isDropTarget
                        ? 'border-2 border-dashed border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/10'
                        : canAcceptDrop
                          ? 'border border-dashed border-blue-300'
                          : hasMembers
                            ? 'border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300/90'
                            : 'border border-slate-200/75 hover:border-slate-300/80'
                    }`}
                  >
                    {/* Division Header */}
                    <div
                      className={`px-5 py-3.5 flex items-center justify-between gap-3 ${
                        hasMembers
                          ? 'bg-gradient-to-r from-blue-50/45 via-slate-50/40 to-white border-b border-slate-200/75'
                          : divisionLayout === 'grid2'
                            ? 'bg-slate-50/40 border-b border-slate-100'
                            : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span
                          className={`w-9 h-9 rounded-xl font-heading text-xs font-bold tabular-nums flex items-center justify-center shrink-0 ${
                            hasMembers
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-500 border border-slate-200/70'
                          }`}
                        >
                          {paddedNum}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-heading font-semibold text-sm sm:text-[15px] leading-snug ${
                              hasMembers ? 'text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {div.name}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs tabular-nums">
                            {hasMembers ? (
                              <>
                                <span className="text-blue-700 font-medium">
                                  อัตรากำลัง {members.length} คน
                                </span>
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
                                  isDropTarget ? 'text-blue-600 font-medium' : 'text-slate-400'
                                }
                              >
                                {isDropTarget
                                  ? 'ปล่อยเมาส์เพื่อจัดสรรเข้ากลุ่มงานนี้'
                                  : 'ยังไม่มีผู้สังกัด · ลากรายชื่อมาวางที่นี่เพื่อจัดสรร'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onAddInDivision(div.id)}
                          title={`เพิ่มเจ้าหน้าที่ใน ${div.name}`}
                          className={`inline-flex items-center gap-1 font-heading text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            hasMembers
                              ? 'bg-white border-slate-200/90 text-blue-600 hover:bg-blue-50 hover:border-blue-200'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-200'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เพิ่มรายชื่อ</span>
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
                      divisionLayout === 'grid2' ? (
                        <div
                          className={`flex-1 min-h-[96px] px-5 py-4 flex items-center justify-center text-center text-xs transition-colors ${
                            isDropTarget
                              ? 'bg-blue-50/50 text-blue-700 font-medium'
                              : 'bg-slate-50/20 text-slate-400'
                          }`}
                        >
                          {isDropTarget
                            ? `ปล่อยเมาส์เพื่อจัดสรรเข้ากลุ่มงานที่ ${div.num}`
                            : 'พื้นที่ว่างสำหรับจัดสรรรายชื่อ'}
                        </div>
                      ) : null
                    ) : isCollapsed ? (
                      <div className="px-5 py-2.5 bg-white text-xs text-slate-500 flex items-center justify-between">
                        <span>ซ่อนรายชื่อไว้ชั่วคราว ({members.length} คน)</span>
                        <button
                          type="button"
                          onClick={() => toggleCollapseDivision(div.id)}
                          className="font-heading font-medium text-blue-600 hover:underline"
                        >
                          แสดงรายชื่อ
                        </button>
                      </div>
                    ) : divisionLayout === 'stack' ? (
                      /* Full-Width Spacious Table (Aligns with Unassigned Pool Table) */
                      <div className="overflow-x-auto bg-white">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-heading text-xs">
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
                              <th scope="col" className="px-4 py-2.5 w-72 min-w-[220px] whitespace-nowrap">
                                ย้ายสังกัดกลุ่มงาน
                              </th>
                              <th scope="col" className="px-4 py-2.5 w-24 text-center whitespace-nowrap">
                                จัดการ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {members.map((person, idx) => {
                              const isDragging = draggedStaffId === person.id;
                              return (
                                <tr
                                  key={person.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, person.id)}
                                  onDragEnd={handleDragEnd}
                                  className={`group hover:bg-blue-50/25 cursor-grab active:cursor-grabbing transition-colors ${
                                    isDragging ? 'opacity-35' : 'opacity-100'
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
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-heading text-xs font-semibold flex items-center justify-center shrink-0">
                                        {getThaiInitial(person.name)}
                                      </div>
                                      <span className="font-medium text-slate-900">
                                        {person.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600">
                                    {person.role || '-'}
                                  </td>
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
                      /* Symmetrical 2-Column Structured Roster Rows (No cramped 6-col squeezing) */
                      <div className="divide-y divide-slate-100 flex-1 bg-white">
                        {members.map((person, idx) => {
                          const isDragging = draggedStaffId === person.id;
                          return (
                            <div
                              key={person.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, person.id)}
                              onDragEnd={handleDragEnd}
                              className={`group px-5 py-3 hover:bg-blue-50/25 cursor-grab active:cursor-grabbing transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                                isDragging ? 'opacity-35' : 'opacity-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <GripVertical
                                  className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors"
                                  aria-hidden="true"
                                />
                                <span className="text-xs text-slate-400 tabular-nums w-4 text-right shrink-0">
                                  {idx + 1}.
                                </span>
                                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-heading text-xs font-semibold flex items-center justify-center shrink-0">
                                  {getThaiInitial(person.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm text-slate-900 truncate">
                                    {person.name}
                                  </div>
                                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5 truncate">
                                    <span className="truncate">{person.role || 'ไม่ระบุตำแหน่ง'}</span>
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
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 pl-8 sm:pl-0">
                                <div className="w-40">{renderMoveSelector(person)}</div>
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
