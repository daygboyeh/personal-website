// The pager: the game's single HUD. Collapsed, it shows the shift at a glance and a
// "Break a pod" button. Expanded, it lists every mission as a link to its section, so the
// mission list is also the page navigation, plus the proof rollout bar.
import { isMotionPaused } from '../motion.js';

export function initHud(engine) {
  const pager = document.getElementById('pager');
  const toggle = document.getElementById('pager-toggle');
  const panel = document.getElementById('pager-panel');
  const list = document.getElementById('mission-list');
  const count = document.getElementById('pager-count');
  const budget = document.getElementById('pager-budget');
  const rolloutFill = document.getElementById('rollout-fill');
  const rolloutText = document.getElementById('rollout-pct');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open) (list.querySelector('a') || toggle).focus();
  }
  function renderStats() {
    const { done, total, budget: left } = engine.stats();
    count.textContent = `${done}/${total}`;
    budget.textContent = `budget ${left.toFixed(1)}%`;
    toggle.setAttribute('aria-label', `On call. ${done} of ${total} missions done. Error budget ${left.toFixed(1)} percent. Show missions.`);
  }
  function renderMissions(missions) {
    list.replaceChildren(...missions.map((mission, index) => {
      const item = document.createElement('li');
      item.className = mission.done ? 'done' : '';
      const link = document.createElement('a');
      link.href = mission.href;
      const mark = document.createElement('span'); mark.className = 'mission-mark'; mark.setAttribute('aria-hidden', 'true'); mark.textContent = mission.done ? '✓' : String(index + 1);
      const text = document.createElement('span');
      const title = document.createElement('strong'); title.textContent = mission.title;
      const hint = document.createElement('small'); hint.textContent = mission.done ? 'Done' : mission.hint;
      text.append(title, hint);
      link.append(mark, text);
      link.addEventListener('click', event => {
        event.preventDefault();
        setOpen(false);
        const target = document.querySelector(mission.href);
        target.scrollIntoView({ behavior: isMotionPaused() ? 'auto' : 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
      item.append(link);
      return item;
    }));
    renderStats();
  }

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); } });
  document.addEventListener('pointerdown', event => { if (!panel.hidden && !pager.contains(event.target)) setOpen(false); });
  document.getElementById('shift-reset').addEventListener('click', () => engine.reset());

  engine.on('missions', renderMissions);
  engine.on('stats', renderStats);
  engine.on('rollout', progress => {
    rolloutFill.style.width = `${Math.round(progress * 100)}%`;
    rolloutText.textContent = `${Math.round(progress * 100)}%`;
  });
  engine.on('complete', () => {
    pager.classList.remove('pinged'); void pager.offsetWidth;
    if (!isMotionPaused()) pager.classList.add('pinged');
  });
  pager.hidden = false;
  renderMissions(engine.list());
}
