import { Box, Flex, VStack } from '@chakra-ui/react';

import EventForm from '@/features/event-form/ui/EventForm.tsx';
import EventNotification from '@/features/notification/ui/EventNotification.tsx';
import EventSearch from '@/features/search/ui/EventSearch.tsx';
import { useEventManager } from '@/pages/event-manager/model/useEventManager.ts';
import EventCalendar from '@/widgets/event-calendar/ui/EventCalendar.tsx';
import EventCardList from '@/widgets/event-card-list/EventCardList.tsx';

function EventManager() {
  const { isLoading } = useEventManager();

  if (isLoading) {
    return <div data-testid="loading"></div>;
  }

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <EventForm />
        <EventCalendar />
        <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
          <EventSearch />
          <EventCardList />
        </VStack>
      </Flex>

      <EventNotification />
    </Box>
  );
}

export default EventManager;
