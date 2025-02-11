import { expect } from 'vitest';

import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

// 현재 테스트와 상관없는 속성들로 구성
type NonRelationWithNotification = Pick<
  Event,
  'title' | 'description' | 'location' | 'category' | 'repeat'
>;

const baseEvent: NonRelationWithNotification = {
  title: 'event',
  description: 'event description',
  location: 'room A',
  category: 'meeting',
  repeat: { type: 'none', interval: 0 },
};

const events: Event[] = [
  // 2월 4일 12시 30분 (1분 전 알림)
  {
    ...baseEvent,
    id: '1',
    date: '2025-02-04',
    startTime: '12:30',
    endTime: '13:30',
    notificationTime: 1,
  },
  // 2월 4일 1시 (10분 전 알림)
  {
    ...baseEvent,
    id: '2',
    date: '2025-02-04',
    startTime: '13:00',
    endTime: '14:00',
    notificationTime: 10,
  },
  // 2월 4일 2시 (2시간 전 알림)
  {
    ...baseEvent,
    id: '3',
    date: '2025-02-04',
    startTime: '14:00',
    endTime: '17:00',
    notificationTime: 120,
  },
  // 2월 4일 10시 30분 (1시간 전 알림)
  {
    ...baseEvent,
    id: '4',
    date: '2025-02-04',
    startTime: '10:30',
    endTime: '11:00',
    notificationTime: 60,
  },
  // 2월 5일 8시 30분 (하루 전 알림)
  {
    ...baseEvent,
    id: '5',
    date: '2025-02-05',
    startTime: '08:30',
    endTime: '10:00',
    notificationTime: 1440,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-02-04T12:29');
    const notifiedEvent: string[] = [];
    const results = getUpcomingEvents(events, now, notifiedEvent);

    const expectedEventIds = ['1', '3', '5'];
    expect(results.map((event) => event.id)).toEqual(expectedEventIds);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-02-04T12:29');
    const notifiedEvent: string[] = ['5'];
    const results = getUpcomingEvents(events, now, notifiedEvent);

    const expectedEventIds = ['1', '3'];
    expect(results.map((event) => event.id)).toEqual(expectedEventIds);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-04T08:00');
    const notifiedEvent: string[] = [];
    const results = getUpcomingEvents(events, now, notifiedEvent);
    expect(results).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-02-05T09:00');
    const notifiedEvent: string[] = [];
    const results = getUpcomingEvents(events, now, notifiedEvent);
    expect(results).toHaveLength(0);
  });

  it('자정을 걸친 알림을 정확히 처리한다', () => {
    const midnightEvent = {
      ...baseEvent,
      id: '6',
      date: '2025-02-05',
      startTime: '00:30',
      endTime: '01:30',
      notificationTime: 60,
    };
    const now = new Date('2025-02-04T23:30');
    const results = getUpcomingEvents([...events, midnightEvent], now, []);
    expect(results.map((event) => event.id)).toContain('6');
  });

  it('이벤트 목록이 비어있을 때 빈 배열을 반환한다', () => {
    const now = new Date('2025-02-04T12:30');
    const results = getUpcomingEvents([], now, []);
    expect(results).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('정확한 알림 시간 시작에 대해 올바른 알림 메시지를 생성해야 한다', () => {
    const now = new Date('2025-02-04T12:30');
    const event = {
      ...baseEvent,
      id: '1',
      date: '2025-02-04',
      startTime: '13:00',
      endTime: '14:30',
      title: '팀 미팅',
      notificationTime: 30,
    };

    const message = createNotificationMessage({ event, now });
    expect(message).toBe('30분 후 팀 미팅 일정이 시작됩니다.');
  });

  it('알림 시간일 때 현재 시간으로부터 남은 시간에 대해 알림을 생성해야 한다.', () => {
    const now = new Date('2025-02-04T12:45');
    const event = {
      ...baseEvent,
      id: '1',
      date: '2025-02-04',
      startTime: '13:00',
      endTime: '14:30',
      title: '팀 미팅',
      notificationTime: 30,
    };
    const message = createNotificationMessage({ event, now });
    expect(message).toBe('15분 후 팀 미팅 일정이 시작됩니다.');
  });

  it('알림 시간이 1시간 이상일 경우 단위가 변경되어야 한다.', () => {
    const event = {
      ...baseEvent,
      id: '1',
      date: '2025-02-04',
      startTime: '13:00',
      endTime: '14:30',
      title: '팀 미팅',
      notificationTime: 120,
    };

    const now1 = new Date('2025-02-04T11:00');
    const message1 = createNotificationMessage({ event, now: now1 });
    expect(message1).toBe('2시간 후 팀 미팅 일정이 시작됩니다.');

    const now2 = new Date('2025-02-04T11:30');
    const message2 = createNotificationMessage({ event, now: now2 });
    expect(message2).toBe('1시간 30분 후 팀 미팅 일정이 시작됩니다.');
  });
});
