'use strict';
// Service rail: highlights the service you are viewing and moves a packet with scroll.
// Also drives the thin scroll-progress bar across the top of the page.
const routeStops = [...document.querySelectorAll('.route-rail [data-station]')];
const routePacket = $('#route-packet');
const routeSections = routeStops.map(stop => document.getElementById(stop.dataset.station)).filter(Boolean);
const siteHeader = $('.site-header');
const scrollProgress = $('.scroll-progress');
let routeFrame = 0;

// The current service is the last section whose top has passed a third of the viewport.
function currentSectionIndex() {
  let current = 0;
  routeSections.forEach((section, index) => { if (section.getBoundingClientRect().top < innerHeight / 3) current = index; });
  return current;
}
function updateRoute() {
  routeFrame = 0;
  siteHeader.classList.toggle('scrolled', scrollY > 10);
  const scrollRange = document.documentElement.scrollHeight - innerHeight;
  scrollProgress.style.width = `${scrollRange > 0 ? scrollY / scrollRange * 100 : 0}%`;
  const current = currentSectionIndex();
  routeStops.forEach((stop, index) => {
    const here = index === current;
    stop.classList.toggle('here', here);
    if (here) stop.setAttribute('aria-current', 'location'); else stop.removeAttribute('aria-current');
  });
  // The packet sits between the current stop and the next, by progress through the section.
  const section = routeSections[current];
  const next = routeSections[current + 1];
  const span = next ? next.offsetTop - section.offsetTop : 1;
  const progress = next ? Math.max(0, Math.min(1, (scrollY + innerHeight / 3 - section.offsetTop) / span)) : 0;
  const from = routeStops[current].offsetTop;
  const to = routeStops[current + 1] ? routeStops[current + 1].offsetTop : from;
  routePacket.style.top = `${from + (to - from) * progress + 4}px`;
}
function queueRoute() { if (!routeFrame) routeFrame = requestAnimationFrame(updateRoute); }
addEventListener('scroll', queueRoute, { passive: true });
addEventListener('resize', queueRoute);
updateRoute();
window.addEventListener('pagehide', () => cancelAnimationFrame(routeFrame));
