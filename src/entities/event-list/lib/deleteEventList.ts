export const deleteEventList = async (eventIds: string[]) => {
  return await fetch('/api/events-list', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventIds }),
  });
};
