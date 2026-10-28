'use strict';
const world = $('#world');
const shell = $('#console-shell');
const screen = $('#console-screen');
let dragStart = null;
let rotation = { x: 18, y: -22, z: -11 };
function rotateConsole() { shell.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`; }
world.addEventListener('pointerdown', event => {
  if (event.target.closest('button') || motionPaused) return;
  dragStart = { x: event.clientX, y: event.clientY, origin: { ...rotation } };
  world.setPointerCapture(event.pointerId);
  world.classList.add('dragging');
});
world.addEventListener('pointermove', event => {
  if (!dragStart || motionPaused) return;
  rotation.y = Math.max(-55, Math.min(45, dragStart.origin.y + (event.clientX - dragStart.x) * 0.3));
  rotation.x = Math.max(-15, Math.min(45, dragStart.origin.x - (event.clientY - dragStart.y) * 0.2));
  rotateConsole();
});
function endDrag() { dragStart = null; world.classList.remove('dragging'); }
world.addEventListener('pointerup', endDrag);
world.addEventListener('pointercancel', endDrag);
window.addEventListener('motionchange', () => { if (motionPaused) endDrag(); });
let score = 0;
let playing = false;
let paletteIndex = 0;
const palettes = ['#c2dcc0', '#d8d0b0', '#b8d3d8', '#d2c3dc'];
let star;
function placeStar() {
  if (star) star.remove();
  star = document.createElement('button');
  star.className = 'game-star'; star.textContent = '⬡';
  star.setAttribute('aria-label', 'Deploy service');
  star.style.left = `${44 + (score * 19 % 35)}%`;
  star.style.top = `${28 + (score * 13 % 25)}%`;
  star.addEventListener('click', collectStar);
  screen.append(star);
}
function startConsole() {
  playing = true; screen.classList.add('playing');
  $('#screen-start').innerHTML = 'RESET <span>↺</span>';
  placeStar();
}
function resetConsole() {
  score = 0; playing = false;
  $('#score-display').textContent = '✦ 000';
  screen.classList.remove('playing');
  $('#screen-start').innerHTML = 'PRESS START <span>↵</span>';
  if (star) star.remove();
}
function collectStar() {
  if (!playing) startConsole();
  score++;
  $('#score-display').textContent = `✦ ${String(score).padStart(3, '0')}`;
  $('#screen-player').style.transform = motionPaused ? '' : `translateY(-${score % 2 ? 9 : 0}px) rotate(${score % 2 ? 30 : 0}deg)`;
  placeStar();
  if (score === 5) notify('Five services deployed. A small platform, up and running.');
  if (score === 10) { notify('Ten services deployed. Platform builder unlocked.'); window.dispatchEvent(new CustomEvent('stamp', { detail: 'console' })); }
}
$('#screen-start').addEventListener('click', () => playing ? resetConsole() : startConsole());
window.addEventListener('startconsole', startConsole);
function deviceAction(action) {
  if (action === 'A') collectStar();
  if (action === 'B') resetConsole();
  if (action === 'X') playing ? resetConsole() : startConsole();
  if (action === 'Y') { paletteIndex = (paletteIndex + 1) % palettes.length; screen.style.background = palettes[paletteIndex]; }
}
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => deviceAction(button.dataset.action)));
world.addEventListener('keydown', event => {
  if (event.target.matches('button')) return;
  const key = event.key.toUpperCase();
  if ('ABXY'.includes(key) && key.length === 1) { event.preventDefault(); deviceAction(key); }
  if (key === 'ENTER') { event.preventDefault(); playing ? collectStar() : startConsole(); }
  if (!motionPaused && key.startsWith('ARROW')) {
    event.preventDefault();
    if (key === 'ARROWLEFT') rotation.y = Math.max(-55, rotation.y - 8);
    if (key === 'ARROWRIGHT') rotation.y = Math.min(45, rotation.y + 8);
    if (key === 'ARROWUP') rotation.x = Math.min(45, rotation.x + 8);
    if (key === 'ARROWDOWN') rotation.x = Math.max(-15, rotation.x - 8);
    rotateConsole();
  }
});

// Scroll progress bar across the top of the page.
let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  const scrollRange = document.documentElement.scrollHeight - innerHeight;
  $('.scroll-progress').style.width = `${scrollRange > 0 ? scrollY / scrollRange * 100 : 0}%`;
}
function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
addEventListener('scroll', queueScroll, { passive: true });
addEventListener('resize', queueScroll);
updateScroll();
window.addEventListener('pagehide', () => cancelAnimationFrame(scrollFrame));
