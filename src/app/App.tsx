import { useEffect, useRef, useState } from 'react';
import { buildDisplaySnapshot } from '../domain/displaySnapshot';
import { getLocalDayWindow } from '../domain/localDay';
import type { LocalDayWindow, TimeZonePreference } from '../domain/types';
import { ClockDisplay } from '../components/ClockDisplay';
import { InstallControl } from '../components/InstallControl';
import { InstallGuidanceDialog } from '../components/InstallGuidanceDialog';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { browserTimeSource } from '../platform/timeSource';
import { loadPreference, savePreference } from '../platform/persistence';
import { watchInstallContext, type InstallState } from '../platform/installContext';
import { registerServiceWorker } from '../platform/serviceWorker';
import { createClockScheduler } from '../platform/clockScheduler';
export default function App() {
	const [preference, setPreference] = useState<TimeZonePreference>(() => loadPreference());
	const [instant, setInstant] = useState(() => browserTimeSource.now());
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [conversionHelpOpen, setConversionHelpOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [guideOpen, setGuideOpen] = useState(false);
	const [install, setInstall] = useState<InstallState>({ isInstalled: false, canPrompt: false, isIOS: false, prompt: null });
	const zone = preference.mode === 'named' ? preference.timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone;
	const windowCache = useRef<{ mode: TimeZonePreference['mode']; timeZone: string; window: LocalDayWindow } | null>(null);
	let activeCache = windowCache.current;

	if (!activeCache || activeCache.mode !== preference.mode || activeCache.timeZone !== zone || instant.getTime() >= activeCache.window.end.getTime()) {
		activeCache = { mode: preference.mode, timeZone: zone, window: getLocalDayWindow(instant, zone) };
		windowCache.current = activeCache;
	}

	const snapshot = buildDisplaySnapshot(instant, zone, activeCache.window);

	useEffect(() => {
		const scheduler = createClockScheduler(browserTimeSource, setInstant);
		scheduler.start();
		return () => scheduler.stop();
	}, []);

	useEffect(() => {
		registerServiceWorker();
		return watchInstallContext(setInstall);
	}, []);

	const automatic = () => {
		const next: TimeZonePreference = { mode: 'automatic' };
		setPreference(next);
		savePreference(next);
	};

	return <>
		<header className="logo">Metric Clock</header>
		<ClockDisplay snapshot={snapshot}/>
		{!install.isInstalled && <InstallControl onInstall={() => { if (install.prompt) void install.prompt(); else setGuideOpen(true); }} onGuide={() => setGuideOpen(true)}/>}
		<button className="conversion-help-button" type="button" aria-label="Show decimal time conversion" aria-describedby={conversionHelpOpen ? 'conversion-help' : undefined} aria-expanded={conversionHelpOpen} onClick={() => setConversionHelpOpen((open) => !open)} onFocus={() => setConversionHelpOpen(true)} onBlur={() => setConversionHelpOpen(false)} onMouseEnter={() => setConversionHelpOpen(true)} onMouseLeave={() => setConversionHelpOpen(false)}>?</button>
		{conversionHelpOpen && <div id="conversion-help" className="conversion-help" role="tooltip"><p>1 decimal hour = 2 hours 24 minutes</p><p>1 decimal minute = 1 minute 26 seconds</p></div>}
		<button className="settings-button" type="button" aria-label="Open settings" aria-pressed={settingsOpen} onClick={() => setSettingsOpen(true)}>⚙</button>
		<SettingsDrawer open={settingsOpen} preference={preference} query={query} onQuery={setQuery} onAutomatic={() => { automatic(); setSettingsOpen(false); }} onClose={() => setSettingsOpen(false)}/>
		<InstallGuidanceDialog open={guideOpen} onClose={() => setGuideOpen(false)}/>
	</>;
}