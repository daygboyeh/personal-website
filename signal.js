'use strict';
// Signal Box: trains carrying a tool head for the junction; set the points to send each
// one to its line. Colour hints switch off after 10 trains (the "night service").
const signalStage = $('#signal-stage');
const signalOverlay = $('#signal-overlay');
const signalStatus = $('#signal-status');
const trunkPath = signalStage.querySelector('.trunk');
const branchPaths = [...signalStage.querySelectorAll('.branch')];
const pointButtons = [...document.querySelectorAll('[data-point]')];
const lineNames = ['Cloud', 'Platform', 'Operations', 'Leadership'];
const lineClasses = ['line-cloud', 'line-plat', 'line-ops', 'line-lead'];
const kindToLine = { cloud: 0, platform: 1, ops: 2, people: 3 };
const ranks = [[0, 'Trainee signaller'], [8, 'Signaller'], [18, 'Senior signaller'], [30, 'Network controller'], [45, 'Platform lead']];
const nightServiceAt = 10;
let signalBest = 0;
try { signalBest = Number(localStorage.getItem('ade-signal-best')) || 0; } catch { /* no storage: best resets */ }
let signalRunning = false;
let signalScore = 0;
let signalStreak = 0;
let signalLives = 3;
let selectedPoint = 0;
let train = null;
let signalFrame = 0;
let lastFrameAt = 0;
let spawnTimer = 0;

const pad = value => String(value).padStart(3, '0');
function renderSignalHud() {
  $('#signal-score').textContent = pad(signalScore);
  $('#signal-streak').textContent = String(signalStreak);
  $('#signal-lives').textContent = '♥'.repeat(signalLives) + '♡'.repeat(3 - signalLives);
  $('#signal-best').textContent = pad(signalBest);
}
function setPoint(index, announce = true) {
  selectedPoint = index;
  branchPaths.forEach((path, pathIndex) => path.classList.toggle('set', pathIndex === index));
  pointButtons.forEach((button, buttonIndex) => button.setAttribute('aria-pressed', String(buttonIndex === index)));
  signalStage.style.setProperty('--set', `var(--${['cloud', 'plat', 'ops', 'lead'][index]})`);
  if (announce && !signalRunning) signalStatus.textContent = `Points set to ${lineNames[index]}.`;
}
function pointOnPath(path, progress) {
  const length = path.getTotalLength();
  const at = path.getPointAtLength(Math.max(0, Math.min(1, progress)) * length);
  const ahead = path.getPointAtLength(Math.min(length, Math.max(0, progress) * length + 2));
  return { x: at.x / 10, y: at.y / 4, angle: Math.atan2((ahead.y - at.y) * signalStage.clientHeight / 400, (ahead.x - at.x) * signalStage.clientWidth / 1000) * 180 / Math.PI };
}
function spawnTrain() {
  spawnTimer = 0;
  if (!signalRunning) return;
  const tools = podTools.filter(([, kind]) => kind in kindToLine);
  const [name, kind] = tools[Math.floor(Math.random() * tools.length)];
  const target = kindToLine[kind];
  const element = document.createElement('div');
  const night = signalScore >= nightServiceAt;
  element.className = `signal-train ${night ? 'night' : lineClasses[target]}`;
  element.setAttribute('aria-hidden', 'true');
  element.textContent = name;
  signalStage.append(element);
  // Trains speed up as the score rises, with a floor so it stays playable.
  const trunkTime = Math.max(1100, 2800 - signalScore * 75);
  train = { element, name, target, phase: 'trunk', progress: 0, trunkTime, branchTime: 650, branch: null };
  signalStatus.textContent = night ? `Night service: ${name} approaching. Which line?` : `${name} approaching on the ${lineNames[target]} line.`;
}
function resolveJunction() {
  train.branch = selectedPoint;
  train.phase = 'branch';
  train.progress = 0;
  if (selectedPoint === train.target) {
    signalScore++; signalStreak++;
    const bonus = signalStreak > 0 && signalStreak % 5 === 0;
    if (bonus && signalLives < 3) signalLives++;
    signalStatus.textContent = bonus ? `${train.name} on time. Five in a row: ${signalLives === 3 ? 'perfect run!' : 'a life restored.'}` : `${train.name} routed to ${lineNames[train.target]}. On time.`;
    train.element.classList.add('good');
    if (signalScore === nightServiceAt) { notify('Night service begins: no more colour hints. Know your tools.'); }
    if (signalScore === 10) window.dispatchEvent(new CustomEvent('stamp', { detail: 'signal' }));
  } else {
    signalLives--; signalStreak = 0;
    signalStatus.textContent = `Wrong line! ${train.name} runs on ${lineNames[train.target]}, not ${lineNames[selectedPoint]}.`;
    train.element.classList.add('bad');
    signalStage.classList.remove('shake'); void signalStage.offsetWidth; signalStage.classList.add('shake');
  }
  renderSignalHud();
}
function stepSignal(now) {
  signalFrame = 0;
  if (!signalRunning) return;
  const delta = Math.min(50, now - (lastFrameAt || now));
  lastFrameAt = now;
  if (train) {
    if (train.phase === 'trunk') {
      train.progress += delta / train.trunkTime;
      if (train.progress >= 1) resolveJunction();
    } else {
      train.progress += delta / train.branchTime;
    }
    const path = train.phase === 'trunk' ? trunkPath : branchPaths[train.branch];
    const point = pointOnPath(path, train.progress);
    train.element.style.left = `${point.x}%`;
    train.element.style.top = `${point.y}%`;
    train.element.style.transform = `translate(-50%, -50%) rotate(${point.angle}deg)`;
    if (train.phase === 'branch' && train.progress >= 1) {
      train.element.remove();
      train = null;
      if (signalLives <= 0) { endShift(); return; }
      spawnTimer = setTimeout(spawnTrain, 200);
    }
  }
  signalFrame = requestAnimationFrame(stepSignal);
}
function startShift() {
  signalRunning = true;
  signalScore = 0; signalStreak = 0; signalLives = 3;
  lastFrameAt = 0;
  signalStage.querySelectorAll('.signal-train').forEach(element => element.remove());
  signalOverlay.hidden = true;
  signalStage.classList.add('running');
  renderSignalHud();
  spawnTrain();
  signalFrame = requestAnimationFrame(stepSignal);
  pointButtons[selectedPoint].focus({ preventScroll: true });
}
function endShift() {
  signalRunning = false;
  cancelAnimationFrame(signalFrame); signalFrame = 0;
  clearTimeout(spawnTimer);
  signalStage.classList.remove('running');
  const newBest = signalScore > signalBest;
  if (newBest) { signalBest = signalScore; try { localStorage.setItem('ade-signal-best', String(signalBest)); } catch { /* best kept for this visit */ } }
  const rank = ranks.filter(([minimum]) => signalScore >= minimum).pop()[1];
  $('#signal-title-card').textContent = newBest && signalScore ? `New best: ${signalScore}!` : `Shift over: ${signalScore}`;
  $('#signal-message').textContent = `Rank: ${rank}. ${signalScore >= nightServiceAt ? 'You survived the night service.' : `Reach ${nightServiceAt} to unlock the night service.`}`;
  $('#signal-start').firstChild.textContent = 'Another shift ';
  signalOverlay.hidden = false;
  signalStatus.textContent = `Shift over. ${signalScore} trains on time. Rank: ${rank}.`;
  renderSignalHud();
  $('#signal-start').focus({ preventScroll: true });
}

$('#signal-start').addEventListener('click', startShift);
pointButtons.forEach((button, index) => button.addEventListener('click', () => setPoint(index)));
branchPaths.forEach((path, index) => path.addEventListener('pointerdown', () => setPoint(index)));
let signalInView = false;
new IntersectionObserver(([entry]) => { signalInView = entry.isIntersecting; }, { threshold: 0.3 }).observe(signalStage);
document.addEventListener('keydown', event => {
  if (event.target.matches('input,textarea') || document.querySelector('dialog[open]')) return;
  if (!signalRunning && !signalInView) return;
  const index = ['1', '2', '3', '4'].indexOf(event.key);
  if (index >= 0) { event.preventDefault(); setPoint(index); }
  if (!signalRunning && signalInView && event.key === 'Enter' && event.target === document.body) { event.preventDefault(); startShift(); }
});
document.addEventListener('visibilitychange', () => { lastFrameAt = 0; });
window.addEventListener('pagehide', () => { cancelAnimationFrame(signalFrame); clearTimeout(spawnTimer); });
setPoint(0, false);
renderSignalHud();
