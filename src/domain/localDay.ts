import type { LocalDayWindow } from './types';

const parts = (instant: Date, timeZone: string) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(instant).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
const dateOf = (instant: Date, timeZone: string) => { const p = parts(instant, timeZone); return `${p.year}-${p.month}-${p.day}`; };
const shiftDate = (date: string, amount: number) => { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + amount); return value.toISOString().slice(0, 10); };
function midnight(date: string, timeZone: string): Date {
  const estimate = Date.parse(`${date}T00:00:00Z`);
  for (let offset = -36 * 60; offset <= 36 * 60; offset += 1) {
    const candidate = new Date(estimate + offset * 60_000);
    const p = parts(candidate, timeZone);
    if (`${p.year}-${p.month}-${p.day}` === date && p.hour === '00' && p.minute === '00' && p.second === '00') return candidate;
  }
  throw new RangeError(`Unable to resolve midnight for ${date} in ${timeZone}`);
}
export function getLocalDayWindow(instant: Date, timeZone: string): LocalDayWindow {
  if (!Number.isFinite(instant.getTime())) throw new RangeError('Invalid instant');
  const localDate = dateOf(instant, timeZone);
  let start = midnight(localDate, timeZone);
  let end = midnight(shiftDate(localDate, 1), timeZone);
  if (instant.getTime() >= end.getTime()) { start = end; end = midnight(shiftDate(localDate, 2), timeZone); }
  return { timeZone, localDate: dateOf(start, timeZone), start, end, durationMilliseconds: end.getTime() - start.getTime() };
}