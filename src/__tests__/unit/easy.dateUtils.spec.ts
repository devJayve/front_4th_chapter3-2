import { describe, expect } from 'vitest';

import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMinuteTime,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2023, 1)).toBe(31);
    expect(getDaysInMonth(2024, 1)).toBe(31);
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2023, 4)).toBe(30);
    expect(getDaysInMonth(2024, 4)).toBe(30);
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2000, 2)).toBe(29);
    expect(getDaysInMonth(2020, 2)).toBe(29);
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
    expect(getDaysInMonth(2025, 2)).toBe(28);
    expect(getDaysInMonth(2100, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2024, 0)).toBe(-1);
    expect(getDaysInMonth(2024, 13)).toBe(-1);
    expect(getDaysInMonth(2024, -1)).toBe(-1);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date(2025, 1, 5); // 2025년 2월 5일(수요일)
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(2);
    expect(weekDates[1].getDate()).toBe(3);
    expect(weekDates[2].getDate()).toBe(4);
    expect(weekDates[3].getDate()).toBe(5); // 수요일 (기준일)
    expect(weekDates[4].getDate()).toBe(6);
    expect(weekDates[5].getDate()).toBe(7);
    expect(weekDates[6].getDate()).toBe(8);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date(2025, 1, 3); // 2025년 2월 3일(월요일)
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(2);
    expect(weekDates[1].getDate()).toBe(3); // 월요일 (기준일)
    expect(weekDates[2].getDate()).toBe(4);
    expect(weekDates[3].getDate()).toBe(5);
    expect(weekDates[4].getDate()).toBe(6);
    expect(weekDates[5].getDate()).toBe(7);
    expect(weekDates[6].getDate()).toBe(8);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const date = new Date(2025, 1, 2); // 2025년 2월 2일(일요일)
    const weekDates = getWeekDates(date);
    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(2); // 일요일 (기준일)
    expect(weekDates[1].getDate()).toBe(3);
    expect(weekDates[2].getDate()).toBe(4);
    expect(weekDates[3].getDate()).toBe(5);
    expect(weekDates[4].getDate()).toBe(6);
    expect(weekDates[5].getDate()).toBe(7);
    expect(weekDates[6].getDate()).toBe(8);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date(2024, 11, 29); // 2024년 12월 29일(일요일)
    const weekDates = getWeekDates(date);

    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[0].getMonth()).toBe(11);
    expect(weekDates[0].getFullYear()).toBe(2024);

    expect(weekDates[3].getDate()).toBe(1);
    expect(weekDates[3].getMonth()).toBe(0);
    expect(weekDates[3].getFullYear()).toBe(2025);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date(2025, 0, 1); // 2025년 1월 1일(수요일)
    const weekDates = getWeekDates(date);

    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[0].getMonth()).toBe(11);
    expect(weekDates[0].getFullYear()).toBe(2024);

    expect(weekDates[3].getDate()).toBe(1);
    expect(weekDates[3].getMonth()).toBe(0);
    expect(weekDates[3].getFullYear()).toBe(2025);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date(2024, 1, 29); // 2024년 2월 29일(목요일)
    const weekDates = getWeekDates(date);

    expect(weekDates[0].getMonth()).toBe(1);
    expect(weekDates[4].getMonth()).toBe(1);
    expect(weekDates[5].getMonth()).toBe(2);
    expect(weekDates[6].getMonth()).toBe(2);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date(2025, 3, 30); // 2025년 4월 30일(수요일)
    const weekDates = getWeekDates(date);

    expect(weekDates[0].getDate()).toBe(27);
    expect(weekDates[0].getMonth()).toBe(3);

    expect(weekDates[3].getDate()).toBe(30); // 수요일 (기준일)
    expect(weekDates[3].getMonth()).toBe(3);

    expect(weekDates[4].getDate()).toBe(1);
    expect(weekDates[4].getMonth()).toBe(4);

    expect(weekDates[6].getDate()).toBe(3);
    expect(weekDates[6].getMonth()).toBe(4);
  });
});

describe('getWeeksAtMonth', () => {
  it('2024년 7월의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date(2024, 6, 1); // 2024년 7월 1일(월요일)
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toEqual([
      [null, 1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12, 13],
      [14, 15, 16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25, 26, 27],
      [28, 29, 30, 31, null, null, null],
    ]);
  });
});

describe('getEventsForDay', () => {
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-02-01T00:00:00.000Z',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 1 설명',
      location: '회의실 A',
      category: '회의',
      repeat: {
        type: 'daily',
        interval: 10,
      },
      notificationTime: 30,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-02-01T12:30:00.000Z',
      startTime: '12:30',
      endTime: '13:30',
      description: '이벤트 2 설명',
      location: '회의실 B',
      category: '미팅',
      repeat: {
        type: 'weekly',
        interval: 1,
      },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2024-02-15T09:00:00.000Z',
      startTime: '09:00',
      endTime: '11:00',
      description: '이벤트 3 설명',
      location: '대회의실',
      category: '프레젠테이션',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 60,
    },
    {
      id: '4',
      title: '다음달 이벤트',
      date: '2024-03-01T00:00:00.000Z',
      startTime: '14:00',
      endTime: '15:00',
      description: '다음달 이벤트 설명',
      location: '회의실 C',
      category: '회의',
      repeat: {
        type: 'monthly',
        interval: 2,
      },
      notificationTime: 10,
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 1);

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((event) => new Date(event.date).getDate() === 1)).toBe(true);
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 2);

    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 0);

    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(sampleEvents, 32);

    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date1 = new Date(2025, 1, 13); // 2025년 2월 13일 (목)
    const date2 = new Date(2025, 1, 20); // 2025년 2월 20일 (목)

    expect(formatWeek(date1)).toBe('2025년 2월 2주');
    expect(formatWeek(date2)).toBe('2025년 2월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date1 = new Date(2025, 1, 1); // 2025년 2월 1일 (토)
    const date2 = new Date(2025, 1, 6); // 2025년 2월 6일 (목)
    const date3 = new Date(2025, 1, 7); // 2025년 2월 7일 (금)

    expect(formatWeek(date1)).toBe('2025년 1월 5주');
    expect(formatWeek(date2)).toBe('2025년 2월 1주');
    expect(formatWeek(date3)).toBe('2025년 2월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date1 = new Date(2025, 1, 27); // 2025년 2월 27일 (목)
    const date2 = new Date(2025, 1, 28); // 2025년 2월 28일 (금)
    const date3 = new Date(2025, 2, 1); // 2025년 3월 1일 (토)

    expect(formatWeek(date1)).toBe('2025년 2월 4주');
    expect(formatWeek(date2)).toBe('2025년 2월 4주');
    expect(formatWeek(date3)).toBe('2025년 2월 4주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date1 = new Date(2024, 11, 29); // 2024년 12월 29일 (일)
    const date2 = new Date(2024, 11, 31); // 2024년 12월 31일 (화)
    const date3 = new Date(2025, 0, 2); // 2025년 1월 2일 (목)
    const date4 = new Date(2025, 0, 5); // 2025년 1월 5일 (일)

    expect(formatWeek(date1)).toBe('2025년 1월 1주');
    expect(formatWeek(date2)).toBe('2025년 1월 1주');
    expect(formatWeek(date3)).toBe('2025년 1월 1주');
    expect(formatWeek(date4)).toBe('2025년 1월 2주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2024, 1, 29); // 2024년 2월 29일 (목)

    expect(formatWeek(date)).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 1, 27); // 2025년 2월 27일 (목)

    expect(formatWeek(date)).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2024년 7월 10일을 '2024년 7월'로 반환한다", () => {
    const date = new Date(2024, 6, 10); // 2024년 7월 10일
    expect(formatMonth(date)).toBe('2024년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2024-07-01');
  const rangeEnd = new Date('2024-07-31');

  it('범위 내의 날짜 2024-07-10에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-10');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2024-07-01에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2024-07-31에 대해 true를 반환한다', () => {
    const date = new Date('2024-07-31');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2024-06-30에 대해 false를 반환한다', () => {
    const date = new Date('2024-06-30');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2024-08-01에 대해 false를 반환한다', () => {
    const date = new Date('2024-08-01');
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const date1 = new Date('2024-07-01');
    const date2 = new Date('2024-07-31');
    const date3 = new Date('2024-07-15');

    expect(isDateInRange(date1, rangeEnd, rangeStart)).toBe(false);
    expect(isDateInRange(date2, rangeEnd, rangeStart)).toBe(false);
    expect(isDateInRange(date3, rangeEnd, rangeStart)).toBe(false);
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(3)).toBe('03');
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(10000, 2)).toBe('10000');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date(2024, 11, 3); // 2024년 12월 3일
    expect(formatDate(date)).toBe('2024-12-03');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date(2024, 1, 3); // 2024년 2월 3일
    expect(formatDate(date, 15)).toBe('2024-02-15');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2024, 0, 3); // 2024년 2월 3일
    expect(formatDate(date)).toBe('2024-01-03');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2024, 1, 1); // 2024년 2월 1일
    expect(formatDate(date)).toBe('2024-02-01');
  });
});

describe('formatMinuteTime', () => {
  it('30에 대하여 30분으로 포맷팅한다.', () => {
    expect(formatMinuteTime(30)).toBe('30분');
  });

  it('1시간 이상에 대하여 시간을 붙여 포맷팅한다.', () => {
    expect(formatMinuteTime(60)).toBe('1시간');
    expect(formatMinuteTime(128)).toBe('2시간 8분');
  });

  it('유효하지 않은 값을 넣은 경우 Invalid Minutes를 반환한다.', () => {
    expect(formatMinuteTime(-120)).toBe('Invalid Minutes');
    expect(formatMinuteTime(0)).toBe('Invalid Minutes');
  });
});
