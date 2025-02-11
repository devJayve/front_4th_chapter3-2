import { RepeatEndType } from '@/app/types/RepeatInfo.ts';
import { EventForm } from '@/types.ts';

export function generateYearlyRepeatEvents(eventForm: EventForm) {
  const events: EventForm[] = [];
  const { repeat, date } = eventForm;
  const currentDate = new Date(date);
  const limitDate = new Date('2025-06-30');
  const originalMonth = currentDate.getMonth();
  const originalDate = currentDate.getDate();

  const shouldContinue = (date: Date) => {
    const nextDate = new Date(date);
    nextDate.setFullYear(nextDate.getFullYear() + repeat.interval, originalMonth, originalDate);

    switch (repeat.endType) {
      case RepeatEndType.ENDLESS:
        return nextDate <= limitDate;
      case RepeatEndType.BY_DATE:
        return nextDate <= new Date(repeat.endDate!);
      case RepeatEndType.BY_COUNT:
        return events.length < repeat.endCount!;
      default:
        throw new Error('Unsupported repeat end type');
    }
  };

  events.push({ ...eventForm, date: currentDate.toISOString().split('T')[0] });

  while (shouldContinue(currentDate)) {
    currentDate.setFullYear(
      currentDate.getFullYear() + repeat.interval,
      originalMonth,
      originalDate
    );
    if (currentDate.getDate() !== originalDate || currentDate.getMonth() !== originalMonth) {
      continue;
    }

    events.push({ ...eventForm, date: currentDate.toISOString().split('T')[0] });
  }

  return events;
}
