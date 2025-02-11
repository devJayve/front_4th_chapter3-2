import { it, expect } from 'vitest';

import { RepeatEndType, DayOfWeek } from '@/app/types/RepeatInfo';
import { generateWeeklyRepeatEvents } from '@/features/event-form/lib/generateWeeklyRepeatEvents.ts';
import { EventForm } from '@/types';

const baseEventForm: EventForm = {
  title: '주간 회의',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '주간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  notificationTime: 30,
  repeat: {
    type: 'weekly',
    interval: 1,
    endType: RepeatEndType.ENDLESS,
  },
};

it('무기한 반복 시 제한 날짜까지 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.ENDLESS,
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);
  const lastEvent = events[events.length - 1];

  expect(events.length).toBeGreaterThan(0);
  expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(new Date('2025-06-30').getTime());
  expect(events[0].date).toBe('2025-01-01');
  expect(events[1].date).toBe('2025-01-08');
});

it('종료 날짜 지정 시 지정된 날짜까지 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_DATE,
      endDate: '2025-01-22',
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);

  expect(events.length).toBe(4);
  expect(events[0].date).toBe('2025-01-01');
  expect(events[1].date).toBe('2025-01-08');
  expect(events[2].date).toBe('2025-01-15');
  expect(events[3].date).toBe('2025-01-22');
});

it('반복 횟수 지정 시 지정된 횟수만큼 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-01');
  expect(events[1].date).toBe('2025-01-08');
  expect(events[2].date).toBe('2025-01-15');
});

it('반복 간격을 2로 설정 시 2주 간격으로 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
      interval: 2,
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-01');
  expect(events[1].date).toBe('2025-01-15'); // 2주 후
  expect(events[2].date).toBe('2025-01-29'); // 4주 후
});

it('요일 지정 시 지정된 요일에 대해서만 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2025-01-01', // 수요일
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
      dayOfWeek: 'friday' as DayOfWeek, // 금요일로 지정
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-03');
  expect(events[1].date).toBe('2025-01-10');
  expect(events[2].date).toBe('2025-01-17');
});

it('현재 요일 이전의 요일을 지정하더라도 현재 날짜 이후로 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2025-01-03', // 금요일
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
      dayOfWeek: 'wednesday' as DayOfWeek, // 수요일로 지정
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);

  expect(events[0].date).toBe('2025-01-08'); // 다음 주 수요일
  expect(events[1].date).toBe('2025-01-15');
  expect(events[2].date).toBe('2025-01-22');
});

it('요일 미지정 시 시작일 기준으로 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2025-01-01', // 월요일
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
      dayOfWeek: undefined,
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);

  expect(events[0].date).toBe('2025-01-01'); // 월요일 유지
  expect(events[1].date).toBe('2025-01-08');
  expect(events[2].date).toBe('2025-01-15');
});

it('모든 반복 이벤트는 date를 제외한 나머지 속성이 동일해야 한다', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
    },
  };

  const events = generateWeeklyRepeatEvents(eventForm);

  events.forEach((event) => {
    const { date, ...eventWithoutDate } = event;
    const { date: originalDate, ...originalWithoutDate } = eventForm;

    expect(eventWithoutDate).toEqual(originalWithoutDate);
  });

  const uniqueDates = new Set(events.map((event) => event.date));
  expect(uniqueDates.size).toBe(events.length);
});
