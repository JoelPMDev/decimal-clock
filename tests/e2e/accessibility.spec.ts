import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('keyboard opens settings', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Open settings' }).press('Enter');
	await expect(page.getByRole('complementary')).toBeVisible();
});

test('has no serious or critical accessibility violations', async ({ page }) => {
	await page.goto('/');
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});