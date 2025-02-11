import { Event } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  // 1~12월이 아닌 경우 -1 반환
  if (month > 12 || month < 1) return -1;
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

/**
 * 주어진 달의 가능한 최대 위의 날짜 정보를 2차원 배열로 반환합니다.
 */
export function getFullWeeksAtMonth(month = 0) {
  const maxDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const lastDay = maxDaysInMonth[month];

  return Array.from({ length: Math.ceil(lastDay / 7) }, (_, weekIndex) =>
    Array.from(
      { length: Math.min(7, lastDay - weekIndex * 7) },
      (_, dayIndex) => weekIndex * 7 + dayIndex + 1
    )
  );
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

/**
 * 주어진 날짜의 주차 정보를 "YYYY년 M월 N주" 형식으로 반환합니다.
 * ISO 8601 규격에 따라 1주차는 해당 년도의 첫 번째 목요일을 기준으로 합니다.
 */
export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return date >= rangeStart && date <= rangeEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}

export function formatMinuteTime(min: number) {
  if (min <= 0) return 'Invalid Minutes';
  if (min >= 1440) {
    const days = Math.floor(min / 1440);
    const remainingMinutes = min % 1440;
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    if (hours === 0 && minutes === 0) {
      return `${days}일`;
    } else if (minutes === 0) {
      return `${days}일 ${hours}시간`;
    } else if (hours === 0) {
      return `${days}일 ${minutes}분`;
    }
    return `${days}일 ${hours}시간 ${minutes}분`;
  }
  if (min >= 60) {
    const hours = Math.floor(min / 60);
    const minutes = min % 60;

    if (minutes === 0) {
      return `${hours}시간`;
    }
    return `${hours}시간 ${minutes}분`;
  }
  return `${min}분`;
}

export function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function dayToNumber(day: string) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.indexOf(day);
}
