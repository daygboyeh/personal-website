// One status message at a time, announced politely to screen readers.
let hideTimer = 0;
export function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => element.classList.remove('visible'), 3200);
}
