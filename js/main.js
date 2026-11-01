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

// Reserve the scene layout now if WebGL is available, so the page doesn't change height
// (and in-page links don't land in the wrong place) when the scene arrives later.
function webglAvailable() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(gl);
  } catch { return false; }
}
const sceneLikely = webglAvailable();
document.documentElement.classList.toggle('scene-on', sceneLikely);

// The scene is decoration, so it loads only once the text is on screen and the browser is idle.
const whenIdle = window.requestIdleCallback || (callback => setTimeout(callback, 200));
if (sceneLikely) whenIdle(async () => {
  try {
    const { startScene } = await import('./scene/scene.js');
    if (startScene()) document.querySelector('.hero-try').hidden = false;
    else document.documentElement.classList.remove('scene-on');
  } catch (error) {
    document.documentElement.classList.remove('scene-on');
    console.warn('3D scene unavailable; the page works without it.', error);
  }
});
