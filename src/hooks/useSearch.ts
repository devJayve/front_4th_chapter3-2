import { useMemo, useState } from 'react';

import { Event } from '../types';
import { getFilteredEvents } from '../utils/eventUtils';

interface UseSearchProps {
  events: Event[];
  currentDate: Date;
  view: 'week' | 'month';
}

export const useSearch = ({ events, currentDate, view }: UseSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return getFilteredEvents({ events, searchTerm, currentDate, view });
  }, [events, searchTerm, currentDate, view]);

  return {
    searchTerm,
    setSearchTerm,
    filteredEvents,
  };
};
