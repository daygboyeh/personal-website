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

The page is complete without JavaScript. Stage B (in progress) adds one three.js
cluster scene behind all five acts, with a single interaction: break a pod and watch
it heal. The only hidden extra is a terminal (backtick key).

## Run locally
From this directory, run:
    python3 -m http.server 4173 --bind 127.0.0.1
Then open http://127.0.0.1:4173.

This is a static website. It needs no package installation or build step.
Bump the `?v=` query on stylesheet and script URLs in index.html when you deploy
changes, so returning visitors don't run stale cached files.

## Files
- index.html: all content, as semantic HTML
- css/tokens.css: colour, type and spacing scales (one dark theme)
- css/layout.css: base elements, header, buttons, footer, terminal, toast
- css/acts.css: the five acts
- js/main.js: entry point (ES modules, no build step)
- js/motion.js: decorative-motion state and the header toggle
- js/terminal.js, js/toast.js: the terminal and status messages
- docs/rebuild-outline.md: the content outline, with a source for every claim
- assets/: CV downloads, share card, Together app icon

All decorative motion respects reduced-motion preferences and the header toggle.

## Now building
The Record act links to Together Parenting, a product we are building for shared
family care.

## Private hosted version
https://adebiyi-adegboye-platform.zeal22.chatgpt.site
