// Entry point. The page is complete without JavaScript; these modules only add the
// motion toggle, the terminal, copy-to-clipboard and, after first paint, the 3D scene.
import { initMotionToggle } from './motion.js';
import { initTerminal } from './terminal.js';
import { toast } from './toast.js';

initMotionToggle(document.querySelector('.motion-toggle'));
initTerminal();

const copyEmail = document.getElementById('copy-email');
if (navigator.clipboard) {
  copyEmail.hidden = false;
  copyEmail.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('loluadegboye@gmail.com'); toast('Email copied. Talk soon.'); }
    catch { toast('Copy was blocked. The address is loluadegboye@gmail.com'); }
  });
}

// The scene is decoration, so it loads only once the text is on screen and the browser is idle.
const whenIdle = window.requestIdleCallback || (callback => setTimeout(callback, 200));
whenIdle(async () => {
  try {
    const { startScene } = await import('./scene/scene.js');
    if (startScene()) document.querySelector('.hero-try').hidden = false;
  } catch (error) {
    console.warn('3D scene unavailable; the page works without it.', error);
  }
});
