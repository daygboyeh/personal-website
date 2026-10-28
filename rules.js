'use strict';
// Byelaws: flip the rule cards, and ship only when the definition of done is met.
const ruleDeck = $('#rule-deck');
ruleDeck.addEventListener('click', event => {
  const card = event.target.closest('.rule-card');
  if (!card) return;
  card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
});
$('#rules-shuffle').addEventListener('click', () => {
  const items = [...ruleDeck.children];
  for (let index = items.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  items.forEach(item => item.querySelector('.rule-card').setAttribute('aria-pressed', 'false'));
  ruleDeck.replaceChildren(...items);
});

const doneChecks = [...document.querySelectorAll('.dod-check')];
const shipButton = $('#dod-ship');
const doneStatus = $('#dod-status');
function updateDone() {
  const ticked = doneChecks.filter(check => check.checked).length;
  $('#dod-count').textContent = `${ticked}/${doneChecks.length}`;
  shipButton.disabled = ticked < doneChecks.length;
  doneStatus.textContent = ticked === doneChecks.length ? 'All green. Ready to ship.' : `${doneChecks.length - ticked} to go before this is done.`;
}
doneChecks.forEach(check => check.addEventListener('change', updateDone));
shipButton.addEventListener('click', () => {
  const bounds = shipButton.getBoundingClientRect();
  window.dispatchEvent(new CustomEvent('sparkburst', { detail: { x: bounds.left + bounds.width / 2, y: bounds.top } }));
  window.dispatchEvent(new CustomEvent('stamp', { detail: 'done' }));
  doneStatus.textContent = 'Shipped. Small batch, safe rollback, nobody paged.';
  doneChecks.forEach(check => { check.checked = false; });
  shipButton.disabled = true;
  $('#dod-count').textContent = `0/${doneChecks.length}`;
});
