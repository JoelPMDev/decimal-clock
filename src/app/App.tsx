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
import { requestScreenWakeLock, type ScreenWakeLockSentinel } from '../platform/wakeLock';
export default function App() {
	const [preference, setPreference] = useState<TimeZonePreference>(() => loadPreference());
	const [instant, setInstant] = useState(() => browserTimeSource.now());
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [controlsVisible, setControlsVisible] = useState(() => !preference.alwaysOn);
	const [alwaysOnGuideVisible, setAlwaysOnGuideVisible] = useState(false);
	const [conversionHelpOpen, setConversionHelpOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [guideOpen, setGuideOpen] = useState(false);
	const [install, setInstall] = useState<InstallState>({ isInstalled: false, canPrompt: false, isIOS: false, prompt: null });
	const wakeLock = useRef<ScreenWakeLockSentinel | null>(null);
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

	useEffect(() => {
		if (!preference.alwaysOn) {
			void wakeLock.current?.release();
			wakeLock.current = null;
			return;
		}

		let disposed = false;
		const acquire = async () => {
			if (disposed || document.visibilityState !== 'visible' || wakeLock.current) return;
			const sentinel = await requestScreenWakeLock();
			if (disposed) {
				void sentinel?.release();
				return;
			}
			wakeLock.current = sentinel;
			sentinel?.addEventListener('release', () => { wakeLock.current = null; });
		};
		const reacquire = () => { void acquire(); };
		void acquire();
		document.addEventListener('visibilitychange', reacquire);
		window.addEventListener('focus', reacquire);
		return () => {
			disposed = true;
			document.removeEventListener('visibilitychange', reacquire);
			window.removeEventListener('focus', reacquire);
			void wakeLock.current?.release();
			wakeLock.current = null;
		};
	}, [preference.alwaysOn]);

	useEffect(() => {
		if (!preference.alwaysOn || controlsVisible) {
			setAlwaysOnGuideVisible(false);
			return;
		}
		setAlwaysOnGuideVisible(true);
		const timeout = window.setTimeout(() => setAlwaysOnGuideVisible(false), 3000);
		return () => window.clearTimeout(timeout);
	}, [preference.alwaysOn, controlsVisible]);

	const automatic = () => {
		const next: TimeZonePreference = { mode: 'automatic', alwaysOn: preference.alwaysOn };
		setPreference(next);
		savePreference(next);
	};

	const setAlwaysOn = (alwaysOn: boolean) => {
		const next: TimeZonePreference = preference.mode === 'named' ? { ...preference, alwaysOn } : { mode: 'automatic', alwaysOn };
		setPreference(next);
		savePreference(next);
		setControlsVisible(!alwaysOn);
		setSettingsOpen(false);
	};

	const presentation = preference.alwaysOn && !controlsVisible;

	return <>
		{!presentation && <header className="logo">
			<img src="/decima_logo_horizontal.svg" alt="Decima" />
			<button className="conversion-help-button" type="button" aria-label="Show decimal time conversion" aria-describedby={conversionHelpOpen ? 'conversion-help' : undefined} aria-expanded={conversionHelpOpen} onClick={() => setConversionHelpOpen((open) => !open)} onFocus={() => setConversionHelpOpen(true)} onBlur={() => setConversionHelpOpen(false)} onMouseEnter={() => setConversionHelpOpen(true)} onMouseLeave={() => setConversionHelpOpen(false)}>?</button>
			{conversionHelpOpen && <div id="conversion-help" className="conversion-help" role="tooltip"><p>1 decimal hour = 2 hours 24 minutes</p><p>1 decimal minute = 1 minute 26 seconds</p></div>}
			<button className="settings-button" type="button" aria-label="Open settings" aria-pressed={settingsOpen} onClick={() => setSettingsOpen(true)}>⚙</button>
		</header>}
		<ClockDisplay snapshot={snapshot} presentation={presentation} onRevealControls={() => setControlsVisible(true)}/>
		{presentation && alwaysOnGuideVisible && <p className="always-on-guide" role="status"><strong>Always On Mode Enabled</strong><span>Double tap anywhere to show controls</span></p>}
		{!presentation && <>
			{!install.isInstalled && <InstallControl onInstall={() => { if (install.prompt) void install.prompt(); else setGuideOpen(true); }} onGuide={() => setGuideOpen(true)}/>}
			<SettingsDrawer open={settingsOpen} preference={preference} query={query} onQuery={setQuery} onAutomatic={() => { automatic(); setSettingsOpen(false); }} onAlwaysOnChange={setAlwaysOn} onClose={() => setSettingsOpen(false)}/>
			<InstallGuidanceDialog open={guideOpen} onClose={() => setGuideOpen(false)}/>
		</>}
	</>;
}