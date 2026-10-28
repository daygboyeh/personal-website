'use strict';
const $ = selector => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reducedMotion.matches;
const motionButton = $('.motion-toggle');
function setMotion(paused) {
  motionPaused = paused;
  document.body.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('title', paused ? 'Enable decorative motion' : 'Pause decorative motion');
  $('.motion-label').textContent = paused ? 'Motion off' : 'Motion on';
  $('.motion-symbol').textContent = paused ? '▶' : 'Ⅱ';
  document.documentElement.style.scrollBehavior = paused ? 'auto' : '';
  window.dispatchEvent(new Event('motionchange'));
}
motionButton.addEventListener('click', () => setMotion(!motionPaused));
reducedMotion.addEventListener('change', event => setMotion(event.matches));
setMotion(motionPaused);
document.body.classList.add('js-motion');
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

function openDialog(dialog) { if (!dialog.open) dialog.showModal(); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
});
let toastTimeout;
function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  $('#project-title').textContent = project.title;
  $('#project-category').textContent = project.category;
  $('#project-description').textContent = project.description;
  $('#project-tags').replaceChildren(...project.tags.map(tag => { const element = document.createElement('span'); element.textContent = tag; return element; }));
  openDialog($('#project-dialog'));
}));

const terminal = $('#terminal-dialog');
function openTerminal() { openDialog(terminal); $('#terminal-input').focus(); }
$('#open-terminal').addEventListener('click', openTerminal);
document.addEventListener('keydown', event => {
  if (event.key === '`' && !event.target.matches('input,textarea') && !document.querySelector('dialog[open]')) { event.preventDefault(); openTerminal(); }
});
$('#terminal-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#terminal-input');
  const command = input.value.trim().toLowerCase();
  if (!command) return;
  const output = $('#terminal-output');
  const line = document.createElement('p');
  line.textContent = `ade@platform:~ $ ${input.value.trim()}`;
  output.append(line);
  input.value = '';
  const response = document.createElement('p');
  const replies = {
    help: 'building → Together Parenting\nwork → selected projects\nexperience → career timeline\nskills → technical toolkit\nabout → meet Adebiyi\ncv → download my CV\ncontact → get in touch\nplay → optional console game\nsignal → play Signal Box\nstamps → your journey card\nrules → how I work\ngithub → my GitHub\ncluster → throw some pods around\nclear → clear terminal\nexit → close terminal',
    hello: 'Hi, I’m Adebiyi Adegboye. I build platforms, lead engineers, and solve complex delivery problems.',
    about: 'Platform Engineering Team Lead at Gresham, based in London. 8+ years in cloud, DevOps, and Kubernetes.',
    work: 'Loading selected work…', quests: 'Loading selected work…', projects: 'Loading selected work…',
    building: 'Together Parenting — a product we’re building to connect everyday care.', together: 'Loading Together Parenting…', experience: 'Loading my career timeline…', skills: 'Loading my toolkit…', contact: 'Email: loluadegboye@gmail.com',
    cv: 'Downloading my CV as a PDF.', play: 'Platform lab online. Deploy services with A, or tap the service icon.', signal: 'Opening the signal box. Mind the points.', rules: 'Opening the byelaws. Untested = broken.', github: 'Opening github.com/daygboyeh…', stamps: 'Opening your journey card…',
    cluster: 'Scheduling you onto node london-1…',
    whoami: 'visitor — namespace/you, role: curious. Access level: welcome.',
    ls: 'work/  building/  experience/  cluster/  console/  Adebiyi_Adegboye_CV.pdf',
    'kubectl get pods': 'NAME                  READY   STATUS     RESTARTS   AGE\nplatform-lead         1/1     Running    0          8y\ntogether-parenting    1/1     Running    0          new\ncuriosity             1/1     Running    0          always\ncoffee                0/1     Pending    3          5m',
    'sudo hire-me': 'Permission granted. Opening a fresh email…', 'hire-me': 'Permission denied. Try sudo.',
    'git blame': 'git blame production\n→ It was DNS. (It is always DNS.)',
    'rm -rf /': 'Nice try. Blocked by RBAC, an admission controller, and common sense.',
    uptime: '', fortune: '',
    coffee: 'Error 418: I’m a teapot. Brewing anyway ☕',
    chaos: 'Releasing the chaos monkey. Self-healing in 3, 2, 1…',
    ping: 'PONG. Latency: low. Enthusiasm: high.'
  };
  const fortunes = ['Automate the second time, not the first.', 'A runbook nobody can follow is a wish.', 'The best incident is the boring one you prevented.', 'Every manual step is a future outage with a calendar invite.', 'Good platforms are invisible until you need them, then obvious.', 'Measure the cost before someone else measures it for you.'];
  if (command === 'uptime') replies.uptime = `up ${Math.round(performance.now() / 1000)}s on this page · load average: curious, very curious, extremely curious`;
  if (command === 'fortune') replies.fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  if (command === 'clear') output.replaceChildren();
  else if (command === 'exit') terminal.close();
  else { response.textContent = replies[command] || `Unknown command: ${command}. Try help.`; output.append(response); }
  const destinations = {rules:'#rules',signal:'#signal',cluster:'#cluster',chaos:'#cluster',building:'#building',together:'#building',about:'#player',skills:'#player',work:'#quests',quests:'#quests',projects:'#quests',experience:'#experience',contact:'#contact'};
  if (destinations[command]) {
    terminal.close();
    $(destinations[command]).scrollIntoView({behavior:motionPaused?'instant':'smooth'});
  }
  if (command === 'cv') {
    const link=document.createElement('a');link.href='assets/Adebiyi_Adegboye_CV.pdf?v=3';link.download='Adebiyi_Adegboye_CV.pdf';link.click();
  }
  if (command === 'play') { terminal.close(); $('#world-wrap').scrollIntoView({ behavior: motionPaused ? 'instant' : 'smooth', block: 'center' }); window.dispatchEvent(new Event('startconsole')); $('#world').focus({ preventScroll: true }); }
  if (['kubectl get pods','sudo hire-me','git blame','rm -rf /','coffee','fortune','whoami','uptime','ls','ping'].includes(command)) window.dispatchEvent(new CustomEvent('stamp', { detail: 'secret' }));
  if (command === 'chaos') window.dispatchEvent(new Event('clusterchaos'));
  if (command === 'sudo hire-me') { window.dispatchEvent(new Event('sparkburst')); location.href = 'mailto:loluadegboye@gmail.com?subject=Let%E2%80%99s%20talk'; }
  if (command === 'github') window.open('https://github.com/daygboyeh', '_blank', 'noopener');
  if (command === 'stamps') { terminal.close(); window.dispatchEvent(new Event('openjourney')); }
  // Keep the optional terminal bounded over long sessions.
  while (output.children.length > 60) output.firstElementChild.remove();
  output.scrollTop = output.scrollHeight;
});

window.addEventListener('pagehide', () => { clearTimeout(toastTimeout); revealObserver.disconnect(); });

$('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('loluadegboye@gmail.com'); notify('Email copied. Let’s talk.'); }
  catch { notify('Email: loluadegboye@gmail.com'); }
});

$('#footer-terminal').addEventListener('click', openTerminal);
