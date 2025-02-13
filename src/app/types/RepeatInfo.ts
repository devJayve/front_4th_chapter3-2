export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export enum RepeatEndType {
  ENDLESS = 'ENDLESS',
  BY_DATE = 'BY_DATE',
  BY_COUNT = 'BY_COUNT',
}

export interface RepeatInfo {
  id?: string;
  type: RepeatType;
  interval: number;
  dayOfWeek?: DayOfWeek;
  endType?: RepeatEndType;
  endDate?: string;
  endCount?: number;
}
