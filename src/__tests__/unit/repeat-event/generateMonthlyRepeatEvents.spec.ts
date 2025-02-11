import { it, expect } from 'vitest';

import { RepeatEndType } from '@/app/types/RepeatInfo';
import { generateMonthlyRepeatEvents } from '@/features/event-form/lib/generateMonthlyRepeatEvents.ts';
import { EventForm } from '@/types';

const baseEventForm: EventForm = {
  title: '월간 회의',
  date: '2025-01-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '월간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  notificationTime: 30,
  repeat: {
    type: 'monthly',
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

  const events = generateMonthlyRepeatEvents(eventForm);
  const lastEvent = events[events.length - 1];

  expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(new Date('2025-06-30').getTime());
  expect(events.length).toBe(6);
  expect(events[0].date).toBe('2025-01-15');
  expect(events[1].date).toBe('2025-02-15');
});

it('종료 날짜 지정 시 지정된 날짜까지 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_DATE,
      endDate: '2025-04-15',
    },
  };

  const events = generateMonthlyRepeatEvents(eventForm);

  expect(events.length).toBe(4);
  expect(events[0].date).toBe('2025-01-15');
  expect(events[events.length - 1].date).toBe('2025-04-15');
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

  const events = generateMonthlyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-15');
  expect(events[1].date).toBe('2025-02-15');
  expect(events[2].date).toBe('2025-03-15');
});

it('반복 간격을 2로 설정 시 2개월 간격으로 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
      interval: 2,
    },
  };

  const events = generateMonthlyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-15');
  expect(events[1].date).toBe('2025-03-15');
  expect(events[2].date).toBe('2025-05-15');
});

it('31일에 대해 해당 날짜가 존재하지 않는 월은 건너뛴다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2025-01-31',
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_DATE,
      endDate: '2025-05-31',
    },
  };

  const events = generateMonthlyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-31');
  expect(events[1].date).toBe('2025-03-31');
  expect(events[2].date).toBe('2025-05-31');
});

it('30일에 대해 2월을 제외하고 모든 달에 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2025-01-30',
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.ENDLESS,
    },
  };

  const events = generateMonthlyRepeatEvents(eventForm);

  expect(events.length).toBe(5);
  expect(events[0].date).toBe('2025-01-30');
  expect(events[1].date).toBe('2025-03-30');
  expect(events[2].date).toBe('2025-04-30');
  expect(events[3].date).toBe('2025-05-30');
  expect(events[4].date).toBe('2025-06-30');
});

it('윤년이 아닌 경우 2월 29일은 제외한다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2024-01-29',
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_DATE,
      endDate: '2025-03-29',
    },
  };

  const events = generateMonthlyRepeatEvents(eventForm);

  expect(events.length).toBe(14);
  const has2024Feb29 = events.find((event) => event.date === '2024-02-29');
  expect(has2024Feb29).toBeTruthy();

  const has2025Feb29 = events.find((event) => event.date === '2025-02-29');
  expect(has2025Feb29).toBeUndefined();
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

  const events = generateMonthlyRepeatEvents(eventForm);

  events.forEach((event) => {
    const { date, ...eventWithoutDate } = event;
    const { date: originalDate, ...originalWithoutDate } = eventForm;

    expect(eventWithoutDate).toEqual(originalWithoutDate);
  });

  const uniqueDates = new Set(events.map((event) => event.date));
  expect(uniqueDates.size).toBe(events.length);
});
