# Connected Basketball

Enable **Connected Basketball** in the main-menu Mods screen or when creating a
basketball league. Open **League → College & G League**, then choose **Create
connected world**. Historical roster forcing and repeat-season modes must be off.
The normal NBA league remains playable, including NBA Cup if enabled.

## Included

- 365 colleges, conference membership, generated players and coaches, program
  prestige, and simulated NIL budgets.
- College schedules, conference standings and tournaments, automatic qualifiers,
  a modeled at-large selection process, national championship, and NIT.
- 31 G League clubs, schedules, standings, playoffs, NBA affiliates, NBA player
  assignments and recalls, and minimum-contract NBA call-ups.
- One player record throughout college, the NBA draft, and professional play.
  College and G League statistics remain visible on NBA player profiles.
- Enrollment and eligibility clocks, seasons played, GPA checks, redshirts,
  a transfer pool, recruiting contacts, scholarship roster limits, and NIL offers.
- College and G League games advance alongside NBA days. You can also advance
  the secondary competitions from their page. The NBA draft completes the college
  postseason before preparing the draft pool.
- Drafted players join the ordinary NBA roster and contract system. Undrafted
  professionals join G League rosters. Recruiting opens after the NBA draft.
  Next preseason archives the results, develops players, and fills college rosters.

Assignments retain the NBA contract and roster spot; assigned players are excluded
from NBA game lineups until recalled. Call-ups require an open NBA roster place
and respect a hard salary cap. An affiliate's ordinary G League players are not
exclusive NBA property. Established worlds cannot be disabled through Mods.

## Rules and realism boundaries

This is a playable simulation model, not a complete NCAA compliance engine or a
verified real-player roster. It does not yet model individual eligibility waivers,
the complete recruiting calendar, two-way contracts, coach hiring careers, exact
real-world schedules, or every postseason bracketing restriction.

Program prestige, budgets, recruiting interest, coaching strength, and selection
scores are estimates. The ranking model uses records, opponent strength, and
point differential; it is not the NCAA NET formula. College games use a separate
possession model with two halves and five fouls; G League games use four quarters,
six fouls, and single-free-throw scoring outside late-game situations. Secondary
competition box scores never count as NBA statistics.

The eligibility model uses four seasons within five years for earlier cohorts
and five seasons for entrants from 2027. This simplifies transitional exceptions.
The national tournament uses 76 teams for seasons labeled 2026 onward (the
2026–27 academic year), and 68 for earlier years. School and conference data is a
2026 snapshot, including when starting an earlier NBA season.

NBA parent teams are matched by franchise abbreviation or region. Fictional NBA
leagues receive a fallback affiliate assignment. Mexico City remains independent.

## Data and references

School names and conference memberships were collected November 14, 2026 from
ESPN's public college basketball team and group feeds. G League clubs and NBA
affiliations were checked against the official league directory. Discontinued
Ignite and exhibition-only teams are excluded. No real-player roster or logos
are included in the data pack.

- [ESPN college teams](https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams?limit=1000&groups=50)
- [ESPN college groups](https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/groups?limit=1000)
- [Official G League teams and affiliates](https://gleague.nba.com/teams)
- [G League roster and assignment FAQ](https://gleague.nba.com/faq)
- [NCAA eligibility model](https://www.ncaa.org/news/division-i-adopts-age-based-eligibility-model/)
- [NCAA tournament expansion](https://www.ncaa.org/championships/march-madness/expansion-what-to-know/)

## Implementation

The world is the optional `basketballWorld` game attribute. Players carry optional
`basketballPathway` metadata and use dedicated college, G League, and recruiting
team IDs outside the professional team range. The cache loads those IDs explicitly.
League exports and imports include both the world and its canonical player records.

Worker code lives in `src/worker/core/basketballWorld/`; the shared schema is
`src/common/basketballWorld.ts`. Hooks connect NBA daily simulation, draft
preparation, draft selections, after-draft processing, and preseason rollover.

Targeted tests cover scheduling, eligibility, box-score totals, season completion,
champions, draft-pool identity, saved world updates, and roster ownership checks.
