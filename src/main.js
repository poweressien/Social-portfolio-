import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import './styles.css';

import { startApp } from './ui/app.js';
import { createFlyovers } from './scene/flyovers.js';
import { reduced, isMobile } from './lib/format.js';

const prefersReduced = reduced();
const world = { birds: createFlyovers(document.getElementById('birds'), { reduced: prefersReduced }) };

startApp(world);

// The WebGL world loads on its own chunk so the feed paints first.
import('./scene/world.js')
  .then(({ createWorld }) => createWorld(document.getElementById('bg'), { reduced: prefersReduced, mobile: isMobile() }))
  .catch((err) => {
    // No WebGL: the page background colour still carries the look.
    console.warn('3D background unavailable', err);
    document.getElementById('bg')?.remove();
  });
