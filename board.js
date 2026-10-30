'use strict';
// Control-plane status board. The HTML ships readable rows; this script turns each cell
// into glyph slots that scramble into place, keeps a live sync clock, and rotates the
// last deployment through the rest of the page. Every row is a link.
const boardRows = [...document.querySelectorAll('#board-rows .board-row')];
const scrambleGlyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>-_';
const cellWidths = { 'c-ns': 5, 'c-svc': 18, 'c-ready': 5, 'c-status': 8 };
// [namespace, deployment, ready, status, href, line class]
const rotatingDeployments = [
  ['BUILD', 'TOGETHER PARENTING', '1/1', 'BUILDING', '#building', 'line-build'],
  ['INGR', 'TRAFFIC ROUTER', '4/4', 'READY', '#signal', 'line-cloud'],
  ['OPS', 'POD CLUSTER', '24/24', 'RUNNING', '#cluster', 'line-ops'],
  ['YOU', 'A CONVERSATION', '0/1', 'PENDING', '#contact', 'line-lead']
];
let rotatingIndex = 0;
let boardTimer = 0;

function setCell(cell, text) {
  const width = cellWidths[cell.className] || text.length;
  const target = text.toUpperCase().slice(0, width).padEnd(width, ' ');
  cell.dataset.text = text;
  if (!cell.dataset.glyphs) {
    cell.dataset.glyphs = '1';
    cell.replaceChildren(...[...target].map(() => {
      const glyph = document.createElement('span');
      glyph.className = 'glyph'; glyph.setAttribute('aria-hidden', 'true'); glyph.textContent = ' ';
      return glyph;
    }));
  }
  [...cell.children].forEach((glyph, index) => {
    const finalGlyph = target[index];
    if (glyph.textContent === finalGlyph) return;
    if (motionPaused) { glyph.textContent = finalGlyph; return; }
    // Each slot scrambles through a few glyphs, staggered left to right, like a rollout.
    let spins = 3 + Math.floor(Math.random() * 5);
    const tick = () => {
      glyph.textContent = spins-- > 0 ? scrambleGlyphs[Math.floor(Math.random() * scrambleGlyphs.length)] : finalGlyph;
      glyph.classList.toggle('settling', spins >= 0);
      if (spins >= 0) setTimeout(tick, 50);
    };
    setTimeout(tick, index * 26);
  });
}
function renderBoard() {
  boardRows.forEach((row, index) => {
    const cells = [...row.children];
    const values = cells.map(cell => cell.dataset.text || cell.textContent);
    if (index === boardRows.length - 1) {
      const [namespace, deployment, ready, status, href, line] = rotatingDeployments[rotatingIndex];
      [values[0], values[1], values[2], values[3]] = [namespace, deployment, ready, status];
      row.href = href;
      row.className = `board-row ${line}`;
    }
    cells.forEach((cell, cellIndex) => setCell(cell, values[cellIndex]));
    row.setAttribute('aria-label', `${values[1].toLowerCase()}, ${values[2]} ready, ${values[3].toLowerCase()}`);
  });
}
function rotateDeployment() {
  rotatingIndex = (rotatingIndex + 1) % rotatingDeployments.length;
  renderBoard();
}
function syncBoardMotion() {
  clearInterval(boardTimer);
  if (!motionPaused) boardTimer = setInterval(rotateDeployment, 5200);
}
const boardClock = $('#board-clock');
function tickClock() {
  boardClock.textContent = `SYNCED ${new Date().toLocaleTimeString('en-GB', { hour12: false })}`;
}
renderBoard();
tickClock();
const clockTimer = setInterval(tickClock, 1000);
syncBoardMotion();
window.addEventListener('motionchange', syncBoardMotion);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(boardTimer); else syncBoardMotion(); });
window.addEventListener('pagehide', () => { clearInterval(boardTimer); clearInterval(clockTimer); });
