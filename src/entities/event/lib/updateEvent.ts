import { Event } from '@/types';

export const updateEvent = async (eventData: Event) => {
  const response = await fetch(`/api/events/${eventData.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  return (await response.json()) as Event;
};
