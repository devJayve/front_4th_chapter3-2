import { Event } from '../types.ts';

export interface GetFilteredEventsParams {
  events: Event[];
  searchTerm?: string;
  currentDate: Date;
  view: 'week' | 'month';
}

export interface CreateNotificationMessageParams {
  event: Event;
  now: Date;
}
