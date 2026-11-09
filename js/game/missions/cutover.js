// Mission 3 · Run the cutover. An illustrative replay of the weekend migration: ten
// environments move from on-premises to cloud over a Friday-to-Monday clock. The real
// facts (10 environments, 19 core + 24 microservices, a weekend cutover, no issues on day
// one) are from the CV; the phase timings and log lines are illustrative.
//
// The picture is a Stageshow product demo (demos/src/Cutover.tsx, prebuilt into
// js/demos), lazy-loaded as the case study approaches. If it can't load, the plain DOM
// replay below (clock and environment chips) plays the same story.
import { isMotionPaused } from '../../motion.js';

const DEMO_CSS = 'js/demos/cutover.css';

const PHASES = [
  ['Fri 18:00', 0, 'Change freeze. Final readiness checks across all 10 environments.'],
  ['Fri 21:00', 2, 'Phase 1: the first environments cut over.'],
  ['Sat 09:00', 4, 'Phase 2: more environments across. Automated deployments, same every time.'],
  ['Sat 16:00', 6, 'Phase 3: core services settling in.'],
  ['Sat 23:00', 8, 'Phase 4: microservices following.'],
  ['Sun 11:00', 10, 'All 10 environments on cloud: 19 core services and 24 microservices.'],
  ['Mon 09:00', 10, 'Monday morning. No issues on day one.']
];
const STEP_MS = 900;

export function initCutover(engine) {
  engine.register({ id: 'cutover', title: 'Run the cutover', hint: 'Replay the weekend migration in Work.', href: '#case-migration' });
  const clock = document.getElementById('cutover-clock');
  const log = document.getElementById('cutover-log');
  const run = document.getElementById('cutover-run');
  const strip = document.getElementById('env-strip');
  strip.replaceChildren(...Array.from({ length: 10 }, (_, index) => {
    const env = document.createElement('li');
    env.textContent = `env ${String(index + 1).padStart(2, '0')}`;
    return env;
  }));
  const environments = [...strip.children];
  let phase = -1;
  let timer = 0;
  let demo = null;
  const block = document.getElementById('cutover');

  // Load the dashboard demo once the case study is near; keep the DOM replay if it fails.
  const loader = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return;
    loader.disconnect();
    try {
      const style = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: DEMO_CSS });
      document.head.append(style);
      const { mountCutover } = await import('../../demos/cutover.js');
      demo = mountCutover(document.getElementById('cutover-demo'), { onPayoff: finish });
      block.classList.add('has-demo');
    } catch (error) {
      console.warn('Cutover demo unavailable; using the plain replay.', error);
    }
  }, { rootMargin: '600px 0px' });
  loader.observe(block);

  function show(index) {
    const [time, moved, message] = PHASES[index];
    clock.textContent = time;
    log.textContent = message;
    environments.forEach((env, envIndex) => env.classList.toggle('moved', envIndex < moved));
    strip.setAttribute('aria-label', `${moved} of 10 environments on cloud`);
    engine.scene?.focus('cutover', { progress: moved / 10 });
  }
  function finish() {
    phase = PHASES.length - 1;
    log.textContent = PHASES[phase][2];
    run.disabled = false;
    run.firstChild.textContent = 'Replay again ';
    engine.announce('Cutover complete. No issues on day one.');
    engine.complete('cutover');
    setTimeout(() => engine.scene?.clearFocus(), 2500);
  }
  function step() {
    phase++;
    show(phase);
    if (phase === PHASES.length - 1) { finish(); return; }
    if (isMotionPaused()) { run.disabled = false; run.firstChild.textContent = 'Next phase '; }
    else timer = setTimeout(step, STEP_MS);
  }
  run.addEventListener('click', () => {
    if (demo) {
      // The demo plays the whole weekend; with motion paused it jumps to Monday.
      clearTimeout(timer);
      run.disabled = true;
      log.textContent = 'Friday, 18:00. Change freeze. The cutover begins.';
      engine.announce('Cutover replay started. Friday, 18:00.');
      if (isMotionPaused()) demo.finish(); else demo.play();
      return;
    }
    // With motion paused the replay advances one phase per press instead of on a clock.
    if (phase >= 0 && phase < PHASES.length - 1 && isMotionPaused()) { step(); return; }
    clearTimeout(timer);
    phase = -1;
    run.disabled = !isMotionPaused();
    engine.announce('Cutover replay started. Friday, 18:00.');
    step();
  });
  window.addEventListener('pagehide', () => clearTimeout(timer));
}
