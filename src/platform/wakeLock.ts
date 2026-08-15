export type ScreenWakeLockSentinel = {
	released: boolean;
	release: () => Promise<void>;
	addEventListener: (type: 'release', listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
	wakeLock?: { request: (type: 'screen') => Promise<ScreenWakeLockSentinel> };
};

export async function requestScreenWakeLock(): Promise<ScreenWakeLockSentinel | null> {
	try {
		return await (navigator as WakeLockNavigator).wakeLock?.request('screen') ?? null;
	} catch {
		return null;
	}
}