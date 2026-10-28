'use strict';
// Split-flap departures board. The HTML ships readable rows; this script turns each
// cell into flaps, keeps a live clock, and rotates the "next" departure. Every row is a link.
const boardRows = [...document.querySelectorAll('#board-rows .board-row')];
const flapGlyphs = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
const cellWidths = { 'c-time': 5, 'c-dest': 18, 'c-plat': 1, 'c-status': 8 };
const nextDepartures = [
  ['TOGETHER PARENTING', '2', 'BUILDING', '#building'],
  ['SIGNAL BOX ARCADE', '0', 'BOARDING', '#signal'],
  ['THE POD DEPOT', '4', 'ON TIME', '#cluster'],
  ['A GOOD CONVERSATION', '6', 'ON TIME', '#contact']
];
let nextIndex = 0;
let boardTimer = 0;

function setCell(cell, text) {
  const width = cellWidths[cell.className] || text.length;
  const target = text.toUpperCase().slice(0, width).padEnd(width, ' ');
  cell.dataset.text = text;
  if (!cell.dataset.flaps) {
    cell.dataset.flaps = '1';
    cell.replaceChildren(...[...target].map(() => {
      const flap = document.createElement('span');
      flap.className = 'flap'; flap.setAttribute('aria-hidden', 'true'); flap.textContent = ' ';
      return flap;
    }));
  }
  [...cell.children].forEach((flap, index) => {
    const finalGlyph = target[index];
    if (flap.textContent === finalGlyph) return;
    if (motionPaused) { flap.textContent = finalGlyph; return; }
    // Each flap spins through a few glyphs, staggered left to right like a real board.
    let spins = 3 + Math.floor(Math.random() * 5);
    const tick = () => {
      flap.classList.remove('flipping'); void flap.offsetWidth; flap.classList.add('flipping');
      flap.textContent = spins-- > 0 ? flapGlyphs[Math.floor(Math.random() * flapGlyphs.length)] : finalGlyph;
      if (spins >= 0) setTimeout(tick, 55);
    };
    setTimeout(tick, index * 28);
  });
}
function departureTimes() {
  // Departures are always just ahead of the visitor's own clock.
  const base = new Date();
  base.setSeconds(0); base.setMinutes(Math.ceil(base.getMinutes() / 5) * 5);
  return [7, 22, 41].map(offset => {
    const time = new Date(base.getTime() + offset * 60000);
    return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
  });
}
function renderBoard() {
  const times = departureTimes();
  boardRows.forEach((row, index) => {
    const cells = [...row.children];
    const values = cells.map(cell => cell.dataset.text || cell.textContent);
    if (index < 3) values[0] = times[index];
    else { [values[1], values[2], values[3]] = nextDepartures[nextIndex]; row.href = nextDepartures[nextIndex][3]; }
    cells.forEach((cell, cellIndex) => setCell(cell, values[cellIndex]));
    row.setAttribute('aria-label', `${values[0]} departure to ${values[1].toLowerCase()}, platform ${values[2]}, ${values[3].toLowerCase()}`);
  });
}
function rotateNext() {
  nextIndex = (nextIndex + 1) % nextDepartures.length;
  renderBoard();
}
function syncBoardMotion() {
  clearInterval(boardTimer);
  if (!motionPaused) boardTimer = setInterval(rotateNext, 5200);
}
const boardClock = $('#board-clock');
function tickClock() {
  boardClock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
}
renderBoard();
tickClock();
const clockTimer = setInterval(tickClock, 1000);
syncBoardMotion();
window.addEventListener('motionchange', syncBoardMotion);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(boardTimer); else syncBoardMotion(); });
window.addEventListener('pagehide', () => { clearInterval(boardTimer); clearInterval(clockTimer); });
