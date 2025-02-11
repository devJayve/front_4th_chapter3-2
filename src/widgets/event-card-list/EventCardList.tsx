import { BellIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, HStack, IconButton, Text, VStack } from '@chakra-ui/react';

import { RepeatEndType } from '@/app/types/RepeatInfo.ts';
import { notificationOptions } from '@/entities/event/config';
import useEventStore from '@/entities/event/store/useEventStore.ts';
import { useEventCardList } from '@/widgets/event-card-list/model/useEventCardList.ts';

function EventCardList() {
  const { filteredEvents, notifiedEvents } = useEventStore();
  const { handleEventDelete, handleEventEdit } = useEventCardList();

  return filteredEvents.length === 0 ? (
    <Text>검색 결과가 없습니다.</Text>
  ) : (
    filteredEvents.map((event) => (
      <Box
        data-testid={`event-item-${event.id}`}
        key={event.id}
        borderWidth={1}
        borderRadius="lg"
        p={3}
        width="100%"
      >
        <HStack justifyContent="space-between">
          <VStack align="start">
            <HStack>
              {notifiedEvents.includes(event.id) && <BellIcon color="red.500" />}
              <Text
                fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
              >
                {event.title}
              </Text>
            </HStack>
            <Text>{event.date}</Text>
            <Text>
              {event.startTime} - {event.endTime}
            </Text>
            <Text>{event.description}</Text>
            <Text>{event.location}</Text>
            <Text>카테고리: {event.category}</Text>
            {event.repeat.type !== 'none' && (
              <Text>
                반복: {event.repeat.interval}
                {event.repeat.type === 'daily' && '일'}
                {event.repeat.type === 'weekly' && '주'}
                {event.repeat.type === 'monthly' && '월'}
                {event.repeat.type === 'yearly' && '년'}
                마다
                {event.repeat.endType === RepeatEndType.BY_DATE &&
                  event.repeat.endDate &&
                  ` (종료: ${event.repeat.endDate})`}
              </Text>
            )}
            <Text>
              알림:{' '}
              {notificationOptions.find((option) => option.value === event.notificationTime)?.label}
            </Text>
          </VStack>
          <HStack>
            <IconButton
              aria-label="Edit event"
              icon={<EditIcon />}
              onClick={() => handleEventEdit(event)}
            />
            <IconButton
              aria-label="Delete event"
              icon={<DeleteIcon />}
              onClick={() => handleEventDelete(event.id)}
            />
          </HStack>
        </HStack>
      </Box>
    ))
  );
}

export default EventCardList;
