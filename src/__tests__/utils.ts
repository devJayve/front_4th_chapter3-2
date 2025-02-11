import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const isSameMonth = (date1: Date | string, date2: Date | string) => {
  const originDate = date1 instanceof Date ? date1 : new Date(date1);
  const compareDate = date2 instanceof Date ? date2 : new Date(date2);

  if (isNaN(originDate.getTime()) || isNaN(compareDate.getTime())) {
    return false;
  }

  return (
    originDate.getFullYear() === compareDate.getFullYear() &&
    originDate.getMonth() === compareDate.getMonth()
  );
};
