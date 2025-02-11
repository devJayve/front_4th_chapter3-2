import { RepeatInfo } from '@/types.ts';

export const calculateNextDate = (
  currentYear: number,
  currentMonth: number,
  currentDay: number,
  originalDate: Date,
  repeat: RepeatInfo
): Date | null => {
  const nextDate = new Date(currentYear, currentMonth, currentDay);

  switch (repeat.type) {
    case 'daily':
      nextDate.setDate(currentDay + repeat.interval);
      break;
    case 'weekly':
      nextDate.setDate(currentDay + repeat.interval * 7);
      break;
    case 'monthly':
      nextDate.setMonth(currentMonth + repeat.interval);
      if (nextDate.getDate() !== originalDate.getDate()) {
        return null;
      }
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + repeat.interval);
      if (nextDate.getMonth() !== originalMonth || nextDate.getDate() !== originalDay) {
        return null;
      }
      break;
    default:
      return null;
  }

  return nextDate;
};
