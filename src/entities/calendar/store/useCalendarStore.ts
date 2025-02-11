import { create } from 'zustand';

interface CalendarStore {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
}

const useCalendarStore = create<CalendarStore>((set) => ({
  view: 'month',
  setView: (view) => set({ view }),
  currentDate: new Date(),
}));

export default useCalendarStore;
