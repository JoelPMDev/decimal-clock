import { decimalTime } from './decimalTime';
import { getLocalDayWindow } from './localDay';
import type { DecimalSeparator, DisplaySnapshot, LocalDayWindow } from './types';
export function friendlyTimeZone(timeZone: string): string { return new Intl.DateTimeFormat('en', { timeZone, timeZoneName: 'long' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value ?? timeZone.replaceAll('_', ' '); }
export function buildDisplaySnapshot(instant: Date, timeZone: string, cachedWindow?: LocalDayWindow, separator: DecimalSeparator = ':'): DisplaySnapshot {
  const window = cachedWindow && cachedWindow.timeZone === timeZone && instant.getTime() >= cachedWindow.start.getTime() && instant.getTime() < cachedWindow.end.getTime()
    ? cachedWindow
    : getLocalDayWindow(instant, timeZone);
  const decimal = decimalTime(Math.max(0, instant.getTime() - window.start.getTime()), window.durationMilliseconds, separator);
  const conventionalTimeLabel = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(instant);
  return { instant, timeZone, timeZoneLabel: friendlyTimeZone(timeZone), localDate: window.localDate, conventionalTimeLabel, decimalTimeLabel: decimal.label, dayStart: window.start, dayEnd: window.end, decimal };
}