# Adebiyi Adegboye — Personal Website

A personal website covering platform engineering, cloud architecture, leadership,
career experience, education, and selected work. Customer and product names are
anonymized throughout the website, downloadable CV, and motion film.

## Run locally
From this directory, run:
    python3 -m http.server 4173 --bind 127.0.0.1
Then open http://127.0.0.1:4173.

This is a static website. It needs no package installation or build step.

## Files
- index.html: page content and accessible navigation
- styles.css, console.css, motion.css, personal.css: responsive design and motion
- career.js: generic project descriptions and career timeline
- app.js: dialogs, command navigation, and interface controls
- experience.js: interactive console and scroll-driven scenes
- reel.js: motion film playback
- assets/: CV downloads, film, and poster
- tools/motion-film/: editable renderer and original soundtrack generator

The source for the 24-second film renders native 1080p at 60 fps using Python,
Pillow, NumPy, and FFmpeg. See tools/motion-film/README.md.

## Private hosted version
https://adebiyi-adegboye-platform.zeal22.chatgpt.site

## Now building
The portfolio features Together Parenting, a product we are building for shared
family care, with the app icon, product link, and an illustrative shared-care
interaction. The section is implemented in together.css and together.js.

## Profile film
Systems in Motion is visible directly in the page at #film, with a poster,
native video controls, a Play film button, and an MP4 download. The hero,
navigation, footer, and terminal reel command provide direct entry points.
The responsive player is styled in film.css and controlled by reel.js.

## Welcome motion
The welcome screen automatically plays a silent 13.7-second highlights loop.
It respects reduced-motion preferences and the page motion toggle, and pauses
when offscreen, in a hidden tab, or while the full film plays. On small screens
the preview appears directly below the name. The interactive console is in the
Platform Lab section. Implementation: welcome.css and welcome.js.

Regenerate the 720p, 30 fps preview with FFmpeg installed:
    python3 tools/motion-film/make_welcome_preview.py --site-directory .
