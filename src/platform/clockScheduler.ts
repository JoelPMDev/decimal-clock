import type { TimeSource } from './timeSource';
export function createClockScheduler(source: TimeSource, publish: (instant: Date) => void) {
  let frame = 0; let running = false; let last = 0;
  const tick = (timestamp: number) => { if (!running) return; if (timestamp - last >= 100 || last === 0) { last = timestamp; publish(source.now()); } frame = requestAnimationFrame(tick); };
  return { start() { if (!running) { running = true; last = 0; frame = requestAnimationFrame(tick); } }, stop() { running = false; cancelAnimationFrame(frame); }, isRunning: () => running };
}