import { describe, expect, it } from 'vitest';
describe('browser contracts', () => {
	it('exposes the capabilities used by the app', () => {
		expect(typeof Intl.DateTimeFormat).toBe('function');
		expect(typeof localStorage).toBe('object');
		expect(typeof window.matchMedia === 'function' || typeof window.matchMedia === 'undefined').toBe(true);
		expect(navigator).toBeDefined();
	});

	it('supports the timezone and install capability boundaries', () => {
		expect(Intl.DateTimeFormat.supportedLocalesOf(['en-US'])).toHaveLength(1);
		expect(typeof window.addEventListener).toBe('function');
		expect(typeof window.dispatchEvent).toBe('function');
		expect(typeof fetch).toBe('function');
	});
});