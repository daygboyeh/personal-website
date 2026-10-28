'use strict';
// Boot intro: a short kubectl-style rollout that "deploys" the visitor.
// Loaded synchronously at the top of <body> so the overlay exists before first paint;
// it never blocks: any key, click, or 4 seconds dismisses it, and it shows once per session.
(() => {
  let seen = false;
  try { seen = sessionStorage.getItem('ade-intro') === '1'; sessionStorage.setItem('ade-intro', '1'); } catch { /* storage blocked: show it */ }
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Up late? Welcome.' : hour < 12 ? 'Good morning. Welcome.' : hour < 18 ? 'Good afternoon. Welcome.' : 'Good evening. Welcome.';
  const lines = [
    ['cmd', '$ kubectl apply -f visitor.yaml'],
    ['', 'namespace/you created'],
    ['', 'deployment.apps/curiosity created'],
    ['', 'service/portfolio exposed on :443'],
    ['ok', 'rollout status: 1/1 ready ✓'],
    ['hello', greeting]
  ];

  const overlay = document.createElement('div');
  overlay.className = 'boot-intro';
  overlay.setAttribute('aria-hidden', 'true');
  const log = document.createElement('div');
  log.className = 'boot-log';
  const hint = document.createElement('span');
  hint.className = 'boot-hint';
  hint.textContent = 'PRESS ANY KEY TO SKIP';
  overlay.append(log, hint);
  document.body.prepend(overlay);
  document.documentElement.classList.add('booting');

  const timers = [];
  lines.forEach(([kind, text], index) => timers.push(setTimeout(() => {
    const line = document.createElement('p');
    line.className = kind;
    line.textContent = text;
    log.append(line);
  }, 180 + index * 380)));

  function finish() {
    timers.forEach(clearTimeout);
    removeEventListener('keydown', finish);
    overlay.removeEventListener('pointerdown', finish);
    overlay.classList.add('done');
    document.documentElement.classList.remove('booting');
    setTimeout(() => overlay.remove(), 600);
  }
  timers.push(setTimeout(finish, 180 + lines.length * 380 + 700));
  addEventListener('keydown', finish);
  overlay.addEventListener('pointerdown', finish);
})();
