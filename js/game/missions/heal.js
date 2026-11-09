// Mission 1 · Break a pod. With the 3D scene, the pager's button (or a click on any pod)
// crashes a real pod. Without it, a row of DOM pods in the hero plays the same role.
const HEAL_MS = 1600;

export function initHeal(engine) {
  engine.register({ id: 'heal', title: 'Break a pod', hint: 'Use Break a pod, or click any pod, and watch it heal.', href: '#top' });
  const button = document.getElementById('break-pod');
  const strip = document.getElementById('pod-strip');

  engine.on('pod:broken', ({ pod }) => { engine.recordRestart(); engine.announce(`Pod ${pod} crashed. Restarting.`); });
  engine.on('pod:healed', ({ pod }) => { engine.announce(`Pod ${pod} is back.`); engine.complete('heal'); });

  function breakDomPod() {
    const pods = [...strip.children].filter(pod => !pod.classList.contains('down'));
    const pod = pods[Math.floor(Math.random() * pods.length)];
    if (!pod) return;
    const number = [...strip.children].indexOf(pod) + 1;
    pod.classList.add('down');
    engine.emit('pod:broken', { pod: number });
    setTimeout(() => { pod.classList.remove('down'); engine.emit('pod:healed', { pod: number }); }, HEAL_MS);
  }
  button.addEventListener('click', () => (engine.scene ? engine.scene.breakRandomPod() : breakDomPod()));
  engine.on('scene:none', () => {
    strip.replaceChildren(...Array.from({ length: 8 }, () => Object.assign(document.createElement('span'), { className: 'dom-pod' })));
    strip.hidden = false;
  });
}
