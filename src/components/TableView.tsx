import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { DIVISIONS, formatDivisionOptionLabel } from '../constants/divisions';
import { StaffMember } from '../types';

interface TableViewProps {
  filteredStaff: StaffMember[];
  hasActiveFilter: boolean;
  onMoveStaff: (staffId: string, targetDivisionId: string) => void;
  onEditStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staff: StaffMember) => void;
  onResetFilters: () => void;
  onAddStaff: () => void;
}

export function TableView({
  filteredStaff,
  hasActiveFilter,
  onMoveStaff,
  onEditStaff,
  onDeleteStaff,
  onResetFilters,
  onAddStaff,
}: TableViewProps) {
  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-500 font-heading text-xs">
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
              <th scope="col" className="px-4 py-3 w-80 min-w-[240px] whitespace-nowrap">
                สังกัดกลุ่มงาน
              </th>
              <th scope="col" className="px-4 py-3 w-24 text-center whitespace-nowrap">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
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
              filteredStaff.map((person, idx) => (
                <tr key={person.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-right text-slate-400 tabular-nums">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{person.name}</td>
                  <td className="px-4 py-3 text-slate-600">{person.role || '-'}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {person.staffType || '-'}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="relative flex items-center">
                      <select
                        aria-label={`เลือกกลุ่มงานของ ${person.name}`}
                        value={person.divisionId}
                        onChange={(e) => onMoveStaff(person.id, e.target.value)}
                        className="w-full appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs sm:text-sm text-slate-700 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-colors cursor-pointer truncate focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DIVISIONS.map((d) => (
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
    </div>
  );
}
