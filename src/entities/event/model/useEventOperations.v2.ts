import { useToast } from '@chakra-ui/react';

import { createEvent, deleteEvent, getEvents, updateEvent } from '@/entities/event/lib';
import useEventStore from '@/entities/event/store/useEventStore.ts';
import { createEventList } from '@/entities/event-list/lib/createEventList.ts';
import { generateRepeatEvents } from '@/features/event-form/lib/generateRepeatEvents.ts';
import { Event, EventForm } from '@/types';

export const useEventOperations = () => {
  const toast = useToast();
  const { setEvents } = useEventStore();

  const handleEventFetch = async () => {
    try {
      const events = await getEvents();
      setEvents(events);
    } catch (error) {
      showToast('이벤트 로딩 실패', 'error', error);
    }
  };

  const handleEventCreate = async (eventFormData: EventForm) => {
    try {
      await createEvent(eventFormData);
      await handleEventFetch();
      showToast(`일정이 추가되었습니다.`, 'success');
    } catch (error) {
      showToast('일정 추가 실패', 'error', error);
    }
  };

  const handleEventListCreate = async (eventFormData: EventForm) => {
    try {
      const eventFormList = generateRepeatEvents(eventFormData);

      await createEventList(eventFormList);
      await handleEventFetch();
      showToast(`일정이 추가되었습니다.`, 'success');
    } catch (error) {
      showToast('일정 추가 실패', 'error', error);
      throw error;
    }
  };

  const handleEventUpdate = async (eventData: Event) => {
    try {
      await updateEvent(eventData);
      await handleEventFetch();
      showToast(`일정이 수정되었습니다.`, 'success');
    } catch (error) {
      showToast('일정 저장 실패', 'error', error);
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      await handleEventFetch();
      showToast(`일정이 삭제되었습니다.`, 'info');
    } catch (error) {
      showToast('일정 삭제 실패', 'error', error);
    }
  };

  const showToast = (title: string, status: 'info' | 'error' | 'success', error?: unknown) => {
    if (status === 'error') console.error(error);
    toast({
      title,
      status,
      duration: 3000,
      isClosable: true,
    });
  };

  return {
    fetchEvents: handleEventFetch,
    createEvent: handleEventCreate,
    createEventList: handleEventListCreate,
    updateEvent: handleEventUpdate,
    deleteEvent: handleEventDelete,
  };
};
