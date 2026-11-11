# NBA Cup mod release notes

## 0.2.0 — NBA-style seeded group draw

- Seeded pots use the previous regular-season conference standings: ranks 1–3, 4–6, 7–9, 10–12, and 13–15.
- Each group randomly receives exactly one team from every pot.
- Draw pots are saved with the Cup and can be viewed on its page.
- First seasons without prior results use a randomized draw. Teams individually missing history fill the remaining lowest-ranked slots randomly.
- Existing Cup groups are preserved; the change applies to the next draw.
- Added checks for pot membership, previous-season data, missing history, and seeded schedule totals. 35 focused tests pass, with one upstream test skipped.

## 0.1.1 — source package cleanup

- Removed generated Graphify output from the published source tree.
- Ignored local repository maps so they cannot be included accidentally again.
- Removed documentation links to files that are no longer distributed.
- No gameplay changes.

## 0.1.0 — initial release

An in-season Cup for Basketball GM, integrated with the existing simulation.

## What's included

- Dedicated League → NBA Cup page with group standings and a mirrored conference bracket using the game's playoff matchup cards.
- Six five-team groups, four group games per team, conference wild cards, and single-game knockout rounds.
- Knockout/consolation scheduling that preserves 82 counting games for every team.
- An extra neutral-site championship excluded from regular-season player stats, team stats, records, finances, and head-to-head standings.
- NBA Cup MVP based on total tournament Game Score among the winning final roster.
- NBA Cup Winner awards for the champion's final roster, including players who did not play in the final.
- Profile honors, season award labels, team-history win totals and banners, league-history Cup champion and MVP columns, and season-summary results.
- Archived Cup pages and banners labeled NBA Cup Champions.

## Getting started

Use the `mods` branch. Install Node.js 24, then run:

```sh
npx --yes pnpm@12 install
node --run dev
```

Create a 30-team basketball league with two 15-team conferences and 82 games. Advance to the regular season and open League → NBA Cup. Existing regular seasons get a Cup next season if eligible.

## Notes

The format uses random draws, simplified tiebreaks including overtime, and consolation pairings that may cross conferences. The schedule editor is available after the Cup. Prize money and an All-Tournament Team are not included.

Older completed Cups can receive profile awards when their Cup page is opened if saved box scores exist. Source downloads do not contain your saved leagues.

## Verification

32 focused tests passed; one upstream test skipped. TypeScript and changed-source lint passed. A browser simulation completed all 67 Cup games and the full regular season, preserving 82 counting games per team. Profile awards, team/league history, season summaries, and desktop/narrow-screen Cup pages were checked.

## Distribution

Source for private local use under [ZenGM's original license](LICENSE.md). Include that license when sharing. No hosted playable build or installer is provided.
