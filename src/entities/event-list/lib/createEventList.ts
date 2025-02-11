import { EventForm } from '@/types';

export const createEventList = async (events: EventForm[]) => {
  return await fetch('/api/events-list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });
};
