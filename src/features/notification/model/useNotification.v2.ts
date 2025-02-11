import { useInterval } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import useEventStore from '@/entities/event/store/useEventStore.ts';
import { createNotificationMessage, getUpcomingEvents } from '@/utils/notificationUtils';

export const useNotifications = () => {
  const { events } = useEventStore();
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const { notifiedEvents, setNotifiedEvents } = useEventStore();

  const checkUpcomingEvents = useCallback(() => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    setNotifications((prev) => [
      ...prev,
      ...upcomingEvents.map((event) => ({
        id: event.id,
        message: createNotificationMessage({ event, now }),
      })),
    ]);

    setNotifiedEvents([...notifiedEvents, ...upcomingEvents.map(({ id }) => id)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, notifiedEvents]);

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useInterval(checkUpcomingEvents, 1000); // 1초마다 체크

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
