import { expect } from 'vitest';

import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { isSameMonth } from '../utils.ts';

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2024-07-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '첫 번째 기획 회의',
    location: '회의실 2',
    category: 'meeting',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2024-07-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '두 번째 기획 회의',
    location: '회의실 2',
    category: 'meeting',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '3',
    title: 'Work Workshop',
    date: '2024-07-01',
    startTime: '10:00',
    endTime: '17:00',
    description: '팀 워크샵',
    location: 'WORK Center',
    category: 'workshop',
    repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
    notificationTime: 60,
  },
  {
    id: '4',
    title: '일일 스크럼 이벤트',
    date: '2024-07-20',
    startTime: '09:30',
    endTime: '10:00',
    description: 'Daily work sync',
    location: '스크럼실',
    category: 'daily',
    repeat: { type: 'daily', interval: 1, endDate: '2024-07-31' },
    notificationTime: 15,
  },
  {
    id: '5',
    title: '6월 말 워크샵 이벤트',
    date: '2024-06-30',
    startTime: '14:00',
    endTime: '18:00',
    description: '상반기 WORK 리뷰',
    location: '대회의실',
    category: 'workshop',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 45,
  },
  {
    id: '6',
    title: '이벤트 2 후속',
    date: '2024-08-01',
    startTime: '11:00',
    endTime: '12:00',
    description: '이벤트 2 관련 미팅',
    location: '회의실 1',
    category: 'meeting',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 20,
  },
  {
    id: '7',
    title: '작년 워크샵',
    date: '2023-07-15',
    startTime: '09:00',
    endTime: '18:00',
    description: 'Previous work planning',
    location: 'Work Center',
    category: 'workshop',
    repeat: { type: 'yearly', interval: 1, endDate: '2025-07-15' },
    notificationTime: 120,
  },
  {
    id: '8',
    title: '내년 이벤트 2',
    date: '2025-07-01',
    startTime: '13:00',
    endTime: '15:00',
    description: '이벤트 2 연례 행사',
    location: '대강당',
    category: 'event',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '9',
    title: 'Weekly WorkOut',
    date: '2024-07-05',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동 모임',
    location: '체육관',
    category: 'health',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-08-30' },
    notificationTime: 30,
  },
  {
    id: '10',
    title: '장기 워크샵',
    date: '2024-06-29',
    startTime: '09:00',
    endTime: '17:00',
    description: 'Long term workshop',
    location: 'Work place',
    category: 'workshop',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 90,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2024-07-02');
    const monthlyResult = getFilteredEvents({ events, searchTerm, currentDate, view: 'month' });

    monthlyResult.forEach((event) => {
      expect(
        event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
      ).toBeTruthy();
    });
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2024-07-01');
    const weekStart = new Date('2024-06-30');
    const weekEnd = new Date('2024-07-06');

    const weeklyResult = getFilteredEvents({ events, currentDate, searchTerm: '', view: 'week' });

    weeklyResult.forEach((event) => {
      const eventDate = new Date(event.date);
      expect(eventDate >= weekStart && eventDate <= weekEnd).toBeTruthy();
    });
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2024-07-01');

    const monthlyResult = getFilteredEvents({ events, currentDate, searchTerm: '', view: 'month' });
    monthlyResult.forEach((event) => {
      expect(new Date(event.date).getMonth()).toBe(6);
    });
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2024-07-01');
    const weekStart = new Date('2024-06-30');
    const weekEnd = new Date('2024-07-06');
    const searchTerm = '이벤트';

    const weeklyResult = getFilteredEvents({ events, searchTerm, currentDate, view: 'week' });

    weeklyResult.forEach((event) => {
      const eventDate = new Date(event.date);
      expect(eventDate >= weekStart && eventDate <= weekEnd).toBeTruthy();
      expect(
        event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
      ).toBeTruthy();
    });
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2024-07-01');

    const monthlyResult = getFilteredEvents({ events, currentDate, view: 'month' });

    monthlyResult.forEach((event) => {
      expect(isSameMonth(currentDate, event.date)).toBeTruthy();
    });
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const currentDate = new Date('2024-07-01');
    const searchTerms = ['work', 'WORK', 'wOrK'];
    const view = 'month';

    const results = searchTerms.map((searchTerm) =>
      getFilteredEvents({ events, currentDate, view, searchTerm })
    );

    results.forEach((result) => {
      expect(result).toEqual(results[0]);
    });
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const currentDate = new Date('2024-07-15');
    const view = 'month';

    const result = getFilteredEvents({ events, currentDate, view });
    expect(result.length).not.toBe(0);

    result.forEach((event) => {
      expect(isSameMonth(currentDate, event.date)).toBeTruthy();
    });
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const view = 'month';
    const currentDate = new Date('2024-07-01');
    const searchTerm = 'work';
    const result = getFilteredEvents({ events: [], view, searchTerm, currentDate });
    expect(result.length).toBe(0);
  });
});
