// Mission 4 · Find the bottleneck. The data loader took ~65 s per 1,000 records; the cause
// was audit/lineage overhead, and tuning it brought that to ~5 s (from the CV). The stage
// split shown here is illustrative. The point is the habit: measure before you tune.
const STAGES = [
  ['read', 'Read input', 2], ['validate', 'Validate', 2], ['transform', 'Transform', 3],
  ['audit', 'Audit & lineage', 90], ['write', 'Write', 3]
];

export function initBottleneck(engine) {
  engine.register({ id: 'bottleneck', title: 'Find the bottleneck', hint: 'Profile the data loader in Work, then tune the slow stage.', href: '#case-loader' });
  const rows = document.getElementById('profile-stages');
  const profileButton = document.getElementById('profile-run');
  const time = document.getElementById('loader-time');
  const fill = document.getElementById('loader-fill');
  const log = document.getElementById('bottleneck-log');
  let profiled = false;

  rows.replaceChildren(...STAGES.map(([id, label, share]) => {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.stage = id;
    const name = document.createElement('span'); name.className = 'stage-name'; name.textContent = label;
    const bar = document.createElement('span'); bar.className = 'stage-bar';
    const barFill = document.createElement('span'); barFill.style.setProperty('--share', `${share}%`);
    bar.append(barFill);
    const action = document.createElement('span'); action.className = 'stage-action'; action.textContent = 'Tune';
    button.append(name, bar, action);
    button.setAttribute('aria-label', `Tune ${label}`);
    button.addEventListener('click', () => tune(id, label, row));
    row.append(button);
    return row;
  }));

  function tune(id, label, row) {
    row.querySelector('button').disabled = true;
    if (id !== 'audit') {
      row.classList.add('tuned');
      log.textContent = profiled
        ? `Tuned ${label.toLowerCase()}. Barely moved. The profile already said so.`
        : `Tuned ${label.toLowerCase()}. Barely moved. Guessing is slow; try profiling first.`;
      engine.announce(log.textContent);
      return;
    }
    row.classList.add('fixed');
    rows.classList.add('solved');
    time.textContent = '~5 s';
    fill.style.width = `${5 / 65 * 100}%`;
    fill.style.background = 'var(--plat)';
    log.textContent = 'Audit and lineage overhead tuned: about 1,000 records every 5 seconds, roughly 13× the throughput.';
    engine.complete('bottleneck');
  }
  profileButton.addEventListener('click', () => {
    profiled = true;
    rows.classList.add('profiled');
    profileButton.disabled = true;
    rows.querySelectorAll('button').forEach(button => {
      const share = STAGES.find(([id]) => id === button.dataset.stage)[2];
      button.setAttribute('aria-label', `Tune ${button.querySelector('.stage-name').textContent}, about ${share}% of the time`);
    });
    log.textContent = 'Profiled. One stage is eating almost all of the time.';
    engine.announce(log.textContent);
  });
}
