import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Locally bundled OFL fonts from public/fonts. Nothing is fetched from the
 * network. loadFont() wraps the FontFace API in delayRender()/continueRender()
 * and fails the render if a file cannot be loaded.
 *
 * Variable fonts are registered with their whole weight axis, so every CSS
 * font-weight inside the range selects a real instance (no synthetic bold).
 */
type FontSource = {
  readonly family: string;
  readonly file: string;
  /** One weight, or a "min max" range for a variable font. */
  readonly weight: string;
};

const SOURCES: readonly FontSource[] = [
  {family: 'Montserrat', file: 'fonts/montserrat/Montserrat-Variable.ttf', weight: '100 900'},
  {family: 'Rubik', file: 'fonts/rubik/Rubik-Variable.ttf', weight: '300 900'},
  {family: 'Unbounded', file: 'fonts/unbounded/Unbounded-Variable.ttf', weight: '200 900'},
  {family: 'Russo One', file: 'fonts/russoone/RussoOne-Regular.ttf', weight: '400'},
  {family: 'Press Start 2P', file: 'fonts/pressstart2p/PressStart2P-Regular.ttf', weight: '400'},
  {family: 'Inter', file: 'fonts/inter/Inter-Variable.ttf', weight: '100 900'},
  {family: 'JetBrains Mono', file: 'fonts/jetbrainsmono/JetBrainsMono-Variable.ttf', weight: '100 800'},
];

// loadFont() holds the render back with delayRender() until each file is ready,
// so no frame is captured with a fallback font. No top-level await is needed,
// which keeps the module compatible with both bundlers (rspack and webpack).
for (const {family, file, weight} of SOURCES) {
  void loadFont({family, url: staticFile(file), weight});
}

/**
 * CSS font-family values of the bundled fonts. They are quoted on purpose:
 * a bare `Press Start 2P` is invalid CSS (an identifier cannot start with a
 * digit) and the browser would silently fall back to a system font.
 */
export const FONT = {
  montserrat: '"Montserrat"',
  rubik: '"Rubik"',
  unbounded: '"Unbounded"',
  russoOne: '"Russo One"',
  pressStart2P: '"Press Start 2P"',
  inter: '"Inter"',
  jetBrainsMono: '"JetBrains Mono"',
} as const;
