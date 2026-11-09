// The one hidden extra: a small terminal for the curious. Opens with the header button or
// the backtick key. Output is plain text only, so nothing typed can inject markup.
import { isMotionPaused } from './motion.js';

const CV_URL = 'assets/Adebiyi_Adegboye_CV.pdf?v=4';
const EMAIL = 'loluadegboye@gmail.com';
const sections = { proof: '#proof', work: '#work', leadership: '#leadership', record: '#record', contact: '#contact' };
const fortunes = [
  'Automate the second time, not the first.',
  'A runbook nobody can follow is a wish.',
  'The best incident is the boring one you prevented.',
  'Every manual step is a future outage with a calendar invite.',
  'Measure before you change anything. The time is never where you think.'
];
const replies = {
  help: 'status      → your on-call shift\nmissions    → what’s left to do\nproof       → the numbers\nwork        → two case studies\nleadership  → how I lead\nrecord      → experience and certifications\ncontact     → get in touch\ncv          → download my CV\ngithub      → my GitHub\nclear       → clear the screen\nexit        → close',
  whoami: 'visitor · namespace/you · role: curious',
  about: 'Platform Engineering Team Lead at Gresham Technologies, London. 8+ years in cloud, DevOps and Kubernetes.',
  ls: 'proof/  work/  leadership/  record/  Adebiyi_Adegboye_CV.pdf',
  'kubectl get pods': 'NAME              READY   STATUS     RESTARTS   AGE\nplatform-lead     1/1     Running    0          8y\ncuriosity         1/1     Running    0          always\ncoffee            0/1     Pending    3          5m',
  'git blame': 'git blame production\n→ It was DNS. (It is always DNS.)',
  'rm -rf /': 'Nice try. Blocked by RBAC, an admission controller, and common sense.',
  ping: 'PONG. Latency: low. Enthusiasm: high.',
  'hire-me': 'Permission denied. Try sudo.',
  'sudo hire-me': `Permission granted. Opening an email to ${EMAIL}…`,
  cv: 'Downloading the CV as a PDF…',
  github: 'Opening github.com/daygboyeh…',
  contact: `Email: ${EMAIL}`
};

export function initTerminal(engine) {
  const dialog = document.getElementById('terminal-dialog');
  const output = document.getElementById('terminal-output');
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('terminal-input');
  const toggle = document.getElementById('open-terminal');

  const open = () => { if (!dialog.open) dialog.showModal(); input.focus(); };
  const print = (text, className) => {
    const line = document.createElement('p');
    if (className) line.className = className;
    line.textContent = text;
    output.append(line);
  };

  toggle.hidden = false;
  toggle.addEventListener('click', open);
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  document.addEventListener('keydown', event => {
    if (event.key !== '`' || event.target.matches('input,textarea') || document.querySelector('dialog[open]')) return;
    event.preventDefault();
    open();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.trim();
    const command = raw.toLowerCase();
    input.value = '';
    if (!command) return;
    print(`$ ${raw}`);
    if (command === 'clear') { output.replaceChildren(); return; }
    if (command === 'exit') { dialog.close(); return; }
    if (command === 'status') {
      const { done, total, restarts, budget } = engine.stats();
      print(`on call · ${done}/${total} missions · ${restarts} pods restarted · error budget ${budget.toFixed(1)}%`);
    } else if (command === 'missions') print(engine.list().map((mission, index) => `${mission.done ? '✓' : '○'} ${index + 1}. ${mission.title}${mission.done ? '' : ` → ${mission.hint}`}`).join('\n'));
    else if (command === 'fortune') print(fortunes[Math.floor(Math.random() * fortunes.length)]);
    else if (command === 'uptime') print(`up ${Math.round(performance.now() / 1000)}s on this page · load average: curious`);
    else if (sections[command]) {
      dialog.close();
      document.querySelector(sections[command]).scrollIntoView({ behavior: isMotionPaused() ? 'auto' : 'smooth' });
    } else print(replies[command] || `command not found: ${raw}. Try help.`);

    if (command === 'cv') Object.assign(document.createElement('a'), { href: CV_URL, download: 'Adebiyi_Adegboye_CV.pdf' }).click();
    if (command === 'github') window.open('https://github.com/daygboyeh', '_blank', 'noopener');
    if (command === 'sudo hire-me') location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Let’s talk')}`;
    // Keep the scrollback bounded over a long session.
    while (output.children.length > 60) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  });
}
