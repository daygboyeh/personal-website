# Systems in Motion
An original 24-second engineering profile film for Adebiyi Adegboye.

## Deliverable
1920 × 1080, 60 fps, H.264 High profile, AAC stereo at 48 kHz.
120 BPM original synthesized soundtrack. No stock footage or sampled music.

## Story
00:00 — Systems in Motion
00:02.5 — Build Beyond
00:05 — Distributed systems
00:08.5 — Azure and AKS architecture and delivery
00:11.5 — Engineering leadership
00:14 — Selected Alveo outcomes: 30%, 75%, 20%
00:17 — Career progression: TLS Logistics, Audeo, Alveo, Gresham
00:20 — Name, role, and contact

Résumé facts follow the previously prepared CV; the Azure section reflects
the user's explicit correction that they architected and delivered the platform.

## Source
- drawing.py: reusable drawing, easing, projection, and masked type
- scenes.py: eight scenes and match-cut transitions
- soundtrack.py: original deterministic music and sound design
- render.py: storyboard, native-resolution frame rendering, encoding, QA metadata

## Re-render on macOS
Requires Python with Pillow and NumPy, and FFmpeg / FFprobe.
Run python3 render.py --preview for the storyboard.
Run python3 render.py for the 60 fps master.
The default fonts are Helvetica Neue and SF Mono from macOS; no font files
are redistributed. Set MOTION_FONT and MOTION_MONO to use alternative fonts.

The renderer writes deliverables to an outputs directory two levels above
the source folder. Adjust OUT in render.py to change the destination.
