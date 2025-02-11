import { RepeatEndType } from '@/app/types/RepeatInfo.ts';
import { EventForm } from '@/types.ts';

export function generateDailyRepeatEvents(eventForm: EventForm) {
  const events: EventForm[] = [];
  const { repeat, date } = eventForm;
  const currentDate = new Date(date);
  const limitDate = new Date('2025-06-30');

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
    currentDate.setDate(currentDate.getDate() + repeat.interval);
  }

  return events;
}
