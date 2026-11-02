# Rehearsal: cutover

**Gold copied:** `dark-hero` (dark deployments dashboard: surface steps instead of shadow, one lit colour, a status changing on its own pill). Layout: corner bleed, inset top and left, off the right and bottom.

**What changed from the gold:** a cutover instead of one deploy. Ten environment tiles move On-prem → Syncing → Healthy in five waves over a Friday-to-Monday clock. One big number (`00/10` → `10/10`), the phase on one pill (Change freeze → Migrating → Live), and the payoff toast "Monday 09:00 · No issues on day one". No cursor: the story is what the system does. It plays once, on the mission's button. The poster is the finished state.

**Real strings (6):** Cutover, the phase, the clock, the environment count, "19 core · 24 micro", the toast. Tile names and the sidebar are bars.

**Filmed** with `scripts/film.mjs --states --gate` at the wide design (760×430, shown at 1.37× in the case study) and at 390 (compact, 358×340), plus a `--reduced --still` poster.

**Fixed during rehearsal:**
- `Count` popped a new tens column ("1/10" ghost, "18/10" mid-roll). The count is now always two digits.
- `Swap` labels vanished in one frame and resized the clock pill. Replaced with dark-hero's stacked crossfade, so the clock has a fixed box and the phase pill eases from its right edge.
- Phase widths were measured before the web font loaded, leaving the pill lopsided. They're re-measured on `document.fonts.ready`.
- Window foot visible (a near-tangent): it now runs well past the bottom. Tiles 4px from the right edge: now a full 36px gutter.
- Toast restyled through `.ss-toast`: moved into the demo's own `.co-toast-slot`.
- Compact: the toast was cut by the crop and then sat on the tiles; tiles became status chips, spacing was tightened, and the window bleeds 78px past the edge and stays at least square.

**Remaining film lines, judged:**
- `kit override: .ss-toast` is a false positive from bundling. The check skips stylesheets served from a `/kit/` path, and our build compiles the kit's own CSS into `js/demos/cutover.css`, so the kit's own Toast rule is read as ours. This is the one line failing the gate.
- `lopsided: ss-badge` (5–6px vs 9px) is the kit Badge's lead-icon padding. The gold `dark-hero` reports the same.
- `jump`/`settle snap` on `Count` digit strips is the kit re-centring its strips after a roll, with the same digit showing.
- `touching: /10` at 3px is a unit "a hair from the digits", as `kit.md` (Count) asks.

**Not checked:** the light theme (the site is dark only), the playground's own viewer, and a fresh-eye review by another person.
