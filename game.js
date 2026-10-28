'use strict';
// Journey card: twelve stamps for trying things around the site. Other modules award a
// stamp by dispatching `new CustomEvent('stamp', { detail: id })`. Progress lives only in
// this browser's storage as a convenience; the page works the same without it.
const stampDefs = [
  ['done', '✓', 'Definition of done', 'Tick every box and ship it.'],
  ['explorer', '◉', 'Every stop', 'Visit every station on the route.'],
  ['ticket', '⌗', 'Ticket holder', 'Open a work ticket.'],
  ['line', '━', 'Line rider', 'Visit every stop on the career line.'],
  ['terminal', '>_', 'Root shell', 'Open the terminal.'],
  ['signal', '⇄', 'Signaller', 'Route 10 trains in Signal Box.'],
  ['throw', '⤴', 'Pod thrower', 'Throw a pod across the depot.'],
  ['chaos', '⚡', 'Chaos engineer', 'Set the chaos monkey loose.'],
  ['console', '✦', 'Console cowboy', 'Deploy 10 services in the lab.'],
  ['together', '♡', 'Better together', 'Bring the Together demo together.'],
  ['secret', '?', 'Secret keeper', 'Find a hidden easter egg.'],
  ['hello', '✉', 'Say hello', 'Copy my email or write to me.']
];
const stampStorageKey = 'ade-stamps';
const stamps = new Set();
try { JSON.parse(localStorage.getItem(stampStorageKey) || '[]').forEach(id => stamps.add(id)); } catch { /* storage unavailable: start fresh */ }

function saveStamps() {
  try { localStorage.setItem(stampStorageKey, JSON.stringify([...stamps])); } catch { /* keep in memory only */ }
}
function renderStamps() {
  const total = stampDefs.length;
  document.querySelectorAll('.stamp-count').forEach(count => { count.textContent = `${stamps.size}/${total}`; });
  document.querySelectorAll('[data-open-journey]').forEach(button => button.setAttribute('aria-label', `Open journey card, ${stamps.size} of ${total} stamps collected`));
  $('#journey-summary').textContent = stamps.size === total
    ? 'Journey complete. Every stamp collected. You’ve earned a conversation.'
    : `${stamps.size} of ${total} collected. Each one is something to try.`;
  $('#stamp-grid').replaceChildren(...stampDefs.map(([id, glyph, name, hint]) => {
    const item = document.createElement('li');
    const got = stamps.has(id);
    item.className = got ? 'stamp got' : 'stamp';
    const mark = document.createElement('span'); mark.className = 'stamp-mark'; mark.setAttribute('aria-hidden', 'true'); mark.textContent = got ? glyph : '·';
    const title = document.createElement('strong'); title.textContent = name;
    const detail = document.createElement('small'); detail.textContent = got ? 'Collected' : hint;
    item.append(mark, title, detail);
    return item;
  }));
}
function awardStamp(id) {
  const definition = stampDefs.find(([stampId]) => stampId === id);
  if (!definition || stamps.has(id)) return;
  stamps.add(id);
  saveStamps();
  renderStamps();
  const hud = $('.stamp-hud');
  hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump');
  const bounds = hud.getBoundingClientRect();
  if (bounds.width) window.dispatchEvent(new CustomEvent('sparkburst', { detail: { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 } }));
  notify(stamps.size === stampDefs.length
    ? 'Journey complete: all 12 stamps! Next stop, a conversation.'
    : `Stamp collected: ${definition[2]} · ${stamps.size}/${stampDefs.length}`);
}
window.addEventListener('stamp', event => awardStamp(event.detail));

// Opening the card.
const journeyDialog = $('#journey-dialog');
function openJourney() { renderStamps(); openDialog(journeyDialog); }
document.querySelectorAll('[data-open-journey]').forEach(button => button.addEventListener('click', openJourney));
window.addEventListener('openjourney', openJourney);
const journeyReset = $('#journey-reset');
journeyReset.addEventListener('click', () => {
  if (journeyReset.dataset.armed !== 'true') { journeyReset.dataset.armed = 'true'; journeyReset.textContent = 'Click again to reset'; return; }
  stamps.clear(); saveStamps(); renderStamps();
  journeyReset.dataset.armed = 'false'; journeyReset.textContent = 'Reset my card';
});
journeyDialog.addEventListener('close', () => { journeyReset.dataset.armed = 'false'; journeyReset.textContent = 'Reset my card'; });

// Stamps earned from plain page interactions.
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => awardStamp('ticket')));
const visitedStops = new Set();
document.querySelectorAll('[data-career]').forEach(tab => tab.addEventListener('click', () => {
  visitedStops.add(tab.dataset.career);
  if (visitedStops.size === 4) awardStamp('line');
}));
new MutationObserver(() => { if ($('#terminal-dialog').open) awardStamp('terminal'); }).observe($('#terminal-dialog'), { attributes: true, attributeFilter: ['open'] });
$('#care-connect').addEventListener('click', () => awardStamp('together'));
$('#copy-email').addEventListener('click', () => awardStamp('hello'));
document.querySelectorAll('a[href^="mailto:"]').forEach(link => link.addEventListener('click', () => awardStamp('hello')));
const unseenStations = new Set([...document.querySelectorAll('main > section[id]')].map(section => section.id));
const stationObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  unseenStations.delete(entry.target.id);
  stationObserver.unobserve(entry.target);
  if (!unseenStations.size) awardStamp('explorer');
}), { threshold: 0.2 });
document.querySelectorAll('main > section[id]').forEach(section => stationObserver.observe(section));
window.addEventListener('pagehide', () => stationObserver.disconnect());

renderStamps();
