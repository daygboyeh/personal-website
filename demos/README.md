# Demos (authoring source)

Product demos built with the Stageshow kit (`src/kit`, MIT, copied from the
Stageshow skill; see `src/kit/LICENSE` and `src/kit/NOTICE.md`). The live site
does not build anything: the output in `../js/demos/` is committed.

To change a demo:

    cd demos
    npm install
    npm run build

`src/kit/brands/` (third-party logo artwork) is not used and is git-ignored.

- `cutover`: the migration case study's dashboard. An illustrative replay of
  the weekend cutover (10 environments, 19 core + 24 microservices, no issues
  on day one). Played by the "Run the cutover" mission (`../js/game/missions/cutover.js`).
