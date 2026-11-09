// Entry point. The page is complete without JavaScript. This boots, in order: the motion
// toggle, the on-call game (engine, pager, missions), the terminal, and, once the text is
// on screen, the 3D scene, which plugs into the game as an optional mirror.
import { initMotionToggle } from './motion.js';
import { initTerminal } from './terminal.js';
import { toast } from './toast.js';
import { createEngine } from './game/engine.js';
import { initHud } from './game/hud.js';
import { initHeal } from './game/missions/heal.js';
import { initRollout } from './game/missions/rollout.js';
import { initCutover } from './game/missions/cutover.js';
import { initBottleneck } from './game/missions/bottleneck.js';
import { initTogether } from './game/missions/together.js';
import { initHandover } from './game/missions/handover.js';

initMotionToggle(document.querySelector('.motion-toggle'));

const engine = createEngine();
initHud(engine);
[initHeal, initRollout, initCutover, initBottleneck, initTogether, initHandover].forEach(init => init(engine));
document.documentElement.classList.add('game-on');
initTerminal(engine);

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
const sceneLikely = webglAvailable() && !new URLSearchParams(location.search).has('noscene');
document.documentElement.classList.toggle('scene-on', sceneLikely);

function noScene() {
  document.documentElement.classList.remove('scene-on');
  engine.emit('scene:none');
}
// The scene is decoration, so it loads only once the text is on screen and the browser is idle.
const whenIdle = window.requestIdleCallback || (callback => setTimeout(callback, 200));
if (!sceneLikely) noScene();
else whenIdle(async () => {
  try {
    const { startScene } = await import('./scene/scene.js');
    engine.scene = startScene(engine);
    if (engine.scene) document.querySelector('.hero-try').hidden = false;
    else noScene();
  } catch (error) {
    console.warn('3D scene unavailable; the page works without it.', error);
    noScene();
  }
});
