# Adebiyi Adegboye — Personal Website

A personal website covering platform engineering, cloud architecture, leadership,
career experience, education, and selected work. Customer and product names are
anonymized throughout the website and downloadable CV.

## Concept: five acts, one cluster
Written for recruiters and hiring managers for platform lead roles. The page is five
acts: **Hero**, **Proof** (five beats from one container to a platform), **Work** (two
deep case studies plus "also shipped"), **Leadership** (his own principles) and
**Record + contact**. Every number comes from the CV; see docs/rebuild-outline.md for
the source of each claim and the facts still awaiting confirmation.

The page is complete without JavaScript. Once the text is on screen, one three.js
cluster scene loads behind all five acts. Each act (and each proof beat) pins a pod
layout and a camera; scrolling morphs between them: the namespace city, one container,
a Helm release, the 43-service migration, a self-healing mesh, the ~13× data loader,
three towers for leadership, a career skyline, and a wall that says HI!. The one
interaction: click a pod (or the pager's "Break a pod" button) and watch it crash and
heal. No WebGL, reduced motion or the motion toggle: the scene holds still or stays
away, and the text carries everything. The only hidden extra is a terminal (backtick key).

## The on-call game
Every interaction belongs to one game. The visitor goes on call for the platform, and
each act has one mission:
1. **Break a pod** (hero): crash a pod and watch it heal.
2. **Roll out the proof**: read all five proof beats.
3. **Run the cutover** (Work): replay the weekend migration across 10 environments.
4. **Find the bottleneck** (Work): profile the data loader and tune the slow stage.
5. **Bring it together** (Now building): merge the care clusters.

Contact ends the shift with a handover report and an email button. The pager (bottom
left) shows progress and the error budget, and its mission list doubles as page
navigation. Every mission works without WebGL (add `?noscene` to the URL to test that)
and steps rather than animates when motion is paused. The cutover log and the loader's
stage split are labelled illustrative; the facts they illustrate are from the CV.
Progress is kept in this browser only (`ade-shift-v1`) and the page works without it.

## Run locally
From this directory, run:
    python3 -m http.server 4173 --bind 127.0.0.1
Then open http://127.0.0.1:4173.

This is a static website. It needs no package installation or build step.
Bump the `?v=` query on stylesheet and script URLs in index.html when you deploy
changes, so returning visitors don't run stale cached files. Modules under js/ import
each other without a query, so _headers asks browsers to revalidate them.

## Files
- index.html: all content, as semantic HTML
- css/tokens.css: colour, type and spacing scales (one dark theme)
- css/layout.css: base elements, header, buttons, footer, terminal, toast
- css/acts.css: the five acts
- js/main.js: entry point (ES modules, no build step)
- js/motion.js: decorative-motion state and the header toggle
- js/terminal.js, js/toast.js: the terminal and status messages
- js/scene/scene.js: the three.js scene, scroll stops, camera and break-a-pod
- js/scene/layouts.js: pod layouts per stop (pure data)
- css/scene.css: the fixed scene layer
- js/game/engine.js: the game framework: missions, shift state, events, announcements
- js/game/hud.js: the pager (status, mission list as navigation, rollout bar)
- js/game/missions/: one module per mission, plus the handover report
- css/game.css: pager, mission blocks and handover
- vendor/three.module.min.js: three.js r160 (MIT), pinned and self-hosted
- fonts/: Inter Tight and JetBrains Mono variable woff2, Latin subset (SIL OFL)
- docs/rebuild-outline.md: the content outline, with a source for every claim
- assets/: CV downloads, share card, Together app icon

All decorative motion respects reduced-motion preferences and the header toggle.

## Now building
A "Now building" section between Work and Leadership features Together Parenting,
a product we are building for shared family care, with its own scene.

## Private hosted version
https://adebiyi-adegboye-platform.zeal22.chatgpt.site
