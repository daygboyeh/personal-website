// Mission 2 · Roll out the proof. Each beat counts once it has been properly on screen;
// the pager's rollout bar fills as you read.
export function initRollout(engine) {
  engine.register({ id: 'rollout', title: 'Roll out the proof', hint: 'Read all five beats in Proof.', href: '#proof' });
  const beats = [...document.querySelectorAll('#proof .beat')];
  const seen = new Set();
  const report = () => engine.emit('rollout', engine.isComplete('rollout') ? 1 : seen.size / beats.length);
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    seen.add(entry.target);
    observer.unobserve(entry.target);
    report();
    if (seen.size === beats.length) engine.complete('rollout');
  }), { threshold: 0.6 });
  beats.forEach(beat => observer.observe(beat));
  engine.on('reset', () => { seen.clear(); beats.forEach(beat => observer.observe(beat)); report(); });
  report();
}
