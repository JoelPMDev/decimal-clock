import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstallGuidanceDialog } from '../../src/components/InstallGuidanceDialog';
describe('InstallGuidanceDialog', () => { it('presents ordered iPhone steps', () => { render(<InstallGuidanceDialog open onClose={() => undefined}/>); expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(screen.getByText('Share')).toBeInTheDocument(); expect(screen.getByText('Add to Home Screen')).toBeInTheDocument(); expect(screen.getByText('Add', { exact: true })).toBeInTheDocument(); }); });