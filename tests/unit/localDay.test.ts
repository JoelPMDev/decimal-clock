import { describe, expect, it } from 'vitest';
import { getLocalDayWindow } from '../../src/domain/localDay';
import { buildDisplaySnapshot } from '../../src/domain/displaySnapshot';
import { createClockScheduler } from '../../src/platform/clockScheduler';

describe('local day', () => {
  it('resolves local midnight without adding 24 hours', () => {
    const window = getLocalDayWindow(new Date('2024-03-10T17:00:00Z'), 'America/New_York');
    expect(window.localDate).toBe('2024-03-10');
    expect(window.durationMilliseconds).toBe(23 * 3_600_000);
  });
  it('resolves a fall-back day as 25 hours', () => {
    expect(getLocalDayWindow(new Date('2024-11-03T17:00:00Z'), 'America/New_York').durationMilliseconds).toBe(25 * 3_600_000);
  });
  it('uses one instant for both labels', () => {
    const snapshot = buildDisplaySnapshot(new Date('2025-01-15T12:00:00Z'), 'UTC');
    expect(snapshot.conventionalTimeLabel).toBe('12:00:00');
    expect(snapshot.decimalTimeLabel).toBe('5:00:00');
  });
  it('does not create duplicate scheduler loops', () => {
    const callbacks: Date[] = [];
    const scheduler = createClockScheduler({ now: () => new Date(0) }, (value) => callbacks.push(value));
    scheduler.start(); scheduler.start(); expect(scheduler.isRunning()).toBe(true); scheduler.stop(); expect(callbacks).toHaveLength(0);
  });
});