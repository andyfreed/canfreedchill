export type RepeatFrequency = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface ParentingSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  type: 'parenting' | 'free';
  repeat: RepeatFrequency;
  repeatUntil?: Date;
}

export interface AdminState {
  isAdmin: boolean;
  password: string;
}