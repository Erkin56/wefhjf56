// Renders preview stills at the given times (seconds): node scripts/stills.mjs <outDir> <t1,t2,...> [scale]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, list, scale = '0.5'] = process.argv.slice(2);
const times = list.split(',').map(Number);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Film', browserExecutable});
const browser = await openBrowser('chrome', {browserExecutable});
for (const t of times) {
	const output = path.join(outDir, `f_${t.toFixed(2).padStart(5, '0')}.jpg`);
	await renderStill({composition, serveUrl, output, frame: Math.min(composition.durationInFrames - 1, Math.round(t * 30)), imageFormat: 'jpeg', jpegQuality: 82, scale: Number(scale), puppeteerInstance: browser, browserExecutable});
}
await browser.close({silent: true});
console.log('stills:', times.length);
