export const updateEventList = async (events: Partial<Event>[]) => {
  return await fetch('/api/events-list', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });
};
