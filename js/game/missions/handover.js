// Finale · The handover. Contact ends the shift with a report built from game state and
// a button that emails it to Adebiyi. Works with zero missions done.
const EMAIL = 'loluadegboye@gmail.com';

export function initHandover(engine) {
  const missions = document.getElementById('ho-missions');
  const restarts = document.getElementById('ho-restarts');
  const budget = document.getElementById('ho-budget');
  const note = document.getElementById('ho-note');
  const send = document.getElementById('ho-send');

  function render() {
    const stats = engine.stats();
    missions.textContent = `${stats.done}/${stats.total}`;
    restarts.textContent = String(stats.restarts);
    budget.textContent = `${stats.budget.toFixed(1)}%`;
    note.textContent = stats.done === stats.total
      ? 'Every mission done. That’s a clean shift. Hand it over.'
      : stats.done ? `${stats.total - stats.done} missions still open. Hand over anyway, or finish them first.` : 'A quiet shift so far. Hand over anyway: that’s what the button is for.';
    const subject = `Handover: ${stats.done}/${stats.total} missions, ${stats.restarts} ${stats.restarts === 1 ? 'pod' : 'pods'} restarted`;
    send.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
  }
  engine.on('missions', render);
  engine.on('stats', render);
  render();
}
