import { describe, expect, it } from 'vitest';
import { decimalTime } from '../../src/domain/decimalTime';
import type { DecimalSeparator } from '../../src/domain/types';

const day = 86_400_000;
describe('decimalTime', () => {
  it.each([[0, '0:00:00'], [6, '2:50:00'], [12, '5:00:00'], [18, '7:50:00'], [24, '0:00:00']])('converts %s hours', (hours, expected) => {
    expect(decimalTime(hours * 3_600_000, day).label).toBe(expected);
  });
  it.each<[DecimalSeparator, string]>([[':', '5:00:00'], ['.', '5.00.00'], ['#', '5#00#00'], ['/', '5/00/00']])('formats decimal time with a %s separator', (separator, expected) => {
    expect(decimalTime(12 * 3_600_000, day, separator).label).toBe(expected);
  });
  it('rounds one total tick value and carries', () => {
    const result = decimalTime(8_639_999, day);
    expect(result.displayHour).toBeLessThanOrEqual(9);
    expect(result.displayMinute).toBeLessThan(100);
    expect(result.displaySecond).toBeLessThan(100);
  });
  it('clamps a near-end value that rounds past the final decimal second', () => {
    const result = decimalTime(day * 0.999996, day);
    expect(result.totalDecimalTicks).toBeLessThan(100_000);
    expect(result.label).toBe('9:99:99');
    expect(result.displayHour).toBeLessThanOrEqual(9);
  });
  it('keeps the display in range until the exact end of day', () => {
    const beforeEnd = decimalTime(day - 1, day);
    const end = decimalTime(day, day);
    expect(beforeEnd.label).not.toBe('10:00:00');
    expect(beforeEnd.displayHour).toBeGreaterThanOrEqual(0);
    expect(beforeEnd.displayHour).toBeLessThanOrEqual(9);
    expect(beforeEnd.displayMinute).toBeGreaterThanOrEqual(0);
    expect(beforeEnd.displayMinute).toBeLessThanOrEqual(99);
    expect(beforeEnd.displaySecond).toBeGreaterThanOrEqual(0);
    expect(beforeEnd.displaySecond).toBeLessThanOrEqual(99);
    expect(end.label).toBe('0:00:00');
  });
  it('rejects invalid ranges', () => { expect(() => decimalTime(-1, day)).toThrow(); expect(() => decimalTime(day + 1, day)).toThrow(); });
});