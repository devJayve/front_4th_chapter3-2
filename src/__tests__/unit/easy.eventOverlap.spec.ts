import { expect } from 'vitest';

import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDateCases = [
      ['2024-13-01', '14:30'], // 존재하지 않는 월
      ['2024-07-32', '14:30'], // 존재하지 않는 일
      ['2024/07/01', '14:30'], // 잘못된 구분자
      ['20240701', '14:30'], // 구분자 없음
      ['abcd-ef-gh', '14:30'], // 숫자가 아닌 값
    ];

    invalidDateCases.forEach(([date, time]) => {
      const result = parseDateTime(date, time);
      expect(isNaN(result.getTime())).toBe(true);
      expect(result.toString()).toBe('Invalid Date');
    });
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeCases = [
      ['2024-07-01', '25:30'], // 존재하지 않는 시간
      ['2024-07-01', '14:60'], // 존재하지 않는 분
      ['2024-07-01', '14/30'], // 잘못된 구분자
      ['2024-07-01', '1430'], // 구분자 없음
      ['2024-07-01', 'ab:cd'], // 숫자가 아닌 값
    ];

    invalidTimeCases.forEach(([date, time]) => {
      const result = parseDateTime(date, time);
      expect(isNaN(result.getTime())).toBe(true);
      expect(result.toString()).toBe('Invalid Date');
    });
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const emptyCases = [
      ['', '14:30'], // 빈 날짜
      ['2024-07-01', ''], // 빈 시간
      ['', ''], // 모두 빈 경우
    ];

    emptyCases.forEach(([date, time]) => {
      const result = parseDateTime(date, time);
      expect(isNaN(result.getTime())).toBe(true);
      expect(result.toString()).toBe('Invalid Date');
    });
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
    id: '1',
    title: 'Meeting',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: 'Discuss the project',
    location: 'Office',
    category: 'work',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2024-07-01T14:30'));
    expect(result.end).toEqual(new Date('2024-07-01T15:30'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvents = [
      { ...event, date: '2024-13-01' },
      { ...event, date: '2024-07-32' },
      { ...event, date: '2024/07/01' },
      { ...event, date: '20240701' },
      { ...event, date: 'abcd-ef-gh' },
      { ...event, date: '' },
    ];
    invalidDateEvents.forEach((event) => {
      const result = convertEventToDateRange(event);
      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).toBe('Invalid Date');
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidStartTimeEvents = [
      { ...event, startTime: '25:30' },
      { ...event, startTime: '14:60' },
      { ...event, startTime: '14/30' },
      { ...event, startTime: 'ab:cd' },
      { ...event, startTime: '1430' },
      { ...event, startTime: '' },
    ];

    invalidStartTimeEvents.forEach((event) => {
      const result = convertEventToDateRange(event);
      expect(result.start.toString()).toBe('Invalid Date');
      expect(result.end.toString()).not.toBe('Invalid Date');
    });

    const invalidEndTimeEvents = [
      { ...event, endTime: '25:30' },
      { ...event, endTime: '14:60' },
      { ...event, endTime: '14/30' },
      { ...event, endTime: 'ab:cd' },
      { ...event, endTime: '1430' },
      { ...event, endTime: '' },
    ];

    invalidEndTimeEvents.forEach((event) => {
      const result = convertEventToDateRange(event);
      expect(result.start.toString()).not.toBe('Invalid Date');
      expect(result.end.toString()).toBe('Invalid Date');
    });
  });
});

describe('isOverlapping', () => {
  const originalEvent: Event = {
    id: '1',
    title: 'Meeting',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: 'Discuss the project',
    location: 'Office',
    category: 'work',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent: Event = {
      id: '2',
      title: 'Meeting',
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: 'Discuss the project',
      location: 'Office',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const result = isOverlapping(originalEvent, overlappingEvent);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlappingEvent: Event[] = [
      { ...originalEvent, date: '2024-07-01', startTime: '16:00', endTime: '17:00' },
      { ...originalEvent, date: '2024-07-02', startTime: '14:30', endTime: '15:30' },
      { ...originalEvent, date: '2024-07-01', startTime: '15:30', endTime: '16:30' },
    ];

    nonOverlappingEvent.forEach((event) => {
      expect(isOverlapping(originalEvent, event)).toBe(false);
    });
  });
});

describe('findOverlappingEvents', () => {
  const newEvent: Event = {
    id: '1',
    title: 'Meeting',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    description: 'Discuss the project',
    location: 'Office',
    category: 'work',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  const overlappingEvents: Event[] = [
    {
      id: '2',
      title: 'Team Sync',
      date: '2024-07-01',
      startTime: '15:00',
      endTime: '16:00',
      description: 'Weekly team sync',
      location: 'Meeting Room A',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '3',
      title: 'Project Review',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: 'Review project progress',
      location: 'Conference Room',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '4',
      title: 'Workshop',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '16:00',
      description: 'Technical workshop',
      location: 'Training Room',
      category: 'training',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 20,
    },
  ];
  const nonOverlappingEvents: Event[] = [
    {
      id: '5',
      title: 'Morning Standup',
      date: '2024-07-01',
      startTime: '13:00',
      endTime: '14:00',
      description: 'Daily standup meeting',
      location: 'Scrum Room',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '6',
      title: 'Client Call',
      date: '2024-07-01',
      startTime: '16:00',
      endTime: '17:00',
      description: 'Follow-up with client',
      location: 'Phone Booth',
      category: 'client',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '7',
      title: 'Planning Session',
      date: '2024-07-02',
      startTime: '14:30',
      endTime: '15:30',
      description: 'Monthly planning',
      location: 'Meeting Room B',
      category: 'planning',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const events = [...overlappingEvents, ...nonOverlappingEvents];

    const result = findOverlappingEvents(newEvent, events);
    expect(result).not.toContain(nonOverlappingEvents);
    expect(result).toEqual(overlappingEvents);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const result = findOverlappingEvents(newEvent, nonOverlappingEvents);
    expect(result).toEqual([]);
  });
});
