export type RepeatFrequency = 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface ParentingSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  repeatFrequency: RepeatFrequency;
  notes?: string;
}

export interface CountdownEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

export interface AdminState {
  isLoggedIn: boolean;
  isEditing: boolean;
}