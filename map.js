'use strict';
// Service map: the whole page drawn as a cluster topology. Traffic comes in at ingress,
// fans out across four namespaces (the site's colours), and leaves at egress, so every
// path ends in a conversation. It is the site navigation on every screen size.
const mapDialog = $('#map-dialog');
const mapNodesList = $('#topology-nodes');
const mapEdges = $('#topology-edges');
const svgNamespace = 'http://www.w3.org/2000/svg';
// Lanes run top to bottom in a 100×100 space; x and y are percentages of the map.
const laneY = { cloud: 14, plat: 38, ops: 62, lead: 86 };
const ingressNode = { id: 'top', label: 'Ingress', detail: 'home', x: 9, y: 50, line: 'ingress' };
const egressNode = { id: 'contact', label: 'Egress', detail: 'contact', x: 91, y: 50, line: 'egress' };
const lanes = {
  cloud: [['quests', 'Work', 'deployments', 34], ['qualifications', 'Certs', 'credentials', 66]],
  plat: [['experience', 'Experience', 'releases', 28], ['building', 'Building', 'together', 50], ['playground', 'Self-service', 'golden path', 72]],
  ops: [['signal', 'Traffic', 'router game', 34], ['cluster', 'Cluster', 'pods', 66]],
  lead: [['player', 'About', 'configmap', 34], ['rules', 'Policies', 'how I work', 66]]
};
const laneNodes = Object.entries(lanes).map(([line, stops]) => stops.map(([id, label, detail, x]) => ({ id, label, detail, x, y: laneY[line], line })));
// Page order, so the list reads top to bottom for keyboard and screen-reader users.
const pageOrder = [...document.querySelectorAll('main > section[id]')].map(section => section.id);
const mapNodes = [ingressNode, ...laneNodes.flat(), egressNode].sort((a, b) => pageOrder.indexOf(a.id) - pageOrder.indexOf(b.id));
const visitedServices = new Set();

function edgePath(from, to) {
  const bend = (from.x + to.x) / 2;
  return `M${from.x} ${from.y}C${bend} ${from.y} ${bend} ${to.y} ${to.x} ${to.y}`;
}
function drawEdges() {
  const paths = laneNodes.flatMap(nodes => {
    const hops = [ingressNode, ...nodes, egressNode];
    return hops.slice(1).map((node, index) => [edgePath(hops[index], node), nodes[0].line]);
  });
  // Each edge is a solid line plus a dashed overlay that animates like traffic flowing.
  mapEdges.replaceChildren(...paths.flatMap(([d, line]) => ['edge', 'edge flow'].map(className => {
    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', `${className} line-${line}`);
    return path;
  })));
}
function renderMap() {
  const current = routeSections[currentSectionIndex()]?.id;
  mapNodesList.replaceChildren(...mapNodes.map(node => {
    const item = document.createElement('li');
    item.style.left = `${node.x}%`;
    item.style.top = `${node.y}%`;
    const link = document.createElement('a');
    link.href = `#${node.id}`;
    link.className = `topo-node line-${node.line}${visitedServices.has(node.id) ? ' visited' : ''}`;
    if (node.id === current) link.setAttribute('aria-current', 'location');
    const dot = document.createElement('span'); dot.className = 'node-dot'; dot.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.className = 'node-label'; label.textContent = node.label;
    const detail = document.createElement('small'); detail.textContent = node.detail;
    label.append(detail);
    link.append(dot, label);
    if (visitedServices.has(node.id) && node.id !== current) {
      const state = document.createElement('span'); state.className = 'sr-only'; state.textContent = ', visited';
      link.append(state);
    }
    item.append(link);
    return item;
  }));
}
function openMap() {
  renderMap();
  openDialog(mapDialog);
  (mapNodesList.querySelector('[aria-current]') || mapNodesList.querySelector('a')).focus();
}

mapNodesList.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  event.preventDefault();
  const target = document.getElementById(link.hash.slice(1));
  mapDialog.close();
  target.scrollIntoView({ behavior: motionPaused ? 'instant' : 'smooth' });
  // Move focus with the view so keyboard users continue from the chosen service.
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
});
$('#open-map').addEventListener('click', openMap);
window.addEventListener('openmap', openMap);
document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() !== 'm' || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.target.matches('input,textarea,select') || document.querySelector('dialog[open]')) return;
  event.preventDefault();
  openMap();
});
const mapVisitObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) visitedServices.add(entry.target.id);
}), { threshold: 0.2 });
document.querySelectorAll('main > section[id]').forEach(section => mapVisitObserver.observe(section));
window.addEventListener('pagehide', () => mapVisitObserver.disconnect());
drawEdges();
