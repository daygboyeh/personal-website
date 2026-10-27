'use strict';
const profileFilm = $('#profile-film');
const filmStatus = $('#film-status');
const filmPlayToggle = $('#film-play');
// The player stays visible in the document; the hero link is an explicit play action.
async function playProfileFilm() {
  profileFilm.focus({preventScroll:true});
  try { await profileFilm.play(); }
  catch {
    filmStatus.textContent = 'Press play in the video controls to watch.';
  }
}
$('#play-reel').addEventListener('click', playProfileFilm);
filmPlayToggle.addEventListener('click', () => {
  if (profileFilm.paused) playProfileFilm();
  else profileFilm.pause();
});
profileFilm.addEventListener('play', () => {
  filmPlayToggle.textContent = 'Ⅱ Pause film';
  filmStatus.textContent = 'Playing Systems in Motion · Original soundtrack.';
});
profileFilm.addEventListener('pause', () => {
  filmPlayToggle.textContent = profileFilm.ended ? '↺ Replay film' : '▶ Play film';
  if (!profileFilm.ended) filmStatus.textContent = 'Paused · Use the video controls to continue.';
});
profileFilm.addEventListener('ended', () => {
  filmPlayToggle.textContent = '↺ Replay film';
  filmStatus.textContent = 'Systems in Motion · Replay using the video controls.';
});
profileFilm.addEventListener('error', () => {
  filmStatus.textContent = 'The video could not load. Download the MP4 to watch.';
  console.warn('Profile film playback error', {code:profileFilm.error?.code});
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) profileFilm.pause();
});
window.addEventListener('pagehide', () => profileFilm.pause());
