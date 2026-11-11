/**
 * Configuration of the Remotion CLI (studio, render, still).
 * It does not apply to the Node.js APIs. All options: https://remotion.dev/docs/config
 */
import {existsSync} from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setRspack(true);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Delivery encode. Size and frame rate come from the composition (1080x1920, 30 fps).
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setCrf(18);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setSampleRate(48000);

// Browser: the Chrome Headless Shell that is preinstalled in the build container.
// FILM_BROWSER_EXECUTABLE overrides it. Without either, Remotion downloads its own.
const PREINSTALLED_HEADLESS_SHELL =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable =
  process.env.FILM_BROWSER_EXECUTABLE ??
  (existsSync(PREINSTALLED_HEADLESS_SHELL) ? PREINSTALLED_HEADLESS_SHELL : null);
if (browserExecutable) {
  Config.setBrowserExecutable(browserExecutable);
}
