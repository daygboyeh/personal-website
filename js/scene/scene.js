// The cluster scene: one fixed WebGL canvas behind all five acts. Each "stop" pins a pod
// layout and a camera to an element on the page; scrolling tweens pods and camera between
// stops. The one interaction: break a pod (click empty space, or the HUD button) and watch
// it heal. Decorative only: every fact is in the page text.
import * as THREE from '../../vendor/three.module.min.js';
import { POD_COUNT, PLATE_COUNT, COLOURS, podNoise, layouts } from './layouts.js';
import { isMotionPaused, onMotionChange } from '../motion.js';

// [anchor selector, layout, camera, opacity on desktop, opacity on phones, scene side]
const STOP_SPECS = [
  ['#top', 'city', { dist: 40, elev: 0.62, yaw: -0.75, ty: 0 }, 1, 1, 'right'],
  ['#proof .beat:nth-child(1)', 'contain', { dist: 15, elev: 0.55, yaw: -0.7, ty: 0.9 }, 1, 0.2, 'right'],
  ['#proof .beat:nth-child(2)', 'packaged', { dist: 17, elev: 0.68, yaw: -0.8, ty: 0.3 }, 1, 0.2, 'right'],
  ['#proof .beat:nth-child(3)', 'migrate', { dist: 34, elev: 0.75, yaw: -0.6, ty: 0 }, 1, 0.2, 'right'],
  ['#proof .beat:nth-child(4)', 'heal', { dist: 22, elev: 0.7, yaw: -0.9, ty: 0.2 }, 1, 0.2, 'right'],
  ['#proof .beat:nth-child(5)', 'throughput', { dist: 24, elev: 0.5, yaw: -0.35, ty: 0.4 }, 1, 0.2, 'right'],
  ['#work', 'city', { dist: 36, elev: 0.8, yaw: -1.1, ty: 0 }, 0.18, 0.12, 'centre'],
  ['#leadership', 'lead', { dist: 21, elev: 0.42, yaw: -0.8, ty: 2.8 }, 0.22, 0.14, 'centre'],
  ['#record', 'career', { dist: 19, elev: 0.38, yaw: -0.45, ty: 2.2 }, 0.22, 0.14, 'centre'],
  ['#contact', 'hello', { dist: 27, elev: 0.16, yaw: 0, ty: 2.1 }, 1, 0.5, 'right']
];
const HEAL_MS = 1600;

export function startScene() {
  const host = document.querySelector('.scene');
  const canvas = document.getElementById('scene-canvas');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return false; // No WebGL: the page already works as text.
  }
  const narrowQuery = matchMedia('(max-width: 760px)');
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
  renderer.shadowMap.enabled = !lowPower;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0d12, 30, 70);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x0b0d12, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-10, 18, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 });
  sun.shadow.radius = 4;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x5b93ff, 0.6);
  rim.position.set(12, 6, -10);
  scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ opacity: 0.35 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(60, 40, 0x2a3040, 0x1a1f2a);
  grid.position.y = -0.17;
  scene.add(grid);

  // Unit boxes with their base at y = 0, so scaling grows them upward.
  const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const podMesh = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.08 }), POD_COUNT);
  podMesh.castShadow = true;
  podMesh.receiveShadow = true;
  podMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(podMesh);
  const plateMesh = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ color: 0x1c2230, roughness: 0.9 }), PLATE_COUNT);
  plateMesh.receiveShadow = true;
  scene.add(plateMesh);

  // A ring that pulses out from a crashed pod.
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.75, 48), new THREE.MeshBasicMaterial({ color: COLOURS.alert, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  pulse.rotation.x = -Math.PI / 2;
  scene.add(pulse);

  const stops = STOP_SPECS.map(([selector, layout, cam, opacity, mobileOpacity, side]) => ({ element: document.querySelector(selector), layout: layouts[layout], cam, opacity, mobileOpacity, side })).filter(stop => stop.element);
  const current = Array.from({ length: POD_COUNT }, () => ({ x: 0, y: 0, z: 0, w: 0.001, d: 0.001, h: 0.001, colour: new THREE.Color(COLOURS.steel) }));
  const brokenAt = new Float64Array(POD_COUNT);
  const matrix = new THREE.Matrix4();
  const scratchColour = new THREE.Color();
  const fromColour = new THREE.Color();
  const toColour = new THREE.Color();
  let anchors = [];
  let width = 0, height = 0;
  let clock = 0, lastFrame = 0, frame = 0, visible = true, firstFrame = true;
  let userYaw = 0, yawVelocity = 0, lastDragAt = -1e9;

  const clamp01 = value => Math.min(1, Math.max(0, value));
  const ease = value => value * value * (3 - 2 * value);
  const lerp = (a, b, t) => a + (b - a) * t;

  function measure() {
    width = host.clientWidth; height = host.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Anchor = the scroll position where the element's top reaches 45% of the viewport.
    anchors = stops.map((stop, index) => index === 0 ? 0 : stop.element.getBoundingClientRect().top + scrollY - innerHeight * 0.45);
  }
  function stopPosition() {
    let index = 0;
    while (index < anchors.length - 2 && scrollY >= anchors[index + 1]) index++;
    const span = Math.max(1, anchors[index + 1] - anchors[index]);
    // Hold each layout for the first part of its span, then morph to the next.
    return { index, blend: ease(clamp01(((scrollY - anchors[index]) / span - 0.35) / 0.55)) };
  }

  function render(now) {
    frame = 0;
    const paused = isMotionPaused();
    const delta = Math.min(50, now - (lastFrame || now));
    lastFrame = now;
    if (!paused) clock += delta / 1000;
    const narrow = narrowQuery.matches;
    const { index, blend } = stopPosition();
    const from = stops[index], to = stops[Math.min(index + 1, stops.length - 1)];
    const a = from.layout(clock), b = to.layout(clock);
    const follow = paused || firstFrame ? 1 : 0.14;
    firstFrame = false;

    current.forEach((state, podIndex) => {
      // Pods move with a slight per-pod delay, so changes ripple across the cluster.
      const local = ease(clamp01((blend - podNoise[podIndex] * 0.25) / 0.75));
      const pa = a.pods[podIndex], pb = b.pods[podIndex];
      for (const key of ['x', 'y', 'z', 'w', 'd', 'h']) state[key] = lerp(state[key], lerp(pa[key], pb[key], local), follow);
      fromColour.setHex(pa.colour); toColour.setHex(pb.colour);
      state.colour.lerp(scratchColour.copy(fromColour).lerp(toColour, local), follow);
      let { h } = state;
      let colour = state.colour;
      const sinceBreak = now - brokenAt[podIndex];
      if (sinceBreak < HEAL_MS) {
        // Crash, flatten, then pop back a little taller before settling.
        const t = sinceBreak / HEAL_MS;
        h *= t < 0.55 ? lerp(1, 0.18, Math.min(1, t * 4)) : lerp(0.18, 1, ease((t - 0.55) / 0.45)) + Math.sin(clamp01((t - 0.75) / 0.25) * Math.PI) * 0.15;
        colour = t < 0.7 ? scratchColour.setHex(COLOURS.alert) : state.colour;
      }
      matrix.makeScale(state.w, Math.max(0.001, h), state.d).setPosition(state.x, state.z, state.y);
      podMesh.setMatrixAt(podIndex, matrix);
      podMesh.setColorAt(podIndex, colour);
    });
    podMesh.instanceMatrix.needsUpdate = true;
    podMesh.instanceColor.needsUpdate = true;

    const plateBlend = ease(clamp01((blend - 0.2) / 0.6));
    for (let plate = 0; plate < PLATE_COUNT; plate++) {
      const source = plateBlend < 0.5 ? a.plates : b.plates;
      const spec = source[plate];
      const shrink = 1 - Math.abs(plateBlend - 0.5) * 2; // plates dip out and back in mid-morph
      if (spec) matrix.makeScale(spec[2], 0.16 * (1 - shrink * 0.9), spec[3]).setPosition(spec[0], -0.16, spec[1]);
      else matrix.makeScale(0.001, 0.001, 0.001);
      plateMesh.setMatrixAt(plate, matrix);
    }
    plateMesh.instanceMatrix.needsUpdate = true;

    // Camera: orbit the target; idle sway when motion is on; drag adds to the yaw.
    if (!paused) { userYaw += yawVelocity; yawVelocity *= 0.92; }
    const sway = paused || now - lastDragAt < 3000 ? 0 : Math.sin(clock * 0.18) * 0.12;
    const cam = {};
    for (const key of ['dist', 'elev', 'yaw', 'ty']) cam[key] = lerp(from.cam[key], to.cam[key], blend);
    const yaw = cam.yaw + userYaw + sway;
    const dist = cam.dist * (narrow ? 1.25 : 1);
    camera.position.set(Math.sin(yaw) * Math.cos(cam.elev) * dist, cam.ty + Math.sin(cam.elev) * dist, Math.cos(yaw) * Math.cos(cam.elev) * dist);
    camera.lookAt(0, cam.ty, 0);
    // Push the scene right of the text on wide screens, and up on phones.
    const sideShift = (stop => stop.side === 'right' ? 1 : 0);
    const shift = lerp(sideShift(from), sideShift(to), blend);
    if (narrow) camera.setViewOffset(width, height, 0, height * 0.2 * shift * (index === 0 ? 1 - blend : 0), width, height);
    else camera.setViewOffset(width, height, -width * 0.24 * shift, 0, width, height);
    camera.updateProjectionMatrix();

    const opacity = lerp(narrow ? from.mobileOpacity : from.opacity, narrow ? to.mobileOpacity : to.opacity, blend);
    host.style.opacity = String(opacity);

    const pulseAge = now - pulse.userData.at;
    pulse.material.opacity = pulseAge < 900 ? 0.8 * (1 - pulseAge / 900) : 0;
    pulse.scale.setScalar(1 + pulseAge / 300);

    renderer.render(scene, camera);
    const animating = !paused || brokenAt.some(at => now - at < HEAL_MS) || pulseAge < 900 || Math.abs(yawVelocity) > 1e-4;
    if (visible && animating) queue();
  }
  function queue() { if (!frame) frame = requestAnimationFrame(render); }

  // --- The interaction -------------------------------------------------------------------
  const readyText = document.getElementById('hud-ready');
  const uptimeText = document.getElementById('hud-uptime');
  const status = document.getElementById('scene-status');
  const sessionStart = performance.now();
  let restarts = 0, downtime = 0;
  function visiblePods() {
    const { index, blend } = stopPosition();
    const layout = (blend < 0.5 ? stops[index] : stops[Math.min(index + 1, stops.length - 1)]).layout(clock);
    return layout.pods.map((spec, podIndex) => spec.visible ? podIndex : -1).filter(podIndex => podIndex >= 0);
  }
  function breakPod(podIndex) {
    if (podIndex < 0 || performance.now() - brokenAt[podIndex] < HEAL_MS) return;
    const now = performance.now();
    brokenAt[podIndex] = now;
    restarts++; downtime += HEAL_MS * 0.7;
    const state = current[podIndex];
    pulse.position.set(state.x, 0.02, state.y);
    pulse.userData.at = now;
    status.textContent = `Pod ${podIndex + 1} crashed. Restarting.`;
    updateHud();
    setTimeout(() => { status.textContent = `Pod ${podIndex + 1} is back. Restarts: ${restarts}.`; updateHud(); }, HEAL_MS);
    queue();
  }
  function updateHud() {
    const now = performance.now();
    const down = brokenAt.filter(at => now - at < HEAL_MS * 0.7).length;
    const total = visiblePods().length;
    readyText.textContent = `${total - down}/${total} ready`;
    uptimeText.textContent = `uptime ${(100 * (1 - downtime / (POD_COUNT * Math.max(1, now - sessionStart)))).toFixed(3)}% · ${restarts} restarts`;
  }
  pulse.userData.at = -1e9;
  document.getElementById('break-pod').addEventListener('click', () => {
    const candidates = visiblePods();
    breakPod(candidates[Math.floor(Math.random() * candidates.length)]);
  });

  // Clicks and drags on empty background reach the scene; anything readable or interactive doesn't.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const ignore = 'a,button,input,label,dialog,.case,.beat h3,.beat p,p,h1,h2,h3,li,dl,blockquote,.site-header,.scene-hud';
  let drag = null;
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest(ignore)) return;
    drag = { x: event.clientX, last: event.clientX, moved: false, touch: event.pointerType === 'touch' };
  });
  document.addEventListener('pointermove', event => {
    if (!drag || drag.touch) return;
    if (Math.abs(event.clientX - drag.x) > 5) drag.moved = true;
    if (!drag.moved) return;
    const step = (event.clientX - drag.last) * 0.006;
    drag.last = event.clientX;
    userYaw -= step; yawVelocity = isMotionPaused() ? 0 : -step * 0.5;
    lastDragAt = performance.now();
    queue();
  });
  document.addEventListener('pointerup', event => {
    if (drag && !drag.moved) {
      pointer.set(event.clientX / width * 2 - 1, -(event.clientY / height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(podMesh)[0];
      if (hit) breakPod(hit.instanceId);
    }
    drag = null;
  });

  // --- Lifecycle --------------------------------------------------------------------------
  measure();
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { measure(); queue(); });
  new ResizeObserver(() => { measure(); queue(); }).observe(document.body);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; lastFrame = 0; if (visible) queue(); });
  onMotionChange(() => { lastFrame = 0; queue(); });
  setInterval(() => { if (visible) updateHud(); }, 1000);
  updateHud();
  document.documentElement.classList.add('scene-on');
  document.getElementById('scene-hud').hidden = false;
  queue();
  return true;
}
