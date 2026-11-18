export interface Division {
  id: string;
  num: string;
  name: string;
  isPool?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  staffType: string;
  divisionId: string;
}

export enum ViewMode {
  BOARD = 'board',
  TABLE = 'table',
}

export interface ToastMessage {
  id: string;
  title: string;
  variant: 'success' | 'info' | 'danger';
}
