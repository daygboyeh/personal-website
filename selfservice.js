'use strict';
// Self-service: the golden path for visitors. Pick a template and the platform
// "provisions" a manifest of matching CV evidence, ready to apply as an email.
// Every evidence line comes from the CV content elsewhere on this page.
const provisionTemplates = {
  lead: {
    name: 'platform-leadership', title: 'Platform leadership',
    evidence: ['Platform Engineering Team Lead at Gresham since Sep 2024', 'Lead two engineers: priorities, mentoring, design reviews', 'Hiring, technical interviews, and customer delivery']
  },
  cloud: {
    name: 'cloud-kubernetes', title: 'Cloud & Kubernetes',
    evidence: ['Strongest depth in AWS and EKS, plus end-to-end Azure and AKS delivery', 'OpenShift, ROSA, private-cloud, and on-premises estates', 'AWS Solutions Architect and Developer (Associate)']
  },
  delivery: {
    name: 'gitops-delivery', title: 'GitOps & delivery',
    evidence: ['GitOps and CI/CD cut deployment time by 30%', 'Reusable Helm charts cut manual configuration by 75%', 'Migration: 19 core services, 24 microservices, 10 environments']
  },
  ops: {
    name: 'reliability-cost', title: 'Reliability & cost',
    evidence: ['Production diagnosis across Kubernetes, networking, Kafka, Cassandra', 'Istio retries on EKS reduced downtime by 20%', 'Kubecost optimisation reduced cloud costs by 20%']
  }
};
const provisionRun = $('#provision-run');
const provisionOutput = $('#provision-output');
const provisionActions = $('#provision-actions');
const provisionState = $('#provision-state');
const provisionStatus = $('#provision-status');
const provisionChoices = [...document.querySelectorAll('input[name="provision-template"]')];
let provisionTimers = [];
let manifestText = '';

function chosenTemplate() {
  const checked = provisionChoices.find(choice => choice.checked);
  return checked && provisionTemplates[checked.value];
}
function manifestLines(template) {
  return [
    'apiVersion: hiring/v1',
    'kind: Conversation',
    'metadata:',
    `  name: ${template.name}`,
    '  namespace: you',
    'spec:',
    '  engineer: Adebiyi Adegboye',
    '  role: Platform Engineering Team Lead',
    '  location: London, UK',
    '  experience: 8+ years',
    '  evidence:',
    ...template.evidence.map(line => `    - ${line}`),
    'status:',
    '  phase: Ready  # apply to send me an email'
  ];
}
// Light YAML colouring built from DOM nodes, never from HTML strings.
function renderManifestLine(text) {
  const line = document.createElement('span');
  line.className = 'yaml-line';
  const [, indent, key, rest] = text.match(/^(\s*-?\s*)([\w]+:)?(.*)$/);
  line.append(indent);
  if (key) { const keySpan = document.createElement('span'); keySpan.className = 'yaml-key'; keySpan.textContent = key; line.append(keySpan); }
  const [value, comment] = rest.split('  #');
  line.append(value);
  if (comment !== undefined) { const commentSpan = document.createElement('span'); commentSpan.className = 'muted'; commentSpan.textContent = `  #${comment}`; line.append(commentSpan); }
  line.append('\n');
  return line;
}
function setProvisionState(state) {
  provisionState.textContent = state;
  provisionState.dataset.state = state.toLowerCase();
}
function finishProvision(template) {
  setProvisionState('READY');
  provisionActions.hidden = false;
  $('#provision-apply').href = `mailto:loluadegboye@gmail.com?subject=${encodeURIComponent(`Let’s talk: ${template.title}`)}`;
  provisionRun.disabled = false;
  provisionRun.firstChild.textContent = 'Provision again ';
  provisionStatus.textContent = `${template.title} manifest ready. Apply to email me, or copy the manifest.`;
  window.dispatchEvent(new CustomEvent('stamp', { detail: 'provision' }));
}
function provision() {
  const template = chosenTemplate();
  if (!template) return;
  provisionTimers.forEach(clearTimeout);
  provisionTimers = [];
  const lines = manifestLines(template);
  manifestText = lines.join('\n');
  provisionActions.hidden = true;
  provisionRun.disabled = true;
  provisionOutput.replaceChildren();
  setProvisionState('PROVISIONING');
  if (motionPaused) {
    provisionOutput.append(...lines.map(renderManifestLine));
    finishProvision(template);
    return;
  }
  // Stream the manifest in line by line, like a controller reconciling it.
  lines.forEach((text, index) => provisionTimers.push(setTimeout(() => {
    provisionOutput.append(renderManifestLine(text));
    if (index === lines.length - 1) finishProvision(template);
  }, 60 * index)));
}

provisionChoices.forEach(choice => choice.addEventListener('change', () => {
  provisionRun.disabled = false;
  provisionRun.firstChild.textContent = 'Provision ';
  setProvisionState('PENDING');
  provisionStatus.textContent = `${chosenTemplate().title} selected. Press Provision.`;
}));
provisionRun.addEventListener('click', provision);
$('#provision-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(manifestText); notify('Manifest copied. kubectl apply when ready.'); }
  catch { notify('Copy blocked by the browser. Select the manifest text instead.'); }
});
window.addEventListener('pagehide', () => provisionTimers.forEach(clearTimeout));
