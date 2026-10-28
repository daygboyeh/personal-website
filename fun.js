'use strict';
// Small delights and easter eggs. Everything here is decorative: it respects the
// motion toggle, never touches form fields, and keeps no data beyond this page.

// Magnetic name: letters lean away from the cursor, like pods avoiding a noisy neighbour.
const heroTitle = $('#hero-title');
const finePointer = matchMedia('(pointer: fine)');
heroTitle.setAttribute('aria-label', 'Adebiyi Adegboye.');
const magnetLetters = [];
function splitLetters(node) {
  [...node.childNodes].forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      [...child.textContent].forEach(character => {
        // Spaces stay as text so the words keep their natural gap.
        if (/\s/.test(character)) { fragment.append(document.createTextNode(character)); return; }
        const letter = document.createElement('span');
        letter.className = 'magnet-letter';
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = character;
        magnetLetters.push(letter);
        fragment.append(letter);
      });
      child.replaceWith(fragment);
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'svg') splitLetters(child);
  });
}
splitLetters(heroTitle);
let magnetFrame = 0;
let magnetPointer = null;
function pushLetters() {
  magnetFrame = 0;
  magnetLetters.forEach(letter => {
    if (!magnetPointer || motionPaused) { letter.style.transform = ''; return; }
    const bounds = letter.getBoundingClientRect();
    const dx = bounds.left + bounds.width / 2 - magnetPointer.x;
    const dy = bounds.top + bounds.height / 2 - magnetPointer.y;
    const distance = Math.hypot(dx, dy);
    const force = Math.max(0, 1 - distance / 140);
    letter.style.transform = force ? `translate(${(dx / distance) * force * 18}px, ${(dy / distance) * force * 18}px) rotate(${(dx / distance) * force * 12}deg)` : '';
  });
}
$('.hero').addEventListener('pointermove', event => {
  if (!finePointer.matches || motionPaused) return;
  magnetPointer = { x: event.clientX, y: event.clientY };
  if (!magnetFrame) magnetFrame = requestAnimationFrame(pushLetters);
});
$('.hero').addEventListener('pointerleave', () => { magnetPointer = null; if (!magnetFrame) magnetFrame = requestAnimationFrame(pushLetters); });

// Burst of ✳ sparks from a point on screen.
function sparkBurst(x, y, count = 18) {
  if (motionPaused) return;
  for (let index = 0; index < count; index++) {
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.textContent = index % 3 ? '✳' : '⬡';
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.4;
    const reach = 60 + Math.random() * 90;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--dx', `${Math.cos(angle) * reach}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * reach - 30}px`);
    spark.style.setProperty('--spin', `${(Math.random() - 0.5) * 540}deg`);
    spark.addEventListener('animationend', () => spark.remove());
    document.body.append(spark);
  }
}

// Easter egg: click the ✳ brand mark five times quickly for sudo mode.
let brandClicks = 0;
let brandTimer;
document.querySelectorAll('.brand-mark').forEach(mark => mark.closest('a').addEventListener('click', event => {
  brandClicks++;
  clearTimeout(brandTimer);
  brandTimer = setTimeout(() => { brandClicks = 0; }, 900);
  if (brandClicks < 5) return;
  event.preventDefault();
  brandClicks = 0;
  const bounds = mark.getBoundingClientRect();
  sparkBurst(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 26);
  document.body.classList.toggle('sudo-mode');
  window.dispatchEvent(new CustomEvent('stamp', { detail: 'secret' }));
  notify(document.body.classList.contains('sudo-mode') ? 'sudo mode: on. With great privilege comes great change control.' : 'sudo mode: off. Least privilege restored.');
}));

// Easter egg: type a secret word anywhere on the page.
const secrets = {
  dns: () => notify('It’s always DNS. Even when it isn’t. Especially when it isn’t.'),
  yaml: () => { document.body.classList.add('yaml-wobble'); notify('Error: mapping values are not allowed here. Just kidding.'); setTimeout(() => document.body.classList.remove('yaml-wobble'), 900); },
  deploy: () => { sparkBurst(innerWidth / 2, innerHeight / 2, 30); notify('Friday deploy detected. Rolling back… no, it’s fine. Ship it.'); },
  sudo: () => { document.body.classList.toggle('sudo-mode'); notify(document.body.classList.contains('sudo-mode') ? 'sudo mode: on.' : 'sudo mode: off.'); }
};
let typedBuffer = '';
document.addEventListener('keydown', event => {
  if (event.target.matches('input,textarea') || event.metaKey || event.ctrlKey || event.key.length !== 1) return;
  typedBuffer = (typedBuffer + event.key.toLowerCase()).slice(-12);
  const word = Object.keys(secrets).find(secret => typedBuffer.endsWith(secret));
  if (word) { typedBuffer = ''; secrets[word](); window.dispatchEvent(new CustomEvent('stamp', { detail: 'secret' })); }
});

// When the tab is hidden, the page gets evicted; it reschedules when you come back.
const pageTitle = document.title;
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? '✳ Pod evicted. Come back?' : pageTitle;
});

// Footer status page: live session uptime and an on-call mood based on the visitor's clock.
const sessionStart = Date.now();
const statusText = $('#site-status-text');
const lateNight = (hour => hour >= 22 || hour < 6)(new Date().getHours());
function renderStatus() {
  const seconds = Math.floor((Date.now() - sessionStart) / 1000);
  const clock = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(part => String(part).padStart(2, '0')).join(':');
  statusText.textContent = `${lateNight ? 'ON CALL' : 'ALL SYSTEMS GO'} · UPTIME ${clock}`;
}
renderStatus();
const statusTimer = setInterval(renderStatus, 1000);
window.addEventListener('pagehide', () => { clearInterval(statusTimer); cancelAnimationFrame(magnetFrame); });
window.addEventListener('sparkburst', event => sparkBurst(event.detail?.x ?? innerWidth / 2, event.detail?.y ?? innerHeight / 2, 30));

// For the curious who open DevTools.
console.log('%c✳ ADEGBOYE', 'font:700 22px Helvetica,Arial,sans-serif;color:#326f65');
console.log('Looking under the hood? Good instinct. No framework, no build step. Just HTML, CSS, and vanilla JS.\nSecrets: try the terminal (`), click the ✳ five times, type "dns" or "yaml", or remember a certain cheat code. Each one earns a stamp.\nSay hello: loluadegboye@gmail.com');
