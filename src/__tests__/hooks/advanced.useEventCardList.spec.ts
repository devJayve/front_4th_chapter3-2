import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { setupMockHandlerDeletion } from '@/__mocks__/handlersUtils.ts';
import useEventStore from '@/entities/event/store/useEventStore.ts';
import { Event } from '@/types';
import { useEventCardList } from '@/widgets/event-card-list/model/useEventCardList';

const toastMock = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastMock,
  };
});

describe('useEventCardList', () => {
  const mockEvent: Event = {
    id: '1',
    title: 'Test Event',
    description: 'Test Description',
    date: '2024-10-01',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Test Location',
    category: 'work',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  beforeEach(() => {
    toastMock.mockClear();
  });

  it('handleEventEdit 호출 시 editingEvent가 설정된다.', async () => {
    setupMockHandlerDeletion([mockEvent]);
    const { result } = renderHook(() => useEventCardList());
    const store = useEventStore.getState();

    result.current.handleEventEdit(mockEvent);

    expect(store.editingEvent).toBeNull();

    act(() => {
      result.current.handleEventEdit(mockEvent);
    });

    expect(useEventStore.getState().editingEvent).toEqual(mockEvent);
  });

  it('handleEventDelete 호출 시 해당 이벤트가 삭제된다.', async () => {
    setupMockHandlerDeletion([mockEvent]);
    const { result } = renderHook(() => useEventCardList());

    await act(async () => {
      await result.current.handleEventDelete(mockEvent.id);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: '일정이 삭제되었습니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });

  it('네트워크 에러 발생 시 삭제에 실패한다.', async () => {
    setupMockHandlerDeletion([mockEvent], { status: 500 });

    const { result } = renderHook(() => useEventCardList());

    await act(async () => {
      await result.current.handleEventDelete(mockEvent.id);
    });

    expect(toastMock).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
