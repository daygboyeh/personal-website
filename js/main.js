// Entry point. The page is complete without JavaScript; these modules only add the
// motion toggle, the terminal and copy-to-clipboard. Stage B adds the 3D scene here.
import { initMotionToggle } from './motion.js';
import { initTerminal } from './terminal.js';
import { toast } from './toast.js';

initMotionToggle(document.querySelector('.motion-toggle'));
initTerminal();

const copyEmail = document.getElementById('copy-email');
if (navigator.clipboard) {
  copyEmail.hidden = false;
  copyEmail.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('loluadegboye@gmail.com'); toast('Email copied. Talk soon.'); }
    catch { toast('Copy was blocked. The address is loluadegboye@gmail.com'); }
  });
}
