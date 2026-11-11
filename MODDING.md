# ZenGM mod workspace

Local copy of https://github.com/zengm-games/zengm at commit
`ac109bb79273da0b47e4d583cb889be051bfdf7f` (2026-11-11).
Work on branch `mods`. The original repository is the `upstream` remote.

## Code overview

### Where to start a mod

| Change                                        | Location                                    |
| --------------------------------------------- | ------------------------------------------- |
| Screens, menus, and React components          | `src/ui/`                                   |
| Data prepared for screens                     | `src/worker/views/`                         |
| Actions sent from UI to the game worker       | `src/worker/api/`                           |
| Match simulation                              | `src/worker/core/GameSim.{sport}/`          |
| Player generation and development             | `src/worker/core/player/`                   |
| Draft, trades, contracts, and finances        | Corresponding folders in `src/worker/core/` |
| Season and phase progression                  | `src/worker/core/season/` and `phase/`      |
| Shared rules, constants, and default settings | `src/common/`                               |
| Persistent data and in-memory cache           | `src/worker/db/`, especially `Cache.ts`     |
| Build and development tooling                 | `tools/`                                    |

The browser UI communicates with the game worker through `toWorker` and
`toUI`. Most simulation logic lives in the worker. When changing cached
records, write them back with the appropriate `idb.cache.*.put` call.

## Run the game locally

Upstream requires Node.js 24 and pnpm 12. Node 24 is installed on this
machine; the detected pnpm version at setup was 11.25.0, so use pnpm 12
before installing dependencies. Dependencies were subsequently installed
with pnpm 12.18.0 for the NBA Cup mod.

## NBA Cup mod

Start a basketball league and advance to the regular season. The cup starts
automatically for 82-game leagues with 30 active teams in two conferences of 15. An existing regular season gets its first cup next season. Other league
sizes and other sports keep their normal schedules.

Open **League → NBA Cup** for group standings, qualifiers, a mirrored playoff
bracket, linked box scores, and the Cup MVP. Cup games remain labeled in
schedule score boxes. Cup banners read **NBA Cup Champions**.

The champion's final roster receives **NBA Cup Winner** awards on player
profiles. **NBA Cup MVP** goes to the player on that roster with the highest
total Game Score across the tournament, including the final. Awards appear
in the profile summary and season stats' awards column. Existing completed
cups receive awards when opened if their saved box scores are available.

Team history shows a Cup win count, banners, and season winner labels.
League history has Cup champion and MVP columns, and season summaries show
the winner and MVP. Cup titles are counted separately from league titles.

Each conference has three randomly drawn groups of five. Every team plays
four group games (two home, two away). Three group winners and one wild card
per conference advance to single-game quarterfinals and semifinals. The
neutral-site championship is excluded from season stats, records, finances,
and head-to-head standings. Cup games always use overtime to produce a winner.

The schedule reserves four group games and two knockout/consolation games,
preserving 82 counting games per team. The finalists play one extra game.
Group nights are interleaved with the first 20 schedule days, followed by
a dedicated knockout window.

Adaptations for ZenGM: group draws are random rather than seeded by last
year's records. Tiebreaks use head-to-head for a two-team group tie, then
point differential, points, and draw order. Conference seeding uses team ID
for the final fallback. Scores include overtime. Non-qualifiers play a
home-and-away consolation pair that may cross conferences. The schedule
editor is available after the cup ends to protect reserved tournament games.
The Cup page's season selector retains past tournaments. Completed cups are
archived when the next season's schedule is generated.

Validation: eight cup tests, award/profile and route tests, and the existing
schedule tests pass (32 passed, one upstream skipped test). A browser
simulation completed all 67 cup games and the full regular season: all 30
teams finished with 82 counting games. Saved team records and stats matched
counting games with the final excluded. TypeScript and changed-file lint pass.

```powershell
pnpm install
node --run dev
```

Basketball is the default. To select another sport:

```powershell
$env:SPORT = 'football' # or baseball, hockey, basketball
node --run dev
```

Follow the URL printed by the development server. After code changes,
run `node --run lint` and `node --run test` as appropriate.

## Track upstream changes

```powershell
git fetch upstream
git merge upstream/master
```

The GitHub fork is https://github.com/IraqLobster34/zengm and is configured
as `origin`; `upstream` remains the original ZenGM repository. The mod lives
on branch `mods`. See `docs/SHARING.md` for the publishing checklist.
Keep the original [license](LICENSE.md) with the source. It permits private
local use and modifications and restricts public hosting and redistribution
of playable builds; see its full terms before sharing.
