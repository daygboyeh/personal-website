// Pod layouts for each stop of the page. Pure data: every layout returns pod boxes on a
// ground plane (x, y), raised by z, sized w × d × h, plus flat node "plates" underneath.
// The renderer tweens every pod from one stop's layout to the next as you scroll.
export const POD_COUNT = 96;
export const PLATE_COUNT = 12;

export const COLOURS = {
  cloud: 0x5b93ff, plat: 0x2fc78a, ops: 0xff8552, lead: 0xad86ff,
  steel: 0xb9c0cc, alert: 0xff4d4d, signal: 0xffb43a
};
const namespaces = [COLOURS.cloud, COLOURS.plat, COLOURS.ops, COLOURS.lead];

// Seeded randomness keeps the skyline identical on every visit.
function seeded(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const random = seeded(31);
export const podNoise = Array.from({ length: POD_COUNT }, () => random());
const podHeights = Array.from({ length: POD_COUNT }, () => 0.4 + random() * 2.2);

const pod = (x, y, z, size, height, colour, depth = size) => ({ x, y, z, w: size, d: depth, h: height, colour, visible: true });
function cityPosition(index) {
  const district = Math.floor(index / 24);
  const slot = index % 24;
  return { x: (district % 2 ? 0.9 : -6.9) + (slot % 6) * 1.2, y: (district < 2 ? -5.5 : 0.9) + Math.floor(slot / 6) * 1.2, district };
}
// Unused pods shrink to nothing near their city spot, so they grow back from there.
function hidden(index) {
  const { x, y } = cityPosition(index);
  return { ...pod(x * 0.5, y * 0.5, 0, 0.001, 0.001, COLOURS.steel), visible: false };
}
const fill = placed => Array.from({ length: POD_COUNT }, (_, index) => placed[index] || hidden(index));

function city() {
  return {
    pods: Array.from({ length: POD_COUNT }, (_, index) => {
      const { x, y, district } = cityPosition(index);
      return pod(x, y, 0, 0.92, podHeights[index], namespaces[district]);
    }),
    plates: [[-3.9, -3.7, 7.6, 5.2], [3.9, -3.7, 7.6, 5.2], [-3.9, 2.7, 7.6, 5.2], [3.9, 2.7, 7.6, 5.2]]
  };
}
function contain() {
  return { pods: fill([pod(0, 0, 0, 2.2, 2.2, COLOURS.cloud)]), plates: [[0, 0, 4, 4]] };
}
function packaged() {
  return { pods: fill(Array.from({ length: 12 }, (_, index) => pod(-1.8 + (index % 4) * 1.2, -1.2 + Math.floor(index / 4) * 1.2, 0, 0.9, 0.9, COLOURS.plat))), plates: [[0, 0, 5.6, 4.4]] };
}
// 19 core services (blue) and 24 microservices (green) across 10 environments.
function migrate() {
  const slots = [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55], [0, 0]];
  const services = Array.from({ length: 43 }, (_, index) => {
    const environment = index % 10;
    const ring = Math.floor(index / 10);
    const [sx, sy] = slots[ring];
    return pod(-6 + (environment % 5) * 3 + sx, (environment < 5 ? -1.6 : 1.6) + sy, ring === 4 ? 0.75 : 0, 0.7, 0.7, index < 19 ? COLOURS.cloud : COLOURS.plat);
  });
  return { pods: fill(services), plates: Array.from({ length: 10 }, (_, environment) => [-6 + (environment % 5) * 3, environment < 5 ? -1.6 : 1.6, 2.5, 2.5]) };
}
// A mesh of services: pods crash in turn and come back on their own.
function heal(time) {
  return {
    pods: fill(Array.from({ length: 25 }, (_, index) => {
      const down = (time * 0.6 + podNoise[index] * 9) % 9 < 0.9;
      return pod(-2.6 + (index % 5) * 1.3, -2.6 + Math.floor(index / 5) * 1.3, 0, 0.82, down ? 0.15 : 0.6 + podNoise[index] * 0.9, down ? COLOURS.alert : COLOURS.ops);
    })),
    plates: [[0, 0, 7, 7]]
  };
}
// Records stream into one loader pod, fast: the ~13× throughput beat.
function throughput(time) {
  const records = Array.from({ length: 18 }, (_, index) => pod(-11 + ((index * 0.66 + time * 3.2) % 11.9), 0, 0.25, 0.34, 0.34, COLOURS.signal));
  return { pods: fill([pod(2.2, 0, 0, 2, 1.6, COLOURS.lead), ...records]), plates: [[2.2, 0, 3.2, 3.2], [-5, 0, 13, 1]] };
}
// A lead and two engineers.
function lead() {
  const towers = [[0, -1.2, 7, COLOURS.lead], [-2.6, 1.4, 5, COLOURS.cloud], [2.6, 1.4, 5, COLOURS.plat]];
  return {
    pods: fill(towers.flatMap(([x, y, levels, colour]) => Array.from({ length: levels }, (_, level) => pod(x, y, level * 0.92, 1.3, 0.84, colour)))),
    plates: towers.map(([x, y]) => [x, y, 2.4, 2.4])
  };
}
// The record: four roles, each a taller stack than the last.
function career() {
  const roles = [[-4.5, 2, COLOURS.steel], [-1.5, 3, COLOURS.ops], [1.5, 4, COLOURS.cloud], [4.5, 6, COLOURS.plat]];
  return {
    pods: fill(roles.flatMap(([x, levels, colour]) => Array.from({ length: levels }, (_, level) => pod(x, 0, level * 0.92, 1.4, 0.84, colour)))),
    plates: roles.map(([x]) => [x, 0, 2.4, 2.4])
  };
}
// Pods line up into a wall that says hello.
function hello() {
  const rows = ['X..X.XXX.X', 'X..X..X..X', 'XXXX..X..X', 'X..X..X...', 'X..X.XXX.X'];
  const pods = [];
  rows.forEach((row, rowIndex) => [...row].forEach((cell, column) => {
    if (cell === 'X') pods.push(pod((column - 4.5) * 1.05, 0, (4 - rowIndex) * 0.95, 0.9, 0.9, namespaces[Math.min(3, Math.floor(column / 2.6))], 0.6));
  }));
  return { pods: fill(pods), plates: [] };
}

export const layouts = { city, contain, packaged, migrate, heal, throughput, lead, career, hello };
