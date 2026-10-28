'use strict';
// The cluster: every tool is a throwable pod-critter with simple circle physics.
// The loop sleeps once pods settle, stops offscreen, and falls back to a static
// grid when decorative motion is off.
const clusterStage = $('#cluster-stage');
const clusterStatus = $('#cluster-status');
const podKinds = {
  cloud: 'Cloud', platform: 'Platform', ops: 'Operations', people: 'Leadership', you: 'Visitor'
};
const podTools = [
  ['AWS', 'cloud', 'My strongest cloud depth, with EKS at the core.'],
  ['Azure', 'cloud', 'End-to-end Azure platform delivery, from architecture to production.'],
  ['EKS', 'cloud', 'Managed Kubernetes on AWS, including Istio with automatic retries.'],
  ['AKS', 'cloud', 'Azure Kubernetes Service, delivered end to end.'],
  ['OpenShift', 'cloud', 'Red Hat OpenShift and ROSA for enterprise and customer-hosted estates.'],
  ['Kubernetes', 'platform', 'The common ground across every cloud I work in.'],
  ['Terraform', 'platform', 'Reusable infrastructure as code. HashiCorp certified.'],
  ['Helm', 'platform', 'Reusable charts cut manual configuration by 75%.'],
  ['Argo CD', 'platform', 'GitOps releases that cut deployment time by 30%.'],
  ['Docker', 'platform', 'Containers for ~30 enterprise microservices.'],
  ['Istio', 'platform', 'Service mesh retries that reduced downtime by 20%.'],
  ['Ansible', 'platform', 'Configuration that stays consistent.'],
  ['Jenkins', 'platform', 'CI/CD that connects the platform to the engineering workflow.'],
  ['Prometheus', 'ops', 'Metrics that make performance visible.'],
  ['Grafana', 'ops', 'Dashboards people actually look at.'],
  ['Datadog', 'ops', 'Observability across services and infrastructure.'],
  ['Kafka', 'ops', 'Diagnosed in production, alongside Kubernetes and networking.'],
  ['Cassandra', 'ops', 'Distributed data, kept healthy in production.'],
  ['Kubecost', 'ops', 'Cost visibility that lowered cloud spend by 20%.'],
  ['Mentoring', 'people', 'Building capability that lasts beyond a single specialist.'],
  ['Design reviews', 'people', 'Clear decisions before code reaches production.'],
  ['Hiring', 'people', 'Technical interviews and growing the team.'],
  ['Customers', 'people', 'Clarity on technical risk and delivery for senior stakeholders.']
];
const youPod = ['you', 'you', 'That’s you. Thanks for joining the cluster.'];
const maxPods = () => innerWidth < 700 ? 30 : 40;
const pods = [];
let stageWidth = 0;
let stageHeight = 0;
let pointer = null;
let lastPointerAt = 0;
let drag = null;
let clusterFrame = 0;
let clusterInView = false;
let clusterStarted = false;
let youJoined = false;

function podRadius(name) {
  const radius = Math.max(34, Math.min(54, 26 + name.length * 3));
  return innerWidth < 700 ? radius * 0.7 : radius;
}
function makePod(tool, replica = false) {
  const [name, kind, note] = tool;
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `pod pod-${kind}${replica ? ' replica' : ''}`;
  element.setAttribute('aria-label', `${name}, ${podKinds[kind]}. ${note}`);
  const face = document.createElement('span');
  face.className = 'pod-face';
  face.setAttribute('aria-hidden', 'true');
  const pupils = [0, 1].map(() => {
    const eye = document.createElement('span'); eye.className = 'pod-eye';
    const pupil = document.createElement('span'); pupil.className = 'pod-pupil';
    eye.append(pupil); face.append(eye); return pupil;
  });
  const label = document.createElement('span');
  label.className = 'pod-name';
  label.textContent = name;
  element.append(face, label);
  element.style.setProperty('--blink-delay', `${(Math.random() * 6).toFixed(2)}s`);
  const r = podRadius(name);
  element.style.width = element.style.height = `${r * 2}px`;
  const pod = { element, pupils, name, kind, note, replica, r, x: r + Math.random() * Math.max(1, stageWidth - r * 2), y: -r - Math.random() * 400, vx: (Math.random() - 0.5) * 4, vy: 0, justDragged: false };
  element.addEventListener('pointerdown', event => startDrag(event, pod));
  element.addEventListener('click', () => { if (!pod.justDragged) inspectPod(pod); pod.justDragged = false; });
  clusterStage.append(element);
  pods.push(pod);
  updatePodCount();
  return pod;
}
function updatePodCount() {
  $('#cluster-count').textContent = `${pods.length} PODS RUNNING`;
}
function inspectPod(pod) {
  clusterStatus.textContent = `${pod.name} · ${podKinds[pod.kind]} — ${pod.note}`;
  pod.vy = -9; pod.vx += (Math.random() - 0.5) * 4;
  pod.element.classList.remove('hop'); void pod.element.offsetWidth; pod.element.classList.add('hop');
  wakeCluster();
}
function measureStage() {
  stageWidth = clusterStage.clientWidth;
  stageHeight = clusterStage.clientHeight;
}
function stagePoint(event) {
  const bounds = clusterStage.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}
function startDrag(event, pod) {
  if (motionPaused) return;
  const point = stagePoint(event);
  drag = { pod, dx: pod.x - point.x, dy: pod.y - point.y, startX: point.x, startY: point.y, moved: false };
  pod.element.setPointerCapture(event.pointerId);
  pod.element.classList.add('grabbed');
  wakeCluster();
}
clusterStage.addEventListener('pointermove', event => {
  pointer = stagePoint(event);
  lastPointerAt = performance.now();
  if (drag) {
    const { pod } = drag;
    const x = pointer.x + drag.dx;
    const y = pointer.y + drag.dy;
    if (Math.hypot(pointer.x - drag.startX, pointer.y - drag.startY) > 5) drag.moved = true;
    pod.vx = (x - pod.x) * 0.6 + pod.vx * 0.4;
    pod.vy = (y - pod.y) * 0.6 + pod.vy * 0.4;
    pod.x = x; pod.y = y;
  }
  wakeCluster();
});
clusterStage.addEventListener('pointerleave', () => { pointer = null; });
function endDrag() {
  if (!drag) return;
  drag.pod.justDragged = drag.moved;
  drag.pod.element.classList.remove('grabbed');
  if (drag.moved) { clusterStatus.textContent = `${drag.pod.name} rescheduled. Wheee.`; window.dispatchEvent(new CustomEvent('stamp', { detail: 'throw' })); }
  drag = null;
}
clusterStage.addEventListener('pointerup', endDrag);
clusterStage.addEventListener('pointercancel', endDrag);

function stepCluster() {
  clusterFrame = 0;
  let energy = 0;
  for (const pod of pods) {
    if (drag && drag.pod === pod) continue;
    pod.vy += 0.42;
    pod.vx *= 0.993; pod.vy *= 0.993;
    pod.x += pod.vx; pod.y += pod.vy;
    if (pod.x < pod.r) { pod.x = pod.r; pod.vx = Math.abs(pod.vx) * 0.6; }
    if (pod.x > stageWidth - pod.r) { pod.x = stageWidth - pod.r; pod.vx = -Math.abs(pod.vx) * 0.6; }
    if (pod.y > stageHeight - pod.r) { pod.y = stageHeight - pod.r; pod.vy = -Math.abs(pod.vy) * 0.45; pod.vx *= 0.9; }
  }
  // Resolve overlaps a few times so stacks settle instead of sinking into each other.
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < pods.length; i++) for (let j = i + 1; j < pods.length; j++) {
      const a = pods[i], b = pods[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.01;
      const overlap = a.r + b.r - distance;
      if (overlap <= 0) continue;
      const nx = dx / distance, ny = dy / distance;
      const aFixed = drag && drag.pod === a, bFixed = drag && drag.pod === b;
      const share = aFixed || bFixed ? 1 : 0.5;
      if (!aFixed) { a.x -= nx * overlap * share; a.y -= ny * overlap * share; }
      if (!bFixed) { b.x += nx * overlap * share; b.y += ny * overlap * share; }
      const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (closing < 0) {
        const impulse = -closing * 0.75;
        if (!aFixed) { a.vx -= nx * impulse * share; a.vy -= ny * impulse * share; }
        if (!bFixed) { b.vx += nx * impulse * share; b.vy += ny * impulse * share; }
      }
    }
  }
  for (const pod of pods) {
    if (pod.y > stageHeight - pod.r) pod.y = stageHeight - pod.r;
    energy = Math.max(energy, Math.abs(pod.vx) + Math.abs(pod.vy > 0.5 ? pod.vy : 0));
    pod.element.style.transform = `translate(${pod.x - pod.r}px, ${pod.y - pod.r}px) rotate(${Math.max(-25, Math.min(25, pod.vx * 3))}deg)`;
    const lookX = pointer ? pointer.x - pod.x : pod.vx * 4;
    const lookY = pointer ? pointer.y - pod.y : pod.vy * 4;
    const lookLength = Math.hypot(lookX, lookY) || 1;
    const offset = Math.min(3, lookLength / 30);
    const pupilTransform = `translate(${(lookX / lookLength) * offset}px, ${(lookY / lookLength) * offset}px)`;
    pod.pupils[0].style.transform = pod.pupils[1].style.transform = pupilTransform;
  }
  const settled = energy < 0.15 && !drag && performance.now() - lastPointerAt > 600;
  if (!settled && clusterInView && !motionPaused) clusterFrame = requestAnimationFrame(stepCluster);
}
function wakeCluster() {
  if (!clusterFrame && clusterInView && !motionPaused) clusterFrame = requestAnimationFrame(stepCluster);
}

function addYou() {
  if (youJoined) return;
  youJoined = true;
  makePod(youPod);
  clusterStatus.textContent = 'A new pod joined the cluster: you.';
  wakeCluster();
}
function scaleUp(count = 1) {
  let added = 0;
  for (let index = 0; index < count && pods.length < maxPods(); index++, added++) {
    const tool = podTools[Math.floor(Math.random() * podTools.length)];
    makePod(tool, true);
  }
  clusterStatus.textContent = added ? `Scaled up by ${added}. ${pods.length} pods running.` : 'This node is at capacity. Time to add another node.';
  wakeCluster();
}
function chaosMonkey() {
  if (!pods.length) return;
  const victim = pods[Math.floor(Math.random() * pods.length)];
  victim.element.classList.add('crashed');
  window.dispatchEvent(new CustomEvent('stamp', { detail: 'chaos' }));
  clusterStatus.textContent = `${victim.name}: CrashLoopBackOff…`;
  pods.forEach(pod => { pod.vx += (Math.random() - 0.5) * 18; pod.vy -= 4 + Math.random() * 12; });
  wakeCluster();
  setTimeout(() => {
    victim.element.classList.remove('crashed');
    clusterStatus.textContent = `${victim.name} restarted itself. Running again ✓`;
  }, 1600);
}
function tidyCluster() {
  for (let index = pods.length - 1; index >= 0; index--) {
    if (pods[index].replica) { pods[index].element.remove(); pods.splice(index, 1); }
  }
  pods.forEach(pod => { pod.x = pod.r + Math.random() * Math.max(1, stageWidth - pod.r * 2); pod.y = -pod.r - Math.random() * 300; pod.vx = 0; pod.vy = 0; });
  updatePodCount();
  clusterStatus.textContent = 'Replicas removed. Back to one of each.';
  wakeCluster();
}
$('#cluster-scale').addEventListener('click', () => scaleUp(3));
$('#cluster-chaos').addEventListener('click', chaosMonkey);
$('#cluster-tidy').addEventListener('click', tidyCluster);

function syncClusterMotion() {
  clusterStage.classList.toggle('cluster-static', motionPaused);
  if (motionPaused) {
    cancelAnimationFrame(clusterFrame); clusterFrame = 0; endDrag();
    pods.forEach(pod => { pod.element.style.transform = ''; });
  } else {
    pods.forEach(pod => { pod.y = Math.min(pod.y, -pod.r); });
    wakeCluster();
  }
}
window.addEventListener('motionchange', syncClusterMotion);
new ResizeObserver(() => { measureStage(); wakeCluster(); }).observe(clusterStage);
const clusterObserver = new IntersectionObserver(([entry]) => {
  clusterInView = entry.isIntersecting;
  if (!clusterInView) { cancelAnimationFrame(clusterFrame); clusterFrame = 0; return; }
  if (!clusterStarted) {
    clusterStarted = true;
    measureStage();
    podTools.forEach(tool => makePod(tool));
    setTimeout(addYou, 1800);
  }
  wakeCluster();
}, { threshold: 0.15 });
clusterObserver.observe(clusterStage);
window.addEventListener('clusterchaos', () => setTimeout(chaosMonkey, 600));
window.addEventListener('pagehide', () => { cancelAnimationFrame(clusterFrame); clusterObserver.disconnect(); });

// ↑ ↑ ↓ ↓ ← → ← → B A: free replicas for anyone who remembers.
const konami = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let konamiIndex = 0;
document.addEventListener('keydown', event => {
  if (event.target.matches('input,textarea')) return;
  const key = event.key.toLowerCase();
  konamiIndex = key === konami[konamiIndex] ? konamiIndex + 1 : key === konami[0] ? 1 : 0;
  if (konamiIndex < konami.length) return;
  konamiIndex = 0;
  notify('Cheat code accepted. Raining replicas.');
  window.dispatchEvent(new CustomEvent('stamp', { detail: 'secret' }));
  clusterStage.scrollIntoView({ behavior: motionPaused ? 'instant' : 'smooth', block: 'center' });
  setTimeout(() => scaleUp(12), 500);
});
