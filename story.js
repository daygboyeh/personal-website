'use strict';
// Scroll story: one container becomes a platform. A small hand-rolled isometric renderer
// draws every pod as a box on a canvas. Each chapter is a layout, and scroll position
// tweens every pod between layouts. You can orbit the scene and break pods to watch
// them heal. Decorative only: every fact lives in the chapter text for screen readers.
const storySection = $('#top');
const storyStage = $('#story-stage');
const storyCanvas = $('#story-canvas');
const storyContext = storyCanvas.getContext('2d');
const storyChapters = [...document.querySelectorAll('.story-chapter')];
const storyStepButtons = [...document.querySelectorAll('[data-story-step]')];
const storyHudText = $('#story-hud-text');
const storyStatus = $('#story-status');
const POD_COUNT = 96;
const colours = {
  cloud: [77, 139, 255], plat: [31, 191, 127], ops: [255, 122, 69], lead: [167, 123, 255],
  steel: [201, 207, 219], alert: [255, 77, 77], amber: [255, 180, 58]
};
const namespaceColours = [colours.cloud, colours.plat, colours.ops, colours.lead];
const hudLines = [
  'kubectl get pods -A · 96 running · 4 namespaces',
  'kubectl run app --image=app:1.0 · 1/1 Running',
  'helm install app ./chart · 12/12 Ready',
  'argocd app sync app · Synced · Healthy',
  'migration complete · 43 services · 10 environments',
  'istio: retries=3 · pods self-healing',
  'kubecost: spend −20% · same platform',
  'kubectl get team · 1 lead · 2 engineers',
  'kubectl apply -f conversation.yaml'
];

// Seeded randomness keeps the city skyline identical on every visit.
function seededRandom(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const random = seededRandom(31);
const podNoise = Array.from({ length: POD_COUNT }, () => random());
const podHeights = Array.from({ length: POD_COUNT }, () => 0.4 + random() * 2.2);

// --- Layouts: each returns { pods: [...POD_COUNT specs], plates: [...] } -------------------
// Camera zoom per chapter, so a single container fills the frame as well as the whole city.
const layoutZoom = [1, 2.3, 1.75, 1.15, 1.08, 1.6, 1.45, 1.1, 1.25];
const DEFAULT_YAW = -0.35;
const pod = (x, y, z, size, height, colour, alpha = 1) => ({ x, y, z, w: size, d: size, h: height, colour, alpha });
function cityPosition(index) {
  const district = Math.floor(index / 24);
  const slot = index % 24;
  return { x: (district % 2 ? 0.9 : -6.9) + (slot % 6) * 1.2, y: (district < 2 ? -5.5 : 0.9) + Math.floor(slot / 6) * 1.2, district };
}
function hidden(index) {
  const { x, y } = cityPosition(index);
  return pod(x * 0.6, y * 0.6, -0.4, 0.3, 0.02, colours.steel, 0);
}
function fill(placed) {
  return Array.from({ length: POD_COUNT }, (_, index) => placed[index] || hidden(index));
}
const layouts = [
  function city() {
    return { pods: Array.from({ length: POD_COUNT }, (_, index) => {
      const { x, y, district } = cityPosition(index);
      return pod(x, y, 0, 0.92, podHeights[index], namespaceColours[district]);
    }), plates: [[-3.9, -3.7, 7.6, 5.2], [3.9, -3.7, 7.6, 5.2], [-3.9, 2.7, 7.6, 5.2], [3.9, 2.7, 7.6, 5.2]] };
  },
  function contain() {
    return { pods: fill([pod(0, 0, 0, 2.2, 2.2, colours.cloud)]), plates: [[0, 0, 4, 4]] };
  },
  function packageChart() {
    return { pods: fill(Array.from({ length: 12 }, (_, index) => pod(-1.8 + (index % 4) * 1.2, -1.2 + Math.floor(index / 4) * 1.2, 0, 0.9, 0.9, colours.plat))), plates: [[0, 0, 5.6, 4.4]] };
  },
  function deliver(time) {
    // A conveyor of commits rolls into a node that keeps sixteen pods in sync.
    const commits = Array.from({ length: 8 }, (_, index) => pod(-10 + ((index * 1.1 + time * 1.3) % 8.8), 0, 0, 0.62, 0.62, colours.amber));
    const synced = Array.from({ length: 16 }, (_, index) => pod(1.6 + (index % 4) * 1.15, -1.7 + Math.floor(index / 4) * 1.15, 0, 0.85, 0.5 + podNoise[index] * 1.2, colours.plat));
    return { pods: fill([...synced, ...commits]), plates: [[3.3, 0, 5.4, 5.4], [-5.6, 0, 9.4, 1.1]] };
  },
  function migrate() {
    // 19 core services (blue) and 24 microservices (green) across 10 environments.
    const slots = [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55], [0, 0]];
    const services = Array.from({ length: 43 }, (_, index) => {
      const environment = index % 10;
      const [sx, sy] = slots[Math.floor(index / 10)];
      const ex = -6 + (environment % 5) * 3;
      const ey = environment < 5 ? -1.6 : 1.6;
      return pod(ex + sx, ey + sy, Math.floor(index / 10) === 4 ? 0.75 : 0, 0.7, 0.7, index < 19 ? colours.cloud : colours.plat);
    });
    return { pods: fill(services), plates: Array.from({ length: 10 }, (_, environment) => [-6 + (environment % 5) * 3, environment < 5 ? -1.6 : 1.6, 2.5, 2.5]) };
  },
  function heal(time) {
    // A service mesh: pods crash in turn and come back on their own.
    return { pods: fill(Array.from({ length: 25 }, (_, index) => {
      const phase = (time * 0.6 + podNoise[index] * 9) % 9;
      const down = phase < 0.9;
      return pod(-2.6 + (index % 5) * 1.3, -2.6 + Math.floor(index / 5) * 1.3, 0, 0.82, down ? 0.15 : 0.6 + podNoise[index] * 0.9, down ? colours.alert : colours.ops);
    })), plates: [[0, 0, 7, 7]] };
  },
  function optimise() {
    // Thirty pods spread over five nodes consolidate onto four.
    const kept = Array.from({ length: 24 }, (_, index) => {
      const node = Math.floor(index / 6);
      return pod(-3.4 + (node % 2) * 4.4 + (index % 3) * 0.95, -2.4 + Math.floor(node / 2) * 3.6 + Math.floor((index % 6) / 3) * 0.95, 0, 0.78, 0.6 + podNoise[index] * 0.8, colours.cloud);
    });
    const released = Array.from({ length: 6 }, (_, index) => pod(5.8 + (index % 2) * 0.9, -1 + Math.floor(index / 2) * 0.9, -0.3, 0.5, 0.05, colours.amber, 0.25));
    return { pods: fill([...kept, ...released]), plates: [[-2.45, -1.95, 3.8, 2.8], [1.95, -1.95, 3.8, 2.8], [-2.45, 1.65, 3.8, 2.8], [1.95, 1.65, 3.8, 2.8]] };
  },
  function lead() {
    // A lead and two engineers: the platform never depends on one person.
    const towers = [[0, -1.2, 7, colours.lead], [-2.6, 1.4, 5, colours.cloud], [2.6, 1.4, 5, colours.plat]];
    const pods = towers.flatMap(([x, y, height, colour]) => Array.from({ length: height }, (_, level) => pod(x, y, level * 0.92, 1.3, 0.84, colour)));
    return { pods: fill(pods), plates: towers.map(([x, y]) => [x, y, 2.4, 2.4]) };
  },
  function hello() {
    // Pods line up into a wall that says hello, laid along the screen's horizontal at the default view.
    const angle = -Math.PI / 4 - DEFAULT_YAW;
    const rows = ['X..X.XXX.X', 'X..X..X..X', 'XXXX..X..X', 'X..X..X...', 'X..X.XXX.X'];
    const pods = [];
    rows.forEach((row, rowIndex) => [...row].forEach((cell, column) => {
      if (cell === 'X') pods.push(pod((column - 4.5) * Math.cos(angle) * 1.05, (column - 4.5) * Math.sin(angle) * 1.05, (4 - rowIndex) * 0.95, 0.8, 0.9, namespaceColours[Math.min(3, Math.floor(column / 2.6))]));
    }));
    return { pods: fill(pods), plates: [] };
  }
];

// --- State ---------------------------------------------------------------------------------
const storyPods = layouts[0](0).pods.map(spec => ({ ...spec, colour: [...spec.colour] }));
const brokenUntil = new Float32Array(POD_COUNT);
let storyWidth = 0;
let storyHeight = 0;
let chapterFloat = 0;
let yaw = DEFAULT_YAW;
// Where the view rests: dragging moves it; idle sway oscillates around it.
let baseYaw = DEFAULT_YAW;
let yawVelocity = 0;
let lastInteractionAt = -1e9;
let storyFrame = 0;
let storyVisible = false;
let storyClock = 0;
let lastFrameTime = 0;

const lerp = (from, to, amount) => from + (to - from) * amount;
const clamp01 = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);

function resizeStory() {
  const ratio = Math.min(2, devicePixelRatio || 1);
  storyWidth = storyStage.clientWidth;
  storyHeight = storyStage.clientHeight;
  storyCanvas.width = Math.round(storyWidth * ratio);
  storyCanvas.height = Math.round(storyHeight * ratio);
  storyContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function camera() {
  const narrow = storyWidth < 760;
  const index = Math.min(layouts.length - 2, Math.floor(chapterFloat));
  const zoom = lerp(layoutZoom[index], layoutZoom[index + 1], ease(clamp01((chapterFloat - index - 0.15) / 0.6)));
  return {
    scale: zoom * (narrow ? storyWidth / 30 : Math.min(storyWidth / 43, storyHeight / 22)),
    x: narrow ? storyWidth / 2 : storyWidth * 0.68,
    y: narrow ? storyHeight * (chapterFloat < 0.5 ? 0.25 : 0.32) : storyHeight * 0.56
  };
}
function project(x, y, z, view) {
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  const rx = x * cos - y * sin;
  const ry = x * sin + y * cos;
  return [view.x + (rx - ry) * 0.866 * view.scale, view.y + (rx + ry) * 0.5 * view.scale - z * view.scale, rx + ry];
}
function shade(colour, factor, alpha) {
  return `rgba(${colour.map(channel => Math.round(Math.min(255, channel * factor))).join(',')},${alpha})`;
}
// Side faces in world space: -y, +x, +y, -x. A face is drawn when it turns toward the viewer.
const faceNormals = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function drawBox(box, view, edgeColour) {
  const { x, y, z, w, d, h, colour, alpha } = box;
  if (alpha < 0.02) return;
  const corners = [[x - w / 2, y - d / 2], [x + w / 2, y - d / 2], [x + w / 2, y + d / 2], [x - w / 2, y + d / 2]];
  const bottom = corners.map(([cx, cy]) => project(cx, cy, z, view));
  const top = corners.map(([cx, cy]) => project(cx, cy, z + h, view));
  const cos = Math.cos(yaw), sin = Math.sin(yaw);
  faceNormals.forEach(([nx, ny], face) => {
    const rx = nx * cos - ny * sin, ry = nx * sin + ny * cos;
    if (rx + ry <= 0) return;
    const next = (face + 1) % 4;
    storyContext.beginPath();
    storyContext.moveTo(bottom[face][0], bottom[face][1]);
    storyContext.lineTo(bottom[next][0], bottom[next][1]);
    storyContext.lineTo(top[next][0], top[next][1]);
    storyContext.lineTo(top[face][0], top[face][1]);
    storyContext.closePath();
    // Light comes from the upper left, so faces turned left are brighter.
    storyContext.fillStyle = shade(colour, 0.5 + 0.22 * (ry - rx + 1.4) / 2.8, alpha);
    storyContext.fill();
  });
  storyContext.beginPath();
  top.forEach(([px, py], index) => index ? storyContext.lineTo(px, py) : storyContext.moveTo(px, py));
  storyContext.closePath();
  storyContext.fillStyle = shade(colour, 1.08, alpha);
  storyContext.fill();
  storyContext.strokeStyle = edgeColour || `rgba(255,255,255,${0.28 * alpha})`;
  storyContext.lineWidth = 1;
  storyContext.stroke();
}
function drawFloor(view) {
  storyContext.lineWidth = 1;
  storyContext.strokeStyle = 'rgba(255,255,255,0.05)';
  storyContext.beginPath();
  for (let line = -12; line <= 12; line += 1.5) {
    let [ax, ay] = project(line, -12, 0, view); let [bx, by] = project(line, 12, 0, view);
    storyContext.moveTo(ax, ay); storyContext.lineTo(bx, by);
    [ax, ay] = project(-12, line, 0, view); [bx, by] = project(12, line, 0, view);
    storyContext.moveTo(ax, ay); storyContext.lineTo(bx, by);
  }
  storyContext.stroke();
}
function drawPlates(plates, alpha, view) {
  if (alpha < 0.02) return;
  plates.forEach(([x, y, w, d]) => drawBox({ x, y, z: -0.16, w, d, h: 0.16, colour: [38, 44, 58], alpha: alpha * 0.9 }, view, `rgba(255,255,255,${0.12 * alpha})`));
}
// Traffic in the mesh chapter: packets hop between neighbouring pods.
function drawPackets(weight, view) {
  if (weight < 0.05) return;
  for (let packet = 0; packet < 14; packet++) {
    const from = Math.floor(podNoise[packet * 3] * 25);
    const across = podNoise[packet * 5 + 1] > 0.5;
    const to = across ? (from % 5 < 4 ? from + 1 : from - 1) : (from < 20 ? from + 5 : from - 5);
    const progress = (storyClock * 0.7 + podNoise[packet]) % 1;
    const x = lerp(-2.6 + (from % 5) * 1.3, -2.6 + (to % 5) * 1.3, progress);
    const y = lerp(-2.6 + Math.floor(from / 5) * 1.3, -2.6 + Math.floor(to / 5) * 1.3, progress);
    const [px, py] = project(x, y, 0.15, view);
    storyContext.beginPath();
    storyContext.arc(px, py, 3.2, 0, Math.PI * 2);
    storyContext.fillStyle = `rgba(255,214,140,${0.9 * weight})`;
    storyContext.fill();
  }
}

function chapterProgress() {
  const bounds = storySection.getBoundingClientRect();
  const travel = Math.max(1, storySection.offsetHeight - innerHeight);
  return clamp01(-bounds.top / travel) * (layouts.length - 1);
}
let shownChapter = -1;
function syncChapterUi(chapter) {
  if (chapter === shownChapter) return;
  shownChapter = chapter;
  storyHudText.textContent = hudLines[chapter];
  storyStepButtons.forEach((button, index) => { if (index === chapter) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
}
function renderStory(now) {
  storyFrame = 0;
  const delta = Math.min(50, now - (lastFrameTime || now));
  lastFrameTime = now;
  if (!motionPaused) storyClock += delta / 1000;
  chapterFloat = chapterProgress();
  syncHeaderTheme();
  const index = Math.min(layouts.length - 2, Math.floor(chapterFloat));
  const blend = chapterFloat - index;
  syncChapterUi(Math.round(chapterFloat));
  const from = layouts[index](storyClock);
  const to = layouts[index + 1](storyClock);
  // Idle drift and drag inertia, both off when motion is paused.
  if (!motionPaused) {
    baseYaw += yawVelocity; yaw += yawVelocity; yawVelocity *= 0.92;
    if (now - lastInteractionAt > 2500) {
      // The finale turns back face-on so the wall reads clearly.
      const finale = clamp01(chapterFloat - 7);
      const rest = lerp(baseYaw, DEFAULT_YAW, finale) + Math.sin(storyClock * 0.2) * 0.15 * (1 - finale * 0.8);
      yaw = lerp(yaw, rest, 0.03);
    }
  }
  const follow = motionPaused ? 1 : 0.16;
  storyPods.forEach((current, podIndex) => {
    // Each pod starts its move a little later than the last, so layouts ripple.
    const local = ease(clamp01((blend - 0.18 - podNoise[podIndex] * 0.22) / 0.42));
    const a = from.pods[podIndex], b = to.pods[podIndex];
    ['x', 'y', 'z', 'w', 'd', 'h', 'alpha'].forEach(key => { current[key] = lerp(current[key], lerp(a[key], b[key], local), follow); });
    current.colour = current.colour.map((channel, c) => lerp(channel, lerp(a.colour[c], b.colour[c], local), follow));
  });
  storyContext.clearRect(0, 0, storyWidth, storyHeight);
  const view = camera();
  drawFloor(view);
  const plateBlend = ease(clamp01((blend - 0.2) / 0.5));
  drawPlates(from.plates, 1 - plateBlend, view);
  drawPlates(to.plates, plateBlend, view);
  const depthOf = box => project(box.x, box.y, 0, view)[2] + box.z * 0.01;
  const drawn = storyPods.map((box, podIndex) => {
    if (brokenUntil[podIndex] > now) {
      const left = (brokenUntil[podIndex] - now) / 1600;
      return { ...box, colour: colours.alert, h: box.h * (left > 0.5 ? 0.25 : lerp(1, 0.25, left * 2)), z: box.z };
    }
    return box;
  }).sort((a, b) => depthOf(a) - depthOf(b));
  drawn.forEach(box => drawBox(box, view));
  drawPackets(Math.max(0, 1 - Math.abs(chapterFloat - 5)), view);
  const animating = !motionPaused || brokenUntil.some(until => until > now);
  if (storyVisible && animating) storyFrame = requestAnimationFrame(renderStory);
}
function queueStory() { if (!storyFrame && storyVisible) storyFrame = requestAnimationFrame(renderStory); }

// --- Interaction: drag to orbit, click or Enter to break a pod --------------------------------
function podAt(clientX, clientY) {
  const bounds = storyCanvas.getBoundingClientRect();
  const px = clientX - bounds.left, py = clientY - bounds.top;
  const view = camera();
  let hit = -1, hitDepth = -Infinity;
  storyPods.forEach((box, podIndex) => {
    if (box.alpha < 0.5) return;
    const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(([sx, sy]) => [box.z, box.z + box.h].map(z => project(box.x + sx * box.w / 2, box.y + sy * box.d / 2, z, view)));
    const xs = points.map(point => point[0]), ys = points.map(point => point[1]);
    if (px < Math.min(...xs) || px > Math.max(...xs) || py < Math.min(...ys) || py > Math.max(...ys)) return;
    const depth = points[0][2] + box.z * 0.01;
    if (depth > hitDepth) { hit = podIndex; hitDepth = depth; }
  });
  return hit;
}
let crashCount = 0;
function breakPod(podIndex) {
  if (podIndex < 0) return;
  brokenUntil[podIndex] = performance.now() + 1600;
  crashCount++;
  storyStatus.textContent = `Pod ${podIndex + 1} crashed. Restarting… the platform heals itself.`;
  if (crashCount === 3) notify('Three pods down, three pods back. That’s what self-healing is for.');
  if (motionPaused) setTimeout(queueStory, 1650);
  queueStory();
}
let storyDrag = null;
storyCanvas.addEventListener('pointerdown', event => {
  storyDrag = { x: event.clientX, y: event.clientY, moved: false, last: event.clientX };
  storyCanvas.setPointerCapture(event.pointerId);
});
storyCanvas.addEventListener('pointermove', event => {
  if (!storyDrag) return;
  if (Math.abs(event.clientX - storyDrag.x) > 5) storyDrag.moved = true;
  const step = (event.clientX - storyDrag.last) * 0.008;
  storyDrag.last = event.clientX;
  yaw += step; baseYaw += step; yawVelocity = motionPaused ? 0 : step * 0.6;
  lastInteractionAt = performance.now();
  queueStory();
});
storyCanvas.addEventListener('pointerup', event => {
  if (storyDrag && !storyDrag.moved) breakPod(podAt(event.clientX, event.clientY));
  storyDrag = null;
});
storyCanvas.addEventListener('pointercancel', () => { storyDrag = null; });
storyCanvas.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    const turn = event.key === 'ArrowLeft' ? -0.2 : 0.2;
    yaw += turn; baseYaw += turn;
    lastInteractionAt = performance.now();
    queueStory();
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const visible = storyPods.map((box, podIndex) => box.alpha > 0.5 ? podIndex : -1).filter(podIndex => podIndex >= 0);
    breakPod(visible[Math.floor(Math.random() * visible.length)]);
  }
});
storyStepButtons.forEach((button, index) => button.addEventListener('click', () => {
  scrollTo({ top: storySection.offsetTop + (storySection.offsetHeight - innerHeight) * index / (layouts.length - 1), behavior: motionPaused ? 'instant' : 'smooth' });
}));

// The header turns dark while it sits over the scene.
function syncHeaderTheme() {
  siteHeader.classList.toggle('over-dark', storySection.getBoundingClientRect().bottom > siteHeader.offsetHeight);
}
new IntersectionObserver(([entry]) => {
  storyVisible = entry.isIntersecting;
  if (storyVisible) { lastFrameTime = 0; queueStory(); } else { cancelAnimationFrame(storyFrame); storyFrame = 0; }
}).observe(storySection);
addEventListener('scroll', () => { syncHeaderTheme(); queueStory(); }, { passive: true });
addEventListener('resize', () => { resizeStory(); queueStory(); });
window.addEventListener('motionchange', queueStory);
window.addEventListener('pagehide', () => cancelAnimationFrame(storyFrame));
resizeStory();
syncHeaderTheme();
queueStory();
