import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import EventForm from '@/features/event-form/ui/EventForm.tsx';

describe('EventForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('이벤트 폼 내에 모든 필드 값이 렌더링되어야 한다.', () => {
    render(
      <ChakraProvider>
        <EventForm />
      </ChakraProvider>
    );

    expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('위치')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 설정')).toBeInTheDocument();
    expect(screen.getByLabelText('알림 설정')).toBeInTheDocument();
  });

  it('필드 값 업데이트 시 정확히 입력한 내용이 필드에 포함되어야 한다.', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <EventForm />
      </ChakraProvider>
    );
    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, '미팅');

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    await user.clear(dateInput);
    await user.type(dateInput, '2025-02-14');

    const locationInput = screen.getByLabelText('위치') as HTMLInputElement;
    await user.clear(locationInput);
    await user.type(locationInput, '회의실 A');

    const descriptionInput = screen.getByLabelText('설명') as HTMLInputElement;
    await user.clear(descriptionInput);
    await user.type(descriptionInput, '팀 미팅');

    const categorySelect = screen.getByLabelText('카테고리') as HTMLSelectElement;
    await user.selectOptions(categorySelect, '업무');

    const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '09:00');

    const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '10:00');

    expect(titleInput).toHaveValue('미팅');
    expect(dateInput).toHaveValue('2025-02-14');
    expect(locationInput).toHaveValue('회의실 A');
    expect(descriptionInput).toHaveValue('팀 미팅');
    expect(categorySelect).toHaveValue('업무');
    expect(startTimeInput).toHaveValue('09:00');
    expect(endTimeInput).toHaveValue('10:00');
  });

  it('종료 시간이 시작 시간보다 같거나 이른 경우 경고문을 보여준다.', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <EventForm />
      </ChakraProvider>
    );

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.type(startTimeInput, '10:00');

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.type(endTimeInput, '09:00');

    fireEvent.blur(endTimeInput);
    fireEvent.mouseOver(endTimeInput);

    await waitFor(() => {
      const tooltips = screen.getAllByRole('tooltip');
      expect(tooltips[0]).toHaveTextContent('시작 시간은 종료 시간보다 빨라야 합니다');
      expect(tooltips[1]).toHaveTextContent('종료 시간은 시작 시간보다 늦어야 합니다');
    });
  });

  it('반복 설정이 체크되었을 때만 반복 설정 폼이 보여진다.', async () => {
    const user = userEvent.setup();

    render(
      <ChakraProvider>
        <EventForm />
      </ChakraProvider>
    );

    const checkbox = screen.getByRole('checkbox', { name: /반복 일정/ });
    expect(checkbox).toBeChecked();

    const eventForm = screen.getByTestId('event-form');
    expect(eventForm).toContainElement(screen.getByLabelText('반복 유형'));
    expect(eventForm).toContainElement(screen.getByLabelText('반복 간격'));
    expect(eventForm).toContainElement(screen.getByLabelText('반복 종료일'));

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();
  });

  it('필수 내용 누락 시 경고문을 보여주어야 한다.', async () => {
    const user = userEvent.setup({ delay: null });

    render(
      <ChakraProvider>
        <EventForm />
      </ChakraProvider>
    );

    const submitButton = screen.getByTestId('event-submit-button');

    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('필수 정보를 모두 입력해주세요.')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByText('필수 정보를 모두 입력해주세요.')).not.toBeInTheDocument();
    });

    const eventForm = screen.getByTestId('event-form');
    await user.type(within(eventForm).getByLabelText('제목'), '미팅');
    await user.type(within(eventForm).getByLabelText('설명'), '미팅');
    await user.type(within(eventForm).getByLabelText('위치'), '미팅');
    await user.type(within(eventForm).getByLabelText('날짜'), '2025-02-14');
    await user.type(within(eventForm).getByLabelText('시작 시간'), '02:00');
    await user.type(within(eventForm).getByLabelText('종료 시간'), '03:00');
    await user.type(within(eventForm).getByLabelText('카테고리'), '개인');
    await user.click(submitButton);

    expect(screen.queryByText('필수 정보를 모두 입력해주세요.')).not.toBeInTheDocument();
  });
});
