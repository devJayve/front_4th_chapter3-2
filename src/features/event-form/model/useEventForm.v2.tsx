import { useToast } from '@chakra-ui/react';
import { ChangeEvent, useEffect, useState } from 'react';

import { RepeatEndType, RepeatInfo } from '@/app/types/RepeatInfo.ts';
import { useDialogStore } from '@/entities/dialog/store/useDialogStore.ts';
import { useEventOperations } from '@/entities/event/model/useEventOperations.v2.ts';
import useEventStore from '@/entities/event/store/useEventStore.ts';
import OverlapDialog from '@/features/dialog/OverlapDialog.tsx';
import { Event, EventForm } from '@/types';
import { findOverlappingEvents } from '@/utils/eventOverlap.ts';
import { getTimeErrorMessage } from '@/utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

const initialEventForm: EventForm = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: {
    type: 'none',
    interval: 1,
  },
  notificationTime: 10,
};

const initialTimeError: TimeErrorRecord = {
  startTimeError: null,
  endTimeError: null,
};

export const useEventForm = () => {
  const { events, editingEvent, setEditingEvent } = useEventStore();
  const [isEditing, setIsEditing] = useState<boolean>(editingEvent !== null);
  const [eventForm, setEventForm] = useState<EventForm>(initialEventForm);
  const { createEvent, updateEvent, createEventList } = useEventOperations();
  const [{ startTimeError, endTimeError }, setTimeError] =
    useState<TimeErrorRecord>(initialTimeError);
  const toast = useToast();
  const { open } = useDialogStore();

  useEffect(() => {
    if (editingEvent) {
      setIsEditing(true);
      setEventForm(editingEvent);
    } else {
      setIsEditing(false);
      setEventForm(initialEventForm);
    }
  }, [editingEvent]);

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setEventForm((prevForm) => ({
      ...prevForm,
      startTime: newStartTime,
    }));
    setTimeError(getTimeErrorMessage(newStartTime, eventForm.endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEventForm((prevForm) => ({
      ...prevForm,
      endTime: newEndTime,
    }));
    setTimeError(getTimeErrorMessage(eventForm.startTime, newEndTime));
  };

  const resetForm = () => {
    setEventForm(initialEventForm);
  };

  const updateRepeatInfo = (repeatInfoData: Partial<RepeatInfo>) => {
    setEventForm((prev) => ({
      ...prev,
      repeat: {
        ...prev.repeat,
        ...repeatInfoData,
      },
    }));
  };

  const updateEventForm = (newEventData: Partial<EventForm>) => {
    setEventForm((prev) => ({
      ...prev,
      ...newEventData,
    }));
  };

  const validateEventForm = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const submitEventForm = async () => {
    if (!validateEventForm()) return;

    const overlapping = findOverlappingEvents({ ...eventForm, id: editingEvent?.id }, events);

    if (overlapping.length) {
      open(<OverlapDialog overlappingEvents={overlapping} onConfirm={uploadEvent} />);
      return;
    }

    await uploadEvent();
  };

  const uploadEvent = async () => {
    if (isEditing && editingEvent?.id) {
      const event: Event = { ...eventForm, id: editingEvent?.id };
      await updateEvent(event);
      setEditingEvent(null);
    } else {
      if (eventForm.repeat.type === 'none') {
        await createEvent(eventForm);
      } else {
        await createEventList(eventForm);
      }
    }
    resetForm();
  };

  return {
    isEditing,
    eventForm,
    updateRepeatInfo,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    updateEventForm,
    submitEventForm,
  };
};
