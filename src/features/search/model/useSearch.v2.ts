import { useEffect, useState } from 'react';

import useCalendarStore from '@/entities/calendar/store/useCalendarStore.ts';
import useEventStore from '@/entities/event/store/useEventStore.ts';
import { getFilteredEvents, sortEventsByDate } from '@/utils/eventUtils';

export const useSearch = () => {
  const { currentDate, view } = useCalendarStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { events, filteredEvents, setFilteredEvents } = useEventStore();

  useEffect(() => {
    const filteredEvents = getFilteredEvents({ events, searchTerm, currentDate, view });
    const sortedEvents = sortEventsByDate(filteredEvents);
    setFilteredEvents(sortedEvents);
  }, [searchTerm, currentDate, view, events, setFilteredEvents]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
