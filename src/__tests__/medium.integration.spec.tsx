import { ChakraProvider } from '@chakra-ui/react';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, expect } from 'vitest';

import { Event, EventForm } from '../types';
import { formatMinuteTime } from '../utils/dateUtils.ts';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '@/__mocks__/handlersUtils.ts';
import { DialogProvider } from '@/app/provider/DialogProvider.tsx';
import { RepeatEndType } from '@/app/types/RepeatInfo.ts';
import EventManager from '@/pages/event-manager/ui/EventManager.tsx';

const createEvent = async (event: EventForm, user?: UserEvent) => {
  user ??= userEvent.setup();
  const eventForm = within(screen.getByTestId('event-form'));

  await user.type(eventForm.getByLabelText(/제목/i), event.title);
  await user.type(eventForm.getByLabelText(/날짜/i), event.date);
  await user.type(eventForm.getByLabelText(/시작 시간/i), event.startTime);
  await user.type(eventForm.getByLabelText(/종료 시간/i), event.endTime);
  await user.type(eventForm.getByLabelText(/설명/i), event.description);
  await user.type(eventForm.getByLabelText(/위치/i), event.location);
  await user.selectOptions(eventForm.getByLabelText(/카테고리/i), event.category);
  await user.selectOptions(
    eventForm.getByLabelText(/알림 설정/i),
    `${formatMinuteTime(event.notificationTime)} 전`
  );
  if (event.repeat.type !== 'none') {
    await user.click(eventForm.getByLabelText(/반복 설정/i));
    await user.selectOptions(eventForm.getByLabelText(/반복 유형/i), event.repeat.type);
    if (event.repeat.type === 'weekly') {
      event.repeat.dayOfWeek &&
        (await user.selectOptions(eventForm.getByLabelText(/반복 요일/i), event.repeat.dayOfWeek));
    }
    await user.clear(eventForm.getByLabelText(/반복 간격/i));
    await user.type(eventForm.getByLabelText(/반복 간격/i), event.repeat.interval.toString());

    await user.selectOptions(eventForm.getByLabelText(/반복 종료/i), event.repeat.endType!);

    if (event.repeat.endType === RepeatEndType.BY_DATE) {
      await user.clear(eventForm.getByLabelText(/반복 종료 날짜/i));
      await user.type(eventForm.getByLabelText(/반복 종료 날짜/i), event.repeat.endDate!);
    }
    if (event.repeat.endType === RepeatEndType.BY_COUNT) {
      await user.clear(eventForm.getByLabelText(/반복 횟수/i));
      await user.type(eventForm.getByLabelText(/반복 횟수/i), event.repeat.endCount!.toString());
    }
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

const mockEvent: Event = {
  id: '1',
  title: '테스트 이벤트',
  date: '2025-02-14',
  startTime: '14:00',
  endTime: '15:00',
  description: '테스트 설명',
  location: '회의실 B',
  category: '개인',
  repeat: {
    type: 'none',
    interval: 1,
  },
  notificationTime: 10,
};

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const event: EventForm = {
      title: '테스트 이벤트',
      date: '2025-02-14',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명',
      location: '회의실 B',
      category: '개인',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };

    await createEvent(event);

    // 1) 일정 추가 토스트 메시지 확인
    const toastMessage = await screen.findByRole('status');
    expect(toastMessage).toBeInTheDocument();
    expect(toastMessage).toHaveTextContent('일정이 추가되었습니다');

    // 2) 이벤트 리스트 내 해당 아이템이 추가되었는지 확인
    const eventElements = screen.getAllByTestId(/event-item-/);
    expect(eventElements).toHaveLength(1);
    const eventElement = eventElements[0];
    expect(eventElement).toHaveTextContent(event.title);
    expect(eventElement).toHaveTextContent(event.date);
    expect(eventElement).toHaveTextContent(`${event.startTime} - ${event.endTime}`);
    expect(eventElement).toHaveTextContent(`${event.description}`);
    expect(eventElement).toHaveTextContent(`${event.location}`);
    expect(eventElement).toHaveTextContent(`카테고리: ${event.category}`);
    expect(eventElement).toHaveTextContent('알림: 10분 전');

    // 3) 폼 값이 초기화되었는지 확인
    expect(screen.getByLabelText(/제목/i)).toHaveValue('');
    expect(screen.getByLabelText(/설명/i)).toHaveValue('');
    expect(screen.getByLabelText(/위치/i)).toHaveValue('');
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();
    const newEvent: Event = {
      id: '2',
      title: '수정된 이벤트',
      date: '2025-02-14',
      startTime: '14:00',
      endTime: '15:00',
      description: '수정된 이벤트 설명',
      location: '회의실 C',
      category: '개인',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };

    setupMockHandlerUpdating([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    const eventCard = screen.getByTestId('event-item-1');
    const editButton = within(eventCard).getByRole('button', {
      name: 'Edit event',
    });
    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(editButton);

    const titleInput = screen.getByRole('textbox', { name: '제목' });
    const descriptionInput = screen.getByRole('textbox', { name: '설명' });
    const locationInput = screen.getByRole('textbox', { name: '위치' });

    // 수정할 이벤트가 폼에 반영되었는지 확인
    expect(titleInput.getAttribute('value')).toBe(mockEvent.title);
    expect(descriptionInput.getAttribute('value')).toBe(mockEvent.description);
    expect(locationInput.getAttribute('value')).toBe(mockEvent.location);

    // 수정할 이벤트 정보 입력을 위해 폼 초기화
    await user.clear(titleInput);
    await user.clear(descriptionInput);
    await user.clear(locationInput);

    // 수정할 이벤트 정보 입력
    await user.type(titleInput, newEvent.title);
    await user.type(descriptionInput, newEvent.description);
    await user.type(locationInput, newEvent.location);

    // 수정된 이벤트 정보 제출
    await user.click(submitButton);

    // 수정된 이벤트 토스트 확인
    const toastMessage = await screen.findByRole('status');
    expect(toastMessage).toBeInTheDocument();
    expect(toastMessage).toHaveTextContent('일정이 수정되었습니다');

    // 수정된 이벤트 정보가 리스트에 반영되었는지 확인
    expect(eventCard).toHaveTextContent(newEvent.title);
    expect(eventCard).toHaveTextContent(newEvent.description);
    expect(eventCard).toHaveTextContent(newEvent.location);
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();
    setupMockHandlerDeletion([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    const eventList = screen.getByTestId('event-list');
    const eventCard = screen.getByTestId('event-item-1');
    const deleteButton = within(eventCard).getByRole('button', {
      name: 'Delete event',
    });

    // 일정 삭제 버튼 클릭
    await user.click(deleteButton);

    // 삭제된 일정이 더 이상 조회되지 않는지 확인
    expect(eventList).toHaveTextContent('검색 결과가 없습니다.');
  });
});

describe('반복 일정 CRUD', () => {
  const repeatEvent: Event = {
    ...mockEvent,
    repeat: {
      id: '1',
      type: 'daily',
      interval: 2,
      endType: RepeatEndType.BY_DATE,
      endDate: '2025-02-24',
    },
  };

  const repeatEvents: Event[] = [
    repeatEvent,
    { ...repeatEvent, id: '2', date: '2025-02-16', repeat: { ...repeatEvent.repeat, id: '2' } },
    { ...repeatEvent, id: '3', date: '2025-02-18', repeat: { ...repeatEvent.repeat, id: '3' } },
    { ...repeatEvent, id: '4', date: '2025-02-20', repeat: { ...repeatEvent.repeat, id: '4' } },
    { ...repeatEvent, id: '5', date: '2025-02-22', repeat: { ...repeatEvent.repeat, id: '5' } },
    { ...repeatEvent, id: '6', date: '2025-02-24', repeat: { ...repeatEvent.repeat, id: '6' } },
  ];

  it('반복 일정 추가 시 모든 이벤트가 반복 일정으로 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]);
    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await act(async () => null);

    await createEvent(repeatEvent);

    expect(screen.getAllByTestId(/event-item/)).toHaveLength(6);
  });

  it('반복 일정 수정 시 단일 일정으로 변경된다.', async () => {
    const user = userEvent.setup();
    setupMockHandlerUpdating(repeatEvents);
    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await act(async () => null);

    const eventCard = screen.getByTestId('event-item-1');
    const editButton = within(eventCard).getByRole('button', {
      name: 'Edit event',
    });

    await user.click(editButton);

    await user.click(screen.getByLabelText('반복 설정'));
    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '테스트 이벤트2');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(eventCard).toHaveTextContent('테스트 이벤트2');
    expect(eventCard).not.toHaveTextContent('반복: 2일마다');
  });

  it('반복 일정 삭제 시 해당 일정만 삭제된다.', async () => {
    const user = userEvent.setup();
    setupMockHandlerDeletion(repeatEvents);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await act(async () => null);

    const eventCard = screen.getByTestId('event-item-1');

    expect(screen.getAllByTestId(/event-item/)).toHaveLength(6);

    const deleteButton = within(eventCard).getByRole('button', {
      name: 'Delete event',
    });

    await user.click(deleteButton);

    expect(screen.queryByTestId('event-item-1')).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/event-item/)).toHaveLength(5);
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime('2025-02-01');
    setupMockHandlerCreation([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const viewButton = screen.getByLabelText('view');
    await userEvent.selectOptions(viewButton, 'week');

    const weekView = screen.getByTestId('week-view');
    expect(weekView).toBeInTheDocument();
    expect(weekView).not.toHaveTextContent('테스트 이벤트');
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime('2025-02-14');
    setupMockHandlerCreation([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const viewButton = screen.getByLabelText('view');
    await userEvent.selectOptions(viewButton, 'week');

    const weekView = screen.getByTestId('week-view');
    expect(weekView).toBeInTheDocument();
    expect(weekView).toHaveTextContent('테스트 이벤트');
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const mockEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-03-14',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명',
      location: '회의실 B',
      category: '개인',
      repeat: {
        type: 'daily',
        interval: 1,
        endType: RepeatEndType.ENDLESS,
      },
      notificationTime: 10,
    };
    setupMockHandlerCreation([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const viewButton = screen.getByLabelText('view');
    await userEvent.selectOptions(viewButton, 'month');
    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();
    expect(monthView).not.toHaveTextContent('테스트 이벤트');
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-02-14',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명',
      location: '회의실 B',
      category: '개인',
      repeat: {
        type: 'daily',
        interval: 1,
        endType: RepeatEndType.ENDLESS,
      },
      notificationTime: 10,
    };

    setupMockHandlerCreation([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const viewButton = screen.getByLabelText('view');
    await userEvent.selectOptions(viewButton, 'month');
    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();
    expect(monthView).toHaveTextContent('테스트 이벤트');
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const previousButton = screen.getByRole('button', { name: 'Previous' });
    await userEvent.click(previousButton);

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();
    const mockEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-02-14',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명',
      location: '회의실 B',
      category: '개인',
      repeat: {
        type: 'daily',
        interval: 1,
        endType: RepeatEndType.ENDLESS,
      },
      notificationTime: 10,
    };
    setupMockHandlerDeletion([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: '일정 검색' });
    await user.type(searchInput, '테스트 이벤트');

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });

    await user.clear(searchInput);
    await user.type(searchInput, '테스트 이벤트2');

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-02-14',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 회의',
        location: '회의실 B',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          endType: RepeatEndType.ENDLESS,
        },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: '일정 검색' });
    await userEvent.type(searchInput, '팀 회의');

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2025-02-14',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 회의',
        location: '회의실 B',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          endType: RepeatEndType.ENDLESS,
        },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    render(
      <ChakraProvider>
        <EventManager />
      </ChakraProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/2025년 2월/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: '일정 검색' });
    await userEvent.type(searchInput, '존재하지 않는 이벤트');

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    await userEvent.clear(searchInput);

    await waitFor(() => {
      expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([mockEvent]);

    render(
      <ChakraProvider>
        <EventManager />
        <DialogProvider />
      </ChakraProvider>
    );

    await act(async () => null);

    const newEvent: EventForm = {
      ...mockEvent,
      title: '테스트 이벤트2',
    };

    await createEvent(newEvent);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime('2025-02-14T13:50');

  const mockEvent: Event = {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-02-14',
    startTime: '14:00',
    endTime: '15:00',
    description: '테스트 설명',
    location: '회의실 B',
    category: '개인',
    repeat: {
      type: 'daily',
      interval: 1,
      endType: RepeatEndType.ENDLESS,
    },
    notificationTime: 10,
  };
  setupMockHandlerCreation([mockEvent]);

  render(
    <ChakraProvider>
      <EventManager />
    </ChakraProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('event-item-1')).toBeInTheDocument();
  });

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => {
    expect(screen.getByText(/일정이 시작됩니다/)).toBeInTheDocument();
  });
});
