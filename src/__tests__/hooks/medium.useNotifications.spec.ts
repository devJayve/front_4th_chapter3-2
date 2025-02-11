import { act, renderHook } from '@testing-library/react';
import { describe, expect } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const currentDate = new Date('2024-10-15T08:30');
    vi.setSystemTime(currentDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    vi.setSystemTime(new Date('2024-10-15T08:50'));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    const now = new Date();
    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: createNotificationMessage({ event: mockEvents[0], now }),
      },
    ]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    vi.setSystemTime(new Date('2024-10-15T08:50'));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    vi.setSystemTime(new Date('2024-10-15T08:50'));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);

    vi.setSystemTime(new Date('2024-10-15T08:55'));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);
  });
});
