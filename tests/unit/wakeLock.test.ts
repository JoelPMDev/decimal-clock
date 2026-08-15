import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestScreenWakeLock } from '../../src/platform/wakeLock';

afterEach(() => {
	Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: undefined });
});

describe('screen wake lock', () => {
	it('requests a screen lock when supported', async () => {
		const sentinel = { released: false, release: vi.fn(), addEventListener: vi.fn() };
		const request = vi.fn().mockResolvedValue(sentinel);
		Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });
		expect(await requestScreenWakeLock()).toBe(sentinel);
		expect(request).toHaveBeenCalledWith('screen');
	});

	it('returns null when the request fails or is unavailable', async () => {
		Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: vi.fn().mockRejectedValue(new Error('denied')) } });
		expect(await requestScreenWakeLock()).toBeNull();
		Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: undefined });
		expect(await requestScreenWakeLock()).toBeNull();
	});
});