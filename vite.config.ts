import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const offlineAssetManifest = (): Plugin => ({
	name: 'offline-asset-manifest',
	generateBundle(_options, bundle) {
		const assets = Object.keys(bundle).map((fileName) => `/${fileName}`);
		assets.push('/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg');
		this.emitFile({
			type: 'asset',
			fileName: 'offline-assets.json',
			source: JSON.stringify([...new Set(assets)], null, 2),
		});
	},
});

export default defineConfig({ plugins: [react(), offlineAssetManifest()], build: { target: 'es2022' } });