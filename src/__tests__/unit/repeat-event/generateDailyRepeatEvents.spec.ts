import { it, expect } from 'vitest';

import { RepeatEndType } from '@/app/types/RepeatInfo';
import { generateDailyRepeatEvents } from '@/features/event-form/lib/generateDailyRepeatEvents.ts';
import { EventForm } from '@/types';

const baseEventForm: EventForm = {
  title: '회의',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '팀 데일리 스크럼 미팅',
  location: '회의실 A',
  category: '업무',
  notificationTime: 30,
  repeat: {
    type: 'daily',
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

  const events = generateDailyRepeatEvents(eventForm);
  const lastEvent = events[events.length - 1];

  expect(events.length).toBe(181);
  expect(lastEvent.date).toBe('2025-06-30');
  expect(events[0].date).toBe('2025-01-01');
  expect(events[1].date).toBe('2025-01-02');
});

it('종료 날짜 지정 시 지정된 날짜까지 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_DATE,
      endDate: '2025-01-05',
    },
  };

  const events = generateDailyRepeatEvents(eventForm);

  expect(events.length).toBe(5);
  expect(events[0].date).toBe('2025-01-01');
  expect(events[events.length - 1].date).toBe('2025-01-05');
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

  const events = generateDailyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-01');
  expect(events[1].date).toBe('2025-01-02');
  expect(events[2].date).toBe('2025-01-03');
});

it('반복 간격을 2로 설정 시 2일 간격으로 이벤트 목록이 생성된다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.BY_COUNT,
      endCount: 3,
      interval: 2,
    },
  };

  const events = generateDailyRepeatEvents(eventForm);

  expect(events.length).toBe(3);
  expect(events[0].date).toBe('2025-01-01');
  expect(events[1].date).toBe('2025-01-03');
  expect(events[2].date).toBe('2025-01-05');
});

it('이벤트 목록 생성 시 date를 제외한 모든 속성이 동일해야한다.', () => {
  const eventForm: EventForm = {
    ...baseEventForm,
    repeat: {
      ...baseEventForm.repeat,
      endType: RepeatEndType.ENDLESS,
    },
  };

  const events = generateDailyRepeatEvents(eventForm);

  events.forEach((event) => {
    const { date, ...eventWithoutDate } = event;
    const { date: originalDate, ...originalWithoutDate } = eventForm;

    expect(eventWithoutDate).toEqual(originalWithoutDate);
  });
});
