import { Division, LeadershipRole, StaffMember } from '../types';

export const STORAGE_KEY = 'doe_staff_division_assignment_v1';
export const DIVISIONS_STORAGE_KEY = 'doe_staff_divisions_v1';

export const DIVISIONS: Division[] = [
  { id: 'unassigned', num: '-', name: 'รายชื่อรอจัดสรร (ยังไม่ระบุกลุ่มงาน)', isPool: true },
  { id: 'div_1', num: '1', name: 'ผู้เชี่ยวชาญเฉพาะด้านการจัดระบบแรงงานต่างด้าว' },
  { id: 'div_2', num: '2', name: 'ฝ่ายบริหารทั่วไป' },
  { id: 'div_3', num: '3', name: 'กลุ่มงานพิจารณาอนุญาตการทำงานของคนต่างด้าว 1' },
  { id: 'div_4', num: '4', name: 'กลุ่มงานพิจารณาอนุญาตการทำงานของคนต่างด้าว 2' },
  { id: 'div_5', num: '5', name: 'กลุ่มงานพัฒนาระบบควบคุมการทำงานของคนต่างด้าว' },
  { id: 'div_6', num: '6', name: 'กลุ่มงานจัดระบบการอนุญาตการทำงานของคนต่างด้าวเพื่อส่งเสริมการลงทุน' },
  { id: 'div_7', num: '7', name: 'กลุ่มงานพิจารณาอุทธรณ์การทำงานของคนต่างด้าว' },
  { id: 'div_8', num: '8', name: 'กลุ่มงานกองทุนเพื่อการบริหารจัดการการทำงานของคนต่างด้าว' },
];

export const STAFF_TYPE_OPTIONS = [
  'ข้าราชการ',
  'พนักงานราชการ',
  'ลูกจ้างประจำ',
  'ลูกจ้างชั่วคราว',
  'จ้างเหมาบริการ',
];

export const LEADERSHIP_ROLE_OPTIONS: Array<{ value: LeadershipRole; label: string }> = [
  { value: '', label: 'เจ้าหน้าที่ทั่วไป' },
  { value: 'หัวหน้ากลุ่ม', label: 'หัวหน้ากลุ่ม' },
  { value: 'หัวหน้าฝ่าย', label: 'หัวหน้าฝ่าย' },
];

export const WORK_LOCATION_SUGGESTIONS = [
  'ช่วยปฏิบัติงานกลุ่มงานอื่น',
  'ปฏิบัติงานสำนักงานส่วนกลาง',
];

export function getLeadershipRank(leadershipRole?: LeadershipRole): number {
  if (leadershipRole === 'หัวหน้ากลุ่ม') return 0;
  if (leadershipRole === 'หัวหน้าฝ่าย') return 1;
  return 2;
}

export const INITIAL_STAFF: StaffMember[] = [
  { id: 's1', name: 'นายสมชาย สายชล', role: 'นักวิชาการแรงงานชำนาญการ', staffType: 'ข้าราชการ', divisionId: 'unassigned' },
  { id: 's2', name: 'นางสาวกานดา พัฒนา', role: 'เจ้าพนักงานแรงงานปฏิบัติงาน', staffType: 'ข้าราชการ', divisionId: 'unassigned' },
  { id: 's3', name: 'นายธนกฤต วงศ์สวัสดิ์', role: 'นักวิชาการแรงงานปฏิบัติการ', staffType: 'ข้าราชการ', divisionId: 'div_3' },
  { id: 's4', name: 'นางสาวพิมพ์ชนก ศรีสุข', role: 'นักจัดการงานทั่วไป', staffType: 'พนักงานราชการ', divisionId: 'div_2' },
];

export function formatDivisionOptionLabel(div: Division, shortPool = false): string {
  if (div.isPool) {
    return shortPool ? 'รอจัดสรร' : div.name;
  }
  return `${div.num}) ${div.name}`;
}

const THAI_PREFIXES = [
  'ว่าที่ร้อยตรีหญิง',
  'ว่าที่ร้อยตรี',
  'ว่าที่ ร.ต.หญิง',
  'ว่าที่ ร.ต.',
  'นางสาว',
  'น.ส.',
  'นาย',
  'นาง',
  'ดร.',
  'ผศ.',
  'รศ.',
  'ศ.',
  'ม.ร.ว.',
  'ม.ล.',
];

export function getThaiInitial(fullName: string): string {
  let cleaned = (fullName || '').trim();
  for (const prefix of THAI_PREFIXES) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length).trim();
      break;
    }
  }
  // Skip leading Thai front vowels (เ แ โ ใ ไ) to show the core initial consonant
  const withoutLeadingVowel = cleaned.replace(/^[เแโใไ]+/, '');
  const target = withoutLeadingVowel || cleaned;
  return target.charAt(0).toUpperCase() || '?';
}

