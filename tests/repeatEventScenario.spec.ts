import { readFile, writeFile } from 'fs/promises';
import * as path from 'path';

import { test, expect, type Page } from '@playwright/test';

import { Event } from '../src/types';

const mockEvent: Event = {
  id: '100',
  title: '주간 팀 회의',
  description: '주간 업무 보고 및 계획 수립',
  location: '회의실 A',
  category: '업무',
  date: '2025-02-14',
  startTime: '10:00',
  endTime: '11:00',
  repeat: { type: 'weekly', interval: 1, endType: 'endless' },
  notificationTime: 10,
};

async function fillEventForm(page, event: Event) {
  await page.getByLabel('제목').fill(event.title);
  await page.getByLabel('날짜').fill(event.date);
  await page.getByLabel('시작 시간').fill(event.startTime);
  await page.getByLabel('종료 시간').fill(event.endTime);
  await page.getByLabel('설명').fill(event.description);
  await page.getByLabel('위치').fill(event.location);
  await page.getByLabel('카테고리').selectOption(event.category);
  await page.locator('span').first().click();
  await page.getByLabel('반복 유형').selectOption(event.repeat.type);
  await page.getByLabel('반복 간격').fill(event.repeat.interval.toString());
}

async function clearEventJson() {
  try {
    const srcPath = path.join(process.cwd(), 'src', '__mocks__', 'response', 'events.json');
    const destPath = path.join(process.cwd(), 'src', '__mocks__', 'response', 'realEvents.json');

    // events.json 읽기
    const content = await readFile(srcPath, 'utf-8');

    await writeFile(destPath, content);
  } catch (error) {
    console.error('Failed to clear events JSON:', error);
    throw error;
  }
}

test.describe.serial('반복 일정 시나리오', () => {
  test.beforeEach(async ({ page }) => {
    await clearEventJson();
    await page.goto('http://localhost:5173');
    await page.reload();
  });
  test('새로운 반복 일정을 추가하였을 때 캘린더에 해당 반복 일정이 모두 표시된다.', async ({
    page,
  }) => {
    await clearEventJson();
    await fillEventForm(page, mockEvent);
    await page.getByTestId('event-submit-button').click();

    await expect(async () => {
      const events = await page.locator(`text=${mockEvent.title}`).all();
      expect(events.length).toBe(4);
    }).toPass({ timeout: 5000 });
  });

  test('첫 번째 일정에 대해 종료 시간을 변경하였을 때 단일 일정만 변경된다.', async ({ page }) => {
    await clearEventJson();
    await fillEventForm(page, mockEvent);
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await eventList.getByRole('button', { name: 'Edit event' }).first().click();

    await page.getByLabel('종료 시간').clear();
    await page.getByLabel('종료 시간').fill('13:00');
    await page.locator('span').first().click();

    await page.getByTestId('event-submit-button').click();

    await expect(async () => {
      const updatedEvent = eventList
        .locator('div')
        .filter({ has: page.locator(':text("13:00")') })
        .first();

      await expect(updatedEvent).not.toContainText('반복: 1주마다');
    }).toPass({ timeout: 5000 });
  });

  test('첫번째 일정에 대해 삭제하였을 때 단일 일정만 삭제된다.', async ({ page }) => {
    await clearEventJson();
    await fillEventForm(page, mockEvent);
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');

    await expect(async () => {
      const events = await eventList
        .locator('div')
        .filter({ has: page.locator(`:text("${mockEvent.title}")`) })
        .all();
      expect(events.length).toBe(8);
    }).toPass({ timeout: 5000 });

    await eventList.getByRole('button', { name: 'Delete event' }).first().click();

    await expect(async () => {
      const events = await eventList
        .locator('div')
        .filter({ has: page.locator(`:text("${mockEvent.title}")`) })
        .all();
      expect(events.length).toBe(4);
    }).toPass({ timeout: 5000 });
  });
});
