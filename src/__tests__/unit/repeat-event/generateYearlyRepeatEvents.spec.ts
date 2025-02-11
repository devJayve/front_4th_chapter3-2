import { it, expect } from 'vitest';

import { RepeatEndType } from '@/app/types/RepeatInfo';
import { generateYearlyRepeatEvents } from '@/features/event-form/lib/generateYearlyRepeatEvents.ts';
import { EventForm } from '@/types';

const baseEventForm: EventForm = {
  title: '연간 회의',
  date: '2024-03-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '연간 회의',
  location: '회의실 A',
  category: '업무',
  notificationTime: 30,
  repeat: {
    type: 'yearly',
    interval: 1,
    endType: RepeatEndType.ENDLESS,
  },
};

it('무기한 반복 시 제한 날짜까지 이벤트 목록을 생성한다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.ENDLESS,
    },
  };

  const events = generateYearlyRepeatEvents(eventForm);
  const lastEvent = events[events.length - 1];

  console.log(events);
  expect(events.length).toBeGreaterThan(0);
  expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(new Date('2025-06-30').getTime());
  expect(events[0].date).toBe('2024-03-15');
  expect(events[1].date).toBe('2025-03-15');
});

it('종료 날짜 지정 시 지정된 날짜까지 이벤트 목록을 생성한다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_DATE,
      endDate: '2026-03-15',
    },
  };

  const events = generateYearlyRepeatEvents(eventForm);

  expect(events.length).toBe(3); // 2024, 2025, 2026
  expect(events[0].date).toBe('2024-03-15');
  expect(events[events.length - 1].date).toBe('2026-03-15');
});

it('반복 횟수 지정 시 지정된 횟수만큼 이벤트 목록을 생성한다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
    },
  };

  const events = generateYearlyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2024-03-15');
  expect(events[1].date).toBe('2025-03-15');
  expect(events[2].date).toBe('2026-03-15');
});

it('반복 간격 설정 시 2년 간격으로 이벤트 목록을 생성한다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
      interval: 2,
    },
  };

  const events = generateYearlyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2024-03-15');
  expect(events[1].date).toBe('2026-03-15');
  expect(events[2].date).toBe('2028-03-15');
});

it('2월 29일에 대해 윤년이 아닌 해는 건너뛴다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2024-02-29', // 윤년
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_DATE,
      endDate: '2028-02-29',
    },
  };

  const events = generateYearlyRepeatEvents(eventForm);

  expect(events.length).toBe(2); // 2024년, 2028년 (2025-2027년은 건너뜀)
  expect(events[0].date).toBe('2024-02-29');
  expect(events[1].date).toBe('2028-02-29');
});

it('2월 28일에 대해 모든 해에 이벤트가 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    date: '2024-02-28',
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
    },
  };

  const events = generateYearlyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2024-02-28');
  expect(events[1].date).toBe('2025-02-28');
  expect(events[2].date).toBe('2026-02-28');
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

  const events = generateYearlyRepeatEvents(eventForm);

  events.forEach((event) => {
    const { date, ...eventWithoutDate } = event;
    const { date: originalDate, ...originalWithoutDate } = eventForm;

    expect(eventWithoutDate).toEqual(originalWithoutDate);
  });

  const uniqueDates = new Set(events.map((event) => event.date));
  expect(uniqueDates.size).toBe(events.length);
});
