# Adebiyi Adegboye — Personal Website

A personal website covering platform engineering, cloud architecture, leadership,
career experience, education, and selected work. Customer and product names are
anonymized throughout the website and downloadable CV.

## Concept: Platforms
The site is a transit network. Each line colour is a domain of work (Cloud,
Platform, Operations, Leadership), sections are stations on a route, and the
visitor is a passenger collecting stamps. It is built to be played, not watched:
- **Departures board**: a split-flap board with a live clock; each departure links to a section.
- **Route rail** (wide screens): stations down the left edge, with a train that follows your scroll.
- **Signal Box**: an arcade game. Route trains to the right line; after 10, colour hints switch off.
- **Byelaws**: engineering principles as flip cards, and a Definition of Done checklist you can ship.
- **The Depot**: every tool is a throwable pod that you can scale, crash, and watch self-heal.
- **Journey card**: 12 stamps earned by trying things around the site.

## Run locally
From this directory, run:
    python3 -m http.server 4173 --bind 127.0.0.1
Then open http://127.0.0.1:4173.

This is a static website. It needs no package installation or build step.
Bump the `?v=` query on stylesheet and script URLs in index.html when you deploy
changes, so returning visitors don't run stale cached files.

## Files
- index.html: page content and accessible navigation
- base.css: design tokens, line colours, header, route rail, dialogs, footer
- hero.css, board.js: hero and split-flap departures board
- stations.css: section styling (Signal Box, tickets, career line, byelaws, passes, contact)
- route.js: route rail station tracking
- game.js: journey card stamps (other modules award one with a `stamp` event)
- signal.js: Signal Box game
- rules.js: byelaw cards and the Definition of Done checklist
- cluster.js, cluster.css: the pod depot
- career.js: project descriptions and career timeline
- app.js: dialogs, terminal commands, and interface controls
- experience.js, console.css: Platform Lab console and the scroll progress bar
- together.js, together.css: Together Parenting interactive concept
- intro.js, intro.css: once-per-session kubectl boot intro (skippable; off for reduced motion)
- fun.js, fun.css: magnetic name, footer status, and easter eggs
- assets/: CV downloads and the Together app icon

Progress (stamps, Signal Box best score) is stored only in the visitor's browser
as a convenience; everything works without storage. All decorative animation
respects reduced-motion preferences and the header motion toggle.

The earlier Systems in Motion film is no longer on the page. Its video files in
assets/ and the renderer in tools/motion-film/ are kept in the repository.

## Easter eggs
Hidden terminal commands (`kubectl get pods`, `sudo hire-me`, `fortune`, `uptime`,
`git blame`, `chaos`, `rules`, `github`), clicking the brand mark five times,
typing "dns", "yaml", "deploy", or "sudo" anywhere on the page, the Konami code,
switching tabs, and a note in the DevTools console. Each secret earns a stamp.

## Now building
The portfolio features Together Parenting, a product we are building for shared
family care, with the app icon, product link, and an illustrative shared-care
interaction.

## Private hosted version
https://adebiyi-adegboye-platform.zeal22.chatgpt.site
