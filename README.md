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
interaction: click a pod (or the HUD's "Break a pod" button) and watch it crash and
heal. No WebGL, reduced motion or the motion toggle: the scene holds still or stays
away, and the text carries everything. The only hidden extra is a terminal (backtick key).

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
- css/scene.css: the fixed scene layer and its HUD
- vendor/three.module.min.js: three.js r160 (MIT), pinned and self-hosted
- fonts/: Inter Tight and JetBrains Mono variable woff2, Latin subset (SIL OFL)
- docs/rebuild-outline.md: the content outline, with a source for every claim
- assets/: CV downloads, share card, Together app icon

All decorative motion respects reduced-motion preferences and the header toggle.

## Now building
The Record act links to Together Parenting, a product we are building for shared
family care.

## Private hosted version
https://adebiyi-adegboye-platform.zeal22.chatgpt.site
