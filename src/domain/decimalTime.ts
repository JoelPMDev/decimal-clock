import type { DecimalPosition, DecimalSeparator } from './types';
export function decimalTime(elapsedMilliseconds: number, durationMilliseconds: number, separator: DecimalSeparator = ':'): DecimalPosition & { label: string } {
  if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0 || elapsedMilliseconds > durationMilliseconds || durationMilliseconds <= 0) throw new RangeError('Elapsed time outside local day');
  const proportion = elapsedMilliseconds / durationMilliseconds;
  const totalDecimalTicks = proportion * 100_000;
  const rounded = elapsedMilliseconds === durationMilliseconds ? 0 : Math.min(99_999, Math.round(totalDecimalTicks));
  const displayHour = Math.floor(rounded / 10_000);
  const displayMinute = Math.floor((rounded % 10_000) / 100);
  const displaySecond = rounded % 100;
  return { elapsedMilliseconds, proportion, totalDecimalTicks, displayHour, displayMinute, displaySecond, label: `${displayHour}${separator}${String(displayMinute).padStart(2, '0')}${separator}${String(displaySecond).padStart(2, '0')}` };
}