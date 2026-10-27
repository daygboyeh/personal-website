'use strict';

// The welcome loop is decorative: respect the page's motion preference and
// release video decoding while visitors explore the rest of the portfolio.
const welcomeVideo = $('#welcome-video');
const welcomeMotion = $('#welcome-motion');
const welcomeStatus = $('#welcome-motion-status');
const welcomeProgress = $('#welcome-progress');
let welcomeVisible = false;
let welcomePlayPending = false;
let welcomeUnavailable = false;

welcomeVideo.muted = true;
welcomeVideo.defaultMuted = true;

function shouldPlayWelcome() {
  return welcomeVisible && !motionPaused && !document.hidden
    && profileFilm.paused && !welcomeUnavailable;
}

async function syncWelcomeMotion() {
  const shouldPlay = shouldPlayWelcome();
  welcomeVideo.autoplay = shouldPlay;
  if (!shouldPlay) {
    welcomeVideo.pause();
    welcomeStatus.textContent = motionPaused ? 'Motion paused' : 'Motion preview';
    return;
  }
  if (!welcomeVideo.paused || welcomePlayPending) return;
  welcomePlayPending = true;
  try {
    await welcomeVideo.play();
    // A scroll, tab switch, or motion preference may change during play().
    if (!shouldPlayWelcome()) welcomeVideo.pause();
  } catch (error) {
    if (error.name !== 'AbortError') {
      welcomeStatus.textContent = 'Motion preview';
      console.info('Welcome motion uses its poster because playback is unavailable.', error.name);
    }
  } finally {
    welcomePlayPending = false;
  }
}

welcomeVideo.addEventListener('play', () => {
  welcomeMotion.classList.add('is-playing');
  welcomeStatus.textContent = 'Muted loop';
});
welcomeVideo.addEventListener('pause', () => welcomeMotion.classList.remove('is-playing'));
welcomeVideo.addEventListener('timeupdate', () => {
  const progress = welcomeVideo.duration ? welcomeVideo.currentTime / welcomeVideo.duration : 0;
  welcomeProgress.style.transform = `scaleX(${progress})`;
});
welcomeVideo.addEventListener('error', () => {
  welcomeUnavailable = true;
  welcomeMotion.classList.remove('is-playing');
  welcomeStatus.textContent = 'Motion preview';
  console.warn('Welcome video could not load.', { code: welcomeVideo.error?.code });
});

const welcomeObserver = new IntersectionObserver(entries => {
  welcomeVisible = entries[0].isIntersecting;
  syncWelcomeMotion();
}, { threshold: 0.08 });
welcomeObserver.observe(welcomeMotion);
window.addEventListener('motionchange', syncWelcomeMotion);
document.addEventListener('visibilitychange', syncWelcomeMotion);
profileFilm.addEventListener('play', syncWelcomeMotion);
profileFilm.addEventListener('pause', syncWelcomeMotion);
profileFilm.addEventListener('ended', syncWelcomeMotion);
window.addEventListener('pagehide', () => {
  welcomeVideo.pause();
  welcomeObserver.disconnect();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) welcomeObserver.observe(welcomeMotion);
});
