import { expect } from 'vitest';

import { fetchHolidays } from '../../apis/fetchHolidays';

const expectedHolidays = {
  '2024-12': { '2024-12-25': '크리스마스' },
  '2024-09': {
    '2024-09-16': '추석',
    '2024-09-17': '추석',
    '2024-09-18': '추석',
  },
  '2024-10': {
    '2024-10-03': '개천절',
    '2024-10-09': '한글날',
  },
};

describe('fetchHolidays', () => {
  it('올바른 형식의 데이터를 반환한다', () => {
    const date = new Date('2024-10-01');
    const results = fetchHolidays(date);

    Object.entries(results).forEach(([key, value]) => {
      expect(typeof key).toBe('string');
      expect(typeof value).toBe('string');
    });

    Object.keys(results).forEach((date) => {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('주어진 월의 공휴일만 반환한다', () => {
    const date = new Date('2024-12-01');
    const results = fetchHolidays(date);
    expect(results).toEqual(expectedHolidays['2024-12']);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    const date = new Date('2024-07-15');
    const results = fetchHolidays(date);
    expect(Object.keys(results)).toHaveLength(0);
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    const date = new Date('2024-09-22');
    const results = fetchHolidays(date);
    expect(results).toEqual(expectedHolidays['2024-09']);
  });

  it('잘못된 날짜를 전달하면 빈 객체를 반환한다', () => {
    const date = new Date('invalid');
    const result = fetchHolidays(date);
    expect(result).toEqual({});
  });
});
