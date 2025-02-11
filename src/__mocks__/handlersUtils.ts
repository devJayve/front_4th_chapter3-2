import { http, HttpResponse } from 'msw';

import { server } from '../setupTests.ts';
import { Event, EventForm } from '../types';

interface MockError {
  status: number;
  message?: string | null;
}

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  let events = [...initEvents];

  const handlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.post('/api/events', async ({ request }) => {
      const eventForm = (await request.json()) as EventForm;
      const newEvent: Event = {
        id: crypto.randomUUID(),
        ...eventForm,
      };

      events = [...events, newEvent];

      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];

  server.use(...handlers);
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  let events = [...initEvents];

  const handlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
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
  ];

  server.use(...handlers);
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[], error?: MockError) => {
  let events = [...initEvents];

  const handlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      if (error) return HttpResponse.error();

      const id = params.id;

      events = events.filter((event) => event.id !== id);

      return new HttpResponse(null, { status: 204 });
    }),
  ];

  server.use(...handlers);
};
