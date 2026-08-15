export interface TimeSource { now(): Date }
export const browserTimeSource: TimeSource = { now: () => new Date() };