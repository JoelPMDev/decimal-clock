import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/app/App';
import { PREFERENCE_KEY } from '../../src/platform/persistence';

const wakeLockRequest = vi.fn();

beforeEach(() => {
	localStorage.clear();
	wakeLockRequest.mockReset();
	Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: wakeLockRequest } });
});

describe('App', () => {
	it('renders semantic clock labels and controls', () => {
		render(<App />);
		expect(screen.getByText('DECIMAL TIME')).toBeInTheDocument();
		expect(screen.getByText('STANDARD TIME')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument();
	});

	it('keeps the settings drawer to its timezone search input', () => {
		render(<App />);
		fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
		const search = screen.getByRole('textbox', { name: 'Search timezones' });
		fireEvent.change(search, { target: { value: 'Tokyo' } });
		expect(search).toHaveValue('Tokyo');
		expect(screen.queryByRole('listbox', { name: 'Named timezones' })).not.toBeInTheDocument();
	});

	it('shows the decimal time conversion tooltip', () => {
		render(<App />);
		const helpButton = screen.getByRole('button', { name: 'Show decimal time conversion' });
		fireEvent.click(helpButton);
		expect(screen.getByRole('tooltip')).toHaveTextContent('1 decimal hour = 2 hours 24 minutes');
		expect(screen.getByRole('tooltip')).toHaveTextContent('1 decimal minute = 1 minute 26 seconds');
	});

	it('enters Always On presentation, requests a wake lock, and reveals controls on double tap', async () => {
		let releaseHandler: (() => void) | undefined;
		const sentinel = { released: false, release: vi.fn().mockResolvedValue(undefined), addEventListener: vi.fn((_type: 'release', handler: () => void) => { releaseHandler = handler; }) };
		wakeLockRequest.mockResolvedValue(sentinel);
		render(<App />);
		fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
		fireEvent.click(screen.getByRole('switch', { name: 'Always On Mode' }));
		await waitFor(() => expect(wakeLockRequest).toHaveBeenCalledWith('screen'));
		expect(screen.getByText('Always On Mode Enabled')).toBeInTheDocument();
		expect(screen.queryByText('Metric Clock')).not.toBeInTheDocument();
		expect(screen.queryByText('STANDARD TIME')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Open settings' })).not.toBeInTheDocument();
		releaseHandler?.();
		fireEvent.focus(window);
		await waitFor(() => expect(wakeLockRequest).toHaveBeenCalledTimes(2));
		fireEvent.doubleClick(screen.getByRole('main', { name: 'Always On decimal clock' }));
		expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
		expect(screen.getByRole('switch', { name: 'Always On Mode' })).toBeChecked();
	});

	it('restores Always On presentation and supports keyboard control reveal', () => {
		localStorage.setItem(PREFERENCE_KEY, JSON.stringify({ version: 1, mode: 'automatic', alwaysOn: true }));
		render(<App />);
		const clock = screen.getByRole('main', { name: 'Always On decimal clock' });
		clock.focus();
		fireEvent.keyDown(clock, { key: 'Enter' });
		expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument();
	});
});