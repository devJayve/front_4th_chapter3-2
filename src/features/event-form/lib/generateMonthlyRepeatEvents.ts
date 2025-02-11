import { RepeatEndType } from '@/app/types/RepeatInfo.ts';
import { EventForm } from '@/types.ts';

export function generateMonthlyRepeatEvents(eventForm: EventForm) {
  const events: EventForm[] = [];
  const { repeat, date } = eventForm;
  const currentDate = new Date(date);
  const limitDate = new Date('2025-06-30');
  const originalDate = currentDate.getDate();

  const shouldContinue = (date: Date) => {
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + repeat.interval, originalDate);

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
    currentDate.setMonth(currentDate.getMonth() + repeat.interval, originalDate);
    if (currentDate.getDate() !== originalDate) {
      currentDate.setMonth(currentDate.getMonth() - 1);
      continue;
    }

    events.push({ ...eventForm, date: currentDate.toISOString().split('T')[0] });
  }

  return events;
}
