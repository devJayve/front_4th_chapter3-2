import { calculateNextDate } from '@/features/event-form/lib/calculateNextDate.ts';
import { EventForm } from '@/types.ts';

const generateRepeatEvents = (baseEvent: EventForm) => {
  const events = [];
  const originalDate = new Date(baseEvent.date);
  const endDate = baseEvent.repeat.endDate
    ? new Date(baseEvent.repeat.endDate)
    : new Date('2025-06-30');

  let currentYear = originalDate.getFullYear();
  let currentMonth = originalDate.getMonth();
  let currentDay = originalDate.getDate();
  const currentDate = new Date(currentYear, currentMonth, currentDay);

  events.push(baseEvent);

  while (currentDate >= endDate) {
    switch (baseEvent.repeat.type) {
      case 'daily':
        currentDay += baseEvent.repeat.interval;
        break;
      case 'weekly':
        currentDay += baseEvent.repeat.interval * 7;
        break;
      case 'monthly':
        currentMonth += baseEvent.repeat.interval;
        if (currentMonth > 11) {
          currentYear += Math.floor(currentMonth / 12);
          currentMonth = currentMonth % 12;
        }
        break;
      case 'yearly':
        currentYear += baseEvent.repeat.interval;
        break;
      default:
        break;
    }
    currentDate.setFullYear(currentYear, currentMonth, currentDay);

    if (baseEvent.repeat.type === 'monthly' || baseEvent.repeat.type === 'yearly') {
      if (!isValidNextDate(originalDate, currentDate, baseEvent.repeat.type)) {
        continue;
      }
    }

    events.push({ ...baseEvent, date: currentDate.toISOString().split('T')[0] });
  }

  return events;
};

const isValidNextDate = (baseDate: Date, nextDate: Date, type: 'monthly' | 'yearly') => {
  if (type === 'monthly') {
    return nextDate.getDate() === baseDate.getDate();
  }
  return nextDate.getMonth() === baseDate.getMonth() && nextDate.getDate() === baseDate.getDate();
};

const date = new Date(2024, 11, 31);
console.log(date);
date.setMonth(date.getMonth() + 1);
console.log(date);
date.setMonth(date.getMonth() + 1);
console.log(date);
date.setMonth(date.getMonth() + 1);
console.log(date);
