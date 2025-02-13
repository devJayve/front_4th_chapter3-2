import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const toastMock = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastMock,
  };
});

describe('useEventOperations', () => {
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

  beforeEach(() => {
    toastMock.mockClear();
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation(mockEvents);

    const newEvent: EventForm = {
      title: '새로운 이벤트',
      description: '새로운 이벤트 설명',
      location: '회의실 A',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useEventOperations({ editing: false }));

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    console.log(result.current.events);
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events).toContainEqual(expect.objectContaining(newEvent));
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating(mockEvents);

    const { result, rerender } = renderHook(({ editing }) => useEventOperations({ editing }), {
      initialProps: {
        editing: false,
      },
    });

    await act(async () => {
      await result.current.fetchEvents();
    });

    const event = result.current.events[0];
    expect(event).toEqual(mockEvents[0]);

    rerender({ editing: true });

    const updatedEvent: Event = {
      ...event,
      title: '수정된 이벤트',
      endTime: '11:00',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(result.current.events[0].title).toBe('수정된 이벤트');
    expect(result.current.events[0].endTime).toBe('11:00');
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion(mockEvents);

    const { result } = renderHook(() => useEventOperations({ editing: false }));

    await act(async () => {
      await result.current.fetchEvents();
    });

    const event = result.current.events[0];
    expect(event).toEqual(mockEvents[0]);

    await act(async () => {
      await result.current.deleteEvent(event.id);
    });

    expect(result.current.events).toHaveLength(0);
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    const { result } = renderHook(() => useEventOperations({ editing: false }));

    server.use(
      http.get('api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerUpdating(mockEvents);

    const { result } = renderHook(() => useEventOperations({ editing: true }));

    const nonExistingEvent: Event = {
      id: '3',
      title: '존재하지 않는 이벤트',
      description: '존재하지 않는 이벤트 설명',
      location: '회의실 A',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(nonExistingEvent);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
