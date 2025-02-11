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

export interface BaseRepeatInfo {
  id?: string;
  type: RepeatType;
  interval: number;
  dayOfWeek?: DayOfWeek;
}

// 종료 없음
export interface EndlessRepeatInfo extends BaseRepeatInfo {
  endType: RepeatEndType.ENDLESS;
}

// 날짜로 종료
export interface DateEndRepeatInfo extends BaseRepeatInfo {
  endType: RepeatEndType.BY_DATE;
  endDate?: string;
}

// 횟수로 종료
export interface CountEndRepeatInfo extends BaseRepeatInfo {
  endType: RepeatEndType.BY_COUNT;
  endCount?: number;
}

export type RepeatInfo = EndlessRepeatInfo | DateEndRepeatInfo | CountEndRepeatInfo;
