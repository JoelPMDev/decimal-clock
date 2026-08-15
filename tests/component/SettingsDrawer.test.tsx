import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsDrawer } from '../../src/components/SettingsDrawer';
describe('SettingsDrawer', () => { it('shows automatic mode and search', () => { render(<SettingsDrawer open preference={{ mode: 'automatic' }} query="" onQuery={() => undefined} onSelect={() => undefined} onAutomatic={() => undefined} onClose={() => undefined}/>); expect(screen.getByRole('complementary')).toBeInTheDocument(); expect(screen.getByLabelText('Search timezones')).toBeInTheDocument(); }); });