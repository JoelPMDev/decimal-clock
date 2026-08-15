import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../../src/app/App';
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
		expect(screen.getByRole('tooltip')).toHaveTextContent('1 decimal minute = 1 minute 26.4 seconds');
	});
});