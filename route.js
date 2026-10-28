'use strict';
// Route rail: highlights the station you are at and moves the train with scroll.
const routeStops = [...document.querySelectorAll('.route-rail [data-station]')];
const routeTrain = $('#route-train');
const routeSections = routeStops.map(stop => document.getElementById(stop.dataset.station)).filter(Boolean);
const siteHeader = $('.site-header');
let routeFrame = 0;

function updateRoute() {
  routeFrame = 0;
  siteHeader.classList.toggle('scrolled', scrollY > 10);
  // The current station is the last section whose top has passed a third of the viewport.
  let current = 0;
  routeSections.forEach((section, index) => { if (section.getBoundingClientRect().top < innerHeight / 3) current = index; });
  routeStops.forEach((stop, index) => {
    const here = index === current;
    stop.classList.toggle('here', here);
    if (here) stop.setAttribute('aria-current', 'location'); else stop.removeAttribute('aria-current');
  });
  // The train sits between the current stop and the next, by progress through the section.
  const section = routeSections[current];
  const next = routeSections[current + 1];
  const span = next ? next.offsetTop - section.offsetTop : 1;
  const progress = next ? Math.max(0, Math.min(1, (scrollY + innerHeight / 3 - section.offsetTop) / span)) : 0;
  const from = routeStops[current].offsetTop;
  const to = routeStops[current + 1] ? routeStops[current + 1].offsetTop : from;
  routeTrain.style.top = `${from + (to - from) * progress - 3}px`;
}
function queueRoute() { if (!routeFrame) routeFrame = requestAnimationFrame(updateRoute); }
addEventListener('scroll', queueRoute, { passive: true });
addEventListener('resize', queueRoute);
updateRoute();
window.addEventListener('pagehide', () => cancelAnimationFrame(routeFrame));
