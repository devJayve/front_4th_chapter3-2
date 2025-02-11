import { Heading, VStack } from '@chakra-ui/react';

import CalendarNavigation from '../../../features/calendar/ui/CalendarNavigation.tsx';
import MonthCalendar from '../../../features/calendar/ui/MonthCalendar.tsx';
import WeekCalendar from '../../../features/calendar/ui/WeekCalendar.tsx';

import useEventStore from '@/entities/event/store/useEventStore.ts';
import { useCalendarView } from '@/widgets/event-calendar/model/useCalendarView.ts';

function EventCalendar() {
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { filteredEvents, notifiedEvents } = useEventStore();

  return (
    <VStack flex={1} spacing={5} align="stretch">
      <Heading>일정 보기</Heading>
      <CalendarNavigation view={view} onNavigate={navigate} onViewChange={setView} />
      {view === 'week' && (
        <WeekCalendar
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
      {view === 'month' && (
        <MonthCalendar
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </VStack>
  );
}

export default EventCalendar;
