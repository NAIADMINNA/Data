import { ChevronDown, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { formatDivisionOptionLabel, getThaiInitial } from '../constants/divisions';
import { Division, LeadershipRole, StaffMember } from '../types';

interface TableViewProps {
  divisions: Division[];
  filteredStaff: StaffMember[];
  hasActiveFilter: boolean;
  onMoveStaff: (staffId: string, targetDivisionId: string) => void;
  onUpdateLeadershipRole: (staffId: string, leadershipRole: LeadershipRole) => void;
  onEditWorkLocation: (staff: StaffMember) => void;
  onEditStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staff: StaffMember) => void;
  onResetFilters: () => void;
  onAddStaff: () => void;
}

export function TableView({
  divisions,
  filteredStaff,
  hasActiveFilter,
  onMoveStaff,
  onUpdateLeadershipRole,
  onEditWorkLocation,
  onEditStaff,
  onDeleteStaff,
  onResetFilters,
  onAddStaff,
}: TableViewProps) {
  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-14px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="overflow-x-auto subtle-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 font-heading text-xs">
            <tr>
              <th scope="col" className="px-4 py-3 w-14 text-right tabular-nums whitespace-nowrap">
                ลำดับ
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                ชื่อ-สกุล
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                ตำแหน่ง
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                ประเภท
              </th>
              <th scope="col" className="px-4 py-3 w-44 min-w-[155px] whitespace-nowrap">
                บทบาทในกลุ่มงาน
              </th>
              <th scope="col" className="px-4 py-3 w-80 min-w-[240px] whitespace-nowrap">
                สังกัดกลุ่มงาน
              </th>
              <th scope="col" className="px-4 py-3 w-28 text-center whitespace-nowrap">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <p className="text-sm text-slate-500">
                    {hasActiveFilter
                      ? 'ไม่พบรายชื่อเจ้าหน้าที่ตามเงื่อนไขที่ค้นหา'
                      : 'ยังไม่มีรายชื่อเจ้าหน้าที่ในระบบ'}
                  </p>
                  <div className="mt-3.5 flex items-center justify-center gap-3">
                    {hasActiveFilter ? (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="font-heading px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0"
                      >
                        ล้างตัวกรองการค้นหา
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onAddStaff}
                        className="inline-flex items-center gap-1.5 font-heading px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        เพิ่มรายชื่อเจ้าหน้าที่
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredStaff.map((person, idx) => {
                const isAssigned = person.divisionId !== 'unassigned';
                const currentLeadership = person.leadershipRole || '';
                const offsiteLocation = isAssigned ? (person.workLocation || '').trim() : '';
                return (
                  <tr
                    key={person.id}
                    className={`hover:bg-blue-50/25 transition-colors ${
                      isAssigned && currentLeadership === 'หัวหน้ากลุ่ม'
                        ? 'bg-blue-50/15'
                        : isAssigned && currentLeadership === 'หัวหน้าฝ่าย'
                          ? 'bg-indigo-50/15'
                          : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 mt-0.5 rounded-full font-heading text-xs font-semibold flex items-center justify-center shrink-0 ${
                            !isAssigned
                              ? 'bg-amber-100/80 text-amber-900'
                              : currentLeadership === 'หัวหน้ากลุ่ม'
                                ? 'bg-blue-600 text-white'
                                : currentLeadership === 'หัวหน้าฝ่าย'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {getThaiInitial(person.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                            <span className="font-medium text-slate-900">{person.name}</span>
                            {isAssigned && currentLeadership && (
                              <>
                                <span className="text-slate-300" aria-hidden="true">
                                  ·
                                </span>
                                <span
                                  className={`text-xs font-heading font-semibold whitespace-nowrap ${
                                    currentLeadership === 'หัวหน้าฝ่าย'
                                      ? 'text-indigo-700'
                                      : 'text-blue-700'
                                  }`}
                                >
                                  {currentLeadership}
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
                    <td className="px-4 py-3 text-slate-600">{person.role || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {person.staffType || '-'}
                    </td>
                    <td className="px-4 py-2.5">
                      {isAssigned ? (
                        <div className="relative flex items-center">
                          <select
                            aria-label={`ระบุบทบาทในกลุ่มงานของ ${person.name}`}
                            value={currentLeadership}
                            onChange={(e) =>
                              onUpdateLeadershipRole(person.id, e.target.value as LeadershipRole)
                            }
                            className={`w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-lg text-xs transition-colors cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              currentLeadership === 'หัวหน้ากลุ่ม'
                                ? 'bg-blue-50 border border-blue-300 text-blue-800 font-semibold'
                                : currentLeadership === 'หัวหน้าฝ่าย'
                                  ? 'bg-indigo-50 border border-indigo-300 text-indigo-800 font-semibold'
                                  : 'bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            <option value="">เจ้าหน้าที่ทั่วไป</option>
                            <option value="หัวหน้ากลุ่ม">หัวหน้ากลุ่ม</option>
                            <option value="หัวหน้าฝ่าย">หัวหน้าฝ่าย</option>
                          </select>
                          <ChevronDown
                            className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none"
                            aria-hidden="true"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 whitespace-nowrap">รอจัดสรร</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="relative flex items-center">
                        <select
                          aria-label={`เลือกกลุ่มงานของ ${person.name}`}
                          value={person.divisionId}
                          onChange={(e) => onMoveStaff(person.id, e.target.value)}
                          className="w-full appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs sm:text-sm text-slate-700 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-colors cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {divisions.map((d) => (
                            <option key={d.id} value={d.id}>
                              {formatDivisionOptionLabel(d, true)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none"
                          aria-hidden="true"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1">
                        {isAssigned && (
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
                        )}
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
    </div>
  );
}
