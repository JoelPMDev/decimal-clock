export const instant = (value: string) => new Date(value);
export const noonUtc = instant('2025-01-15T12:00:00.000Z');
export const dstSpring = instant('2024-03-10T17:00:00.000Z');
export const dstFall = instant('2024-11-03T17:00:00.000Z');
export const zones = ['UTC', 'Europe/London', 'America/New_York', 'Asia/Tokyo'] as const;