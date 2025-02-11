import { useEventOperations } from '@/entities/event/model/useEventOperations.v2.ts';
import useEventStore from '@/entities/event/store/useEventStore.ts';
import { Event } from '@/types.ts';

export const useEventCardList = () => {
  const { deleteEvent } = useEventOperations();
  const { setEditingEvent } = useEventStore();
  const handleEventEdit = (event: Event) => {
    setEditingEvent(event);
  };

  const handleEventDelete = async (id: string) => {
    await deleteEvent(id);
  };

  return {
    handleEventEdit,
    handleEventDelete,
  };
};
