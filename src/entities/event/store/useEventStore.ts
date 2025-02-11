import { create } from 'zustand';

import { Event } from '@/types.ts';

interface EventStore {
  events: Event[];
  editingEvent: Event | null;
  filteredEvents: Event[];
  notifiedEvents: string[];
  setEvents: (events: Event[]) => void;
  setEditingEvent: (event: Event | null) => void;
  setFilteredEvents: (events: Event[]) => void;
  setNotifiedEvents: (events: string[]) => void;
}

const useEventStore = create<EventStore>((set) => ({
  events: [],
  editingEvent: null,
  filteredEvents: [],
  notifiedEvents: [],
  setEvents: (events) => set({ events }),
  setEditingEvent: (editingEvent) => set({ editingEvent }),
  setFilteredEvents: (filteredEvents) => set({ filteredEvents }),
  setNotifiedEvents: (notifiedEvents) => set({ notifiedEvents }),
}));

export default useEventStore;
