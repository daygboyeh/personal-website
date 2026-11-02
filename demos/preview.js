import { mountCutover } from '../js/demos/cutover.js';
const demo = mountCutover(document.getElementById('demo'), { onPayoff: () => { document.body.dataset.payoff = '1'; } });
if (new URLSearchParams(location.search).has('play')) demo.play();
