import { EventForm } from '@/types';

export const createEvent = async (eventFormData: EventForm) => {
  return await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventFormData),
  });
};
