import { Event } from '../types';
import { formatMinuteTime } from './dateUtils.ts';
import { CreateNotificationMessageParams } from './types.ts';

const 초 = 1000;
const 분 = 초 * 60;

function getTimeDifference(start: Date, now: Date) {
  return (start.getTime() - now.getTime()) / 분;
}

export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = getTimeDifference(eventStart, now);
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}

export function createNotificationMessage({ event, now }: CreateNotificationMessageParams) {
  const eventStart = new Date(`${event.date}T${event.startTime}`);
  const timeDiff = getTimeDifference(eventStart, now);
  return `${formatMinuteTime(timeDiff)} 후 ${event.title} 일정이 시작됩니다.`;
}
