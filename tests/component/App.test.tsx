import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../../src/app/App';
describe('App', () => {
	it('renders semantic clock labels and controls', () => {
		render(<App />);
		expect(screen.getByText('DECIMAL TIME')).toBeInTheDocument();
		expect(screen.getByText('LOCAL TIME')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Open settings' })).toBeInTheDocument();
	});

	it('updates the timezone selection and retains it when the drawer reopens', async () => {
		render(<App />);
		fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
		const search = screen.getByRole('textbox', { name: 'Search timezones' });
		fireEvent.change(search, { target: { value: 'Tokyo' } });
		fireEvent.click(await screen.findByRole('option', { name: /Tokyo/ }));
		expect(screen.getByText(/Japan Standard Time/)).toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
		await waitFor(() => expect(screen.getByText(/Selected:/, { selector: 'p.current' })).toHaveTextContent('Tokyo'));
	});
});