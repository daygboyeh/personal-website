// Mission 5 · Bring it together. Sleep, feeding and milestones gather around one shared
// place: the idea behind Together Parenting.
export function initTogether(engine) {
  engine.register({ id: 'together', title: 'Bring it together', hint: 'Merge the care clusters in Now building.', href: '#building' });
  const button = document.getElementById('together-run');
  const card = document.querySelector('.product-card');
  const status = document.getElementById('together-status');
  let merged = false;
  button.addEventListener('click', () => {
    merged = !merged;
    card.classList.toggle('merged', merged);
    button.setAttribute('aria-pressed', String(merged));
    button.firstChild.textContent = merged ? 'Pull apart ' : 'Bring it together ';
    status.textContent = merged ? 'Everyday care. One shared place.' : 'Sleep, feeding and milestones, each on their own.';
    if (merged) { engine.scene?.focus('togetherMerged'); engine.complete('together'); }
    else engine.scene?.clearFocus();
  });
  // Leaving the section hands the scene back to the scroll.
  new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && merged) engine.scene?.clearFocus(); }).observe(document.getElementById('building'));
}
