import { http, HttpResponse } from 'msw';

import { Event, EventForm } from '../types';
import { events as initialEvents } from './response/events.json' assert { type: 'json' };

let events: Event[] = initialEvents as Event[];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  // 이벤트 리스트 조회
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  // 이벤트 추가
  http.post('/api/events', async ({ request }) => {
    const eventForm = (await request.json()) as EventForm;
    const newEvent: Event = {
      id: crypto.randomUUID(),
      ...eventForm,
    };

    events = [...events, newEvent];

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  // 이벤트 수정
  http.put('/api/events/:id', async ({ params, request }) => {
    const id = params.id;
    const updateData = (await request.json()) as Partial<EventForm>;
    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedEvent: Event = {
      ...events[eventIndex],
      ...updateData,
    };

    events = events.map((event) => (event.id === id ? updatedEvent : event));

    return HttpResponse.json(updatedEvent);
  }),

  // 이벤트 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const id = params.id;

    events = events.filter((event) => event.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),
];
