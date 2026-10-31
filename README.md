# Adebiyi Adegboye — Personal Website

A personal website covering platform engineering, cloud architecture, leadership,
career experience, education, and selected work. Customer and product names are
anonymized throughout the website and downloadable CV.

## Concept: Control plane
The site is a running cluster. Each colour is a namespace of work (Cloud,
Platform, Operations, Leadership), sections are services, and the visitor is a
pod being scheduled who unlocks achievements. It is built to be played, not watched:
- **Scroll story** (the hero): a pinned, hand-rendered isometric cluster. Scrolling morphs it
  through eight steps of the CV: one container, Helm, GitOps, the 43-service migration,
  self-healing, cost, the team, and a wall of pods that says hi. Drag to orbit, click a pod
  to break it and watch it heal; arrow keys and Enter do the same on the focused canvas.
- **Service map**: a topology of every section, from ingress to egress, with "you are here"
  and visited services. Open it from the header Map button or press `M`. It is the
  section navigation on every screen size.
- **Service rail** (wide screens): services down the left edge, with a packet that follows your scroll.
- **Traffic router**: an arcade game. Route each request to its namespace; after 10, the dashboards go dark.
- **Policies**: engineering principles as flip cards, and a Definition of Done checklist you can ship.
- **Node pool**: every tool is a throwable pod that you can scale, crash, and watch self-heal.
- **Self-service**: pick a template and provision a manifest of matching CV evidence, then apply it as an email.
- **Achievements**: 12 badges earned by trying things around the site.

## Run locally
From this directory, run:
    python3 -m http.server 4173 --bind 127.0.0.1
Then open http://127.0.0.1:4173.

This is a static website. It needs no package installation or build step.
Bump the `?v=` query on stylesheet and script URLs in index.html when you deploy
changes, so returning visitors don't run stale cached files.

## Files
- index.html: page content and accessible navigation
- base.css: design tokens, namespace colours, header, service rail, dialogs, footer
- story.css, story.js: the scroll story and its isometric canvas renderer (no libraries)
- stations.css: section styling (traffic router, work cards, career, policies, certs, contact)
- route.js: service rail tracking and the scroll progress bar
- map.js, map.css: the service map dialog
- selfservice.js, selfservice.css: the self-service provisioner
- game.js: achievements (other modules award one with a `stamp` event)
- signal.js: traffic router game
- rules.js: policy cards and the Definition of Done checklist
- cluster.js, cluster.css: the pod cluster
- career.js: project descriptions and career timeline
- app.js: dialogs, terminal commands, and interface controls
- together.js, together.css: Together Parenting interactive concept
- intro.js, intro.css: once-per-session kubectl boot intro (skippable; off for reduced motion)
- fun.js, fun.css: magnetic name, footer status, and easter eggs
- assets/: CV downloads and the Together app icon

Progress (achievements, traffic router best score) is stored only in the visitor's browser
as a convenience; everything works without storage. All decorative animation
respects reduced-motion preferences and the header motion toggle.

The earlier Systems in Motion film is no longer on the page. Its video files in
assets/ and the renderer in tools/motion-film/ are kept in the repository.

## Easter eggs
Hidden terminal commands (`kubectl get pods`, `sudo hire-me`, `fortune`, `uptime`,
`git blame`, `chaos`, `rules`, `github`, `map`), clicking the brand mark five times,
typing "dns", "yaml", "deploy", or "sudo" anywhere on the page, the Konami code,
switching tabs, and a note in the DevTools console. Each secret unlocks an achievement.

## Now building
The portfolio features Together Parenting, a product we are building for shared
family care, with the app icon, product link, and an illustrative shared-care
interaction.

## Private hosted version
https://adebiyi-adegboye-platform.zeal22.chatgpt.site
