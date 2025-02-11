export const deleteEvent = async (id: string) => {
  return await fetch(`/api/events/${id}`, { method: 'DELETE' });
};
