import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Tooltip,
  VStack,
} from '@chakra-ui/react';

import { useEventForm } from '@/features/event-form/model/useEventForm.v2.tsx';
import RepeatSetting from '@/features/event-form/ui/RepeatSetting.tsx';
import { getTimeErrorMessage } from '@/utils/timeValidation.ts';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function EventForm() {
  const {
    isEditing,
    eventForm,
    updateRepeatInfo,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    updateEventForm,
    submitEventForm,
  } = useEventForm();

  return (
    <>
      <VStack data-testid="event-form" w="400px" spacing={5} align="stretch">
        <Heading>{isEditing ? '일정 수정' : '일정 추가'}</Heading>

        <FormControl>
          <FormLabel>제목</FormLabel>
          <Input
            value={eventForm.title || ''}
            onChange={(e) => updateEventForm({ title: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>날짜</FormLabel>
          <Input
            type="date"
            value={eventForm.date || ''}
            onChange={(e) => updateEventForm({ date: e.target.value })}
          />
        </FormControl>

        <HStack width="100%">
          <FormControl>
            <FormLabel>시작 시간</FormLabel>
            <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
              <Input
                type="time"
                value={eventForm.startTime || ''}
                onChange={handleStartTimeChange}
                onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
                isInvalid={!!startTimeError}
              />
            </Tooltip>
          </FormControl>
          <FormControl>
            <FormLabel>종료 시간</FormLabel>
            <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
              <Input
                type="time"
                value={eventForm.endTime || ''}
                onChange={handleEndTimeChange}
                onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
                isInvalid={!!endTimeError}
              />
            </Tooltip>
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>설명</FormLabel>
          <Input
            value={eventForm.description || ''}
            onChange={(e) => updateEventForm({ description: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>위치</FormLabel>
          <Input
            value={eventForm.location || ''}
            onChange={(e) => updateEventForm({ location: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>카테고리</FormLabel>
          <Select
            value={eventForm.category || ''}
            onChange={(e) => updateEventForm({ category: e.target.value })}
          >
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>알림 설정</FormLabel>
          <Select
            value={eventForm.notificationTime}
            onChange={(e) => updateEventForm({ notificationTime: Number(e.target.value) })}
          >
            {notificationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <RepeatSetting repeatInfo={eventForm.repeat} updateRepeatInfo={updateRepeatInfo} />
        <Button
          data-testid="event-submit-button"
          onClick={() => submitEventForm()}
          colorScheme="blue"
        >
          {isEditing ? '일정 수정' : '일정 추가'}
        </Button>
      </VStack>
    </>
  );
}

export default EventForm;
