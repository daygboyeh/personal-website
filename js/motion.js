// Decorative-motion state shared by every module. Starts from the visitor's
// reduced-motion preference; the header toggle can override it for this visit.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();
let paused = reducedMotion.matches;

export const isMotionPaused = () => paused;
export function onMotionChange(listener) { listeners.add(listener); return () => listeners.delete(listener); }

function setPaused(next, button) {
  paused = next;
  document.documentElement.classList.toggle('motion-paused', paused);
  document.documentElement.style.scrollBehavior = paused ? 'auto' : '';
  if (button) {
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('.motion-label').textContent = paused ? 'Motion off' : 'Motion on';
    button.querySelector('.motion-symbol').textContent = paused ? '▶' : 'Ⅱ';
    button.title = paused ? 'Turn decorative motion on' : 'Pause decorative motion';
  }
  listeners.forEach(listener => listener(paused));
}

export function initMotionToggle(button) {
  button.hidden = false;
  button.addEventListener('click', () => setPaused(!paused, button));
  reducedMotion.addEventListener('change', event => setPaused(event.matches, button));
  setPaused(paused, button);
}
