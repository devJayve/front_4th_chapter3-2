import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const baseEvent: Pick<Event, 'category' | 'startTime' | 'endTime' | 'repeat' | 'notificationTime'> =
  {
    category: 'work',
    startTime: '09:00',
    endTime: '10:00',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

const events: Event[] = [
  {
    ...baseEvent,
    id: '1',
    date: '2024-10-01',
    title: '이벤트 1',
    description: '테스트 설명',
    location: '사무실',
  },
  {
    ...baseEvent,
    id: '2',
    date: '2024-10-03',
    title: '이벤트 2',
    description: '중요한 이벤트',
    location: '사무실',
  },
  {
    ...baseEvent,
    id: '3',
    date: '2024-10-05',
    title: '테스트 이벤트',
    description: '온라인 미팅',
    location: 'Zoom',
  },
  {
    ...baseEvent,
    id: '4',
    date: '2024-10-15',
    title: '이벤트 3',
    description: '일정 논의',
    location: '테스트 위치',
  },
  {
    ...baseEvent,
    id: '5',
    date: '2024-10-17',
    title: '회의 1',
    description: '외부 미팅',
    location: '사무실',
  },
  {
    ...baseEvent,
    id: '6',
    date: '2024-10-29',
    title: '회의 2',
    description: '내부 미팅',
    location: '사무실',
  },
  {
    ...baseEvent,
    id: '7',
    date: '2024-10-30',
    title: '점심 약속',
    description: '팀 단체 회식',
    location: '강남',
  },
];

beforeEach(() => {
  vi.setSystemTime(new Date('2024-10-01'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('기능 테스트', () => {
  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const currentDate = new Date();
    const view = 'month';
    const { result } = renderHook(() => useSearch({ events, currentDate, view }));
    expect(result.current.searchTerm).toBe('');
    expect(result.current.filteredEvents).toEqual(events);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const currentDate = new Date();
    const view = 'month';
    const { result } = renderHook(() => useSearch({ events, currentDate, view }));

    act(() => {
      result.current.setSearchTerm('이벤트');
    });

    const expectedEventIds = ['1', '2', '3', '4'];
    expect(result.current.filteredEvents.map((event) => event.id)).toEqual(expectedEventIds);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const currentDate = new Date();
    const view = 'month';
    const { result } = renderHook(() => useSearch({ events, currentDate, view }));

    act(() => {
      result.current.setSearchTerm('테스트');
    });

    const expectedEventIds = ['1', '3', '4'];
    expect(result.current.filteredEvents.map((event) => event.id)).toEqual(expectedEventIds);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result, rerender } = renderHook(
      ({ events, currentDate, view }) => useSearch({ events, currentDate, view }),
      {
        initialProps: {
          events: events,
          currentDate: new Date(),
          view: 'week' as 'week' | 'month',
        },
      }
    );

    const expectedWeeklyEventIds = ['1', '2', '3'];
    expect(result.current.filteredEvents.map((event) => event.id)).toEqual(expectedWeeklyEventIds);

    rerender({ events: events, currentDate: new Date(), view: 'month' as 'week' | 'month' });

    expect(result.current.filteredEvents).toEqual(events);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const currentDate = new Date();
    const { result } = renderHook(() =>
      useSearch({ events, currentDate, view: 'month' as 'week' | 'month' })
    );

    act(() => {
      result.current.setSearchTerm('회의');
    });

    const expectedEventIds = ['5', '6'];
    expect(result.current.filteredEvents.map((event) => event.id)).toEqual(expectedEventIds);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    const expectedEventId = ['7'];
    expect(result.current.filteredEvents.map((event) => event.id)).toEqual(expectedEventId);
  });
});
