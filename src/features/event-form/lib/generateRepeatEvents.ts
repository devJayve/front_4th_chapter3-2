import { generateDailyRepeatEvents } from '@/features/event-form/lib/generateDailyRepeatEvents.ts';
import { generateMonthlyRepeatEvents } from '@/features/event-form/lib/generateMonthlyRepeatEvents.ts';
import { generateWeeklyRepeatEvents } from '@/features/event-form/lib/generateWeeklyRepeatEvents.ts';
import { generateYearlyRepeatEvents } from '@/features/event-form/lib/generateYearlyRepeatEvents.ts';
import { EventForm } from '@/types.ts';

export function generateRepeatEvents(eventForm: EventForm) {
  switch (eventForm.repeat.type) {
    case 'daily':
      return generateDailyRepeatEvents(eventForm);
    case 'weekly':
      return generateWeeklyRepeatEvents(eventForm);
    case 'monthly':
      return generateMonthlyRepeatEvents(eventForm);
    case 'yearly':
      return generateYearlyRepeatEvents(eventForm);
    default:
      throw new Error('잘못된 반복 타입입니다.');
  }
}
