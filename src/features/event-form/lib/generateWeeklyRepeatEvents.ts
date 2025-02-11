import { RepeatEndType } from '@/app/types/RepeatInfo.ts';
import { EventForm } from '@/types.ts';
import { dayToNumber } from '@/utils/dateUtils.ts';

export function generateWeeklyRepeatEvents(eventForm: EventForm) {
  const events: EventForm[] = [];
  const { repeat, date } = eventForm;
  const currentDate = new Date(date);
  const limitDate = new Date('2025-06-30');

  if (repeat.dayOfWeek) {
    const targetDay = dayToNumber(repeat.dayOfWeek);
    const currentDay = currentDate.getDay();
    const diff = targetDay - currentDay;

    // 다음 지정된 요일로 이동
    currentDate.setDate(currentDate.getDate() + (diff >= 0 ? diff : diff + 7));
  }

  const shouldContinue = (date: Date) => {
    switch (repeat.endType) {
      case RepeatEndType.ENDLESS:
        return date <= limitDate;
      case RepeatEndType.BY_DATE:
        return date <= new Date(repeat.endDate!);
      case RepeatEndType.BY_COUNT:
        return events.length < repeat.endCount!;
      default:
        throw new Error('Unsupported repeat end type');
    }
  };

  while (shouldContinue(currentDate)) {
    events.push({ ...eventForm, date: currentDate.toISOString().split('T')[0] });
    currentDate.setDate(currentDate.getDate() + repeat.interval * 7);
  }

  return events;
}
