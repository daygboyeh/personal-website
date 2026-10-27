'use strict';
// A small illustrative interaction communicates shared care without family data.
const carePreview = document.querySelector('#together-preview');
const careConnect = document.querySelector('#care-connect');
const careStatus = document.querySelector('#together-status');
careConnect.addEventListener('click', () => {
  const connected = careConnect.getAttribute('aria-pressed') !== 'true';
  carePreview.classList.toggle('is-connected', connected);
  careConnect.setAttribute('aria-pressed', String(connected));
  careConnect.replaceChildren(
    document.createTextNode(connected ? 'Play again ' : 'Bring it together '),
    Object.assign(document.createElement('span'), {textContent:connected ? '↺' : '↗'})
  );
  careStatus.textContent = connected ? 'Everyday care. One shared place.' : 'A little care. A little coordination.';
});
