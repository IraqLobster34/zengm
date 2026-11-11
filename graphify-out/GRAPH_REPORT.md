# Graph Report - zengmmods (2026-11-11)

## Corpus Check

- cluster-only mode — file stats not available

## Summary

- 6096 nodes · 26757 edges · 148 communities (139 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 565 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `ac109bb7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 117
- Community 119
- Community 120
- Community 121
- Community 123
- Community 124
- Community 125
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 134
- Community 135
- Community 136
- Community 138
- Community 139
- Community 140
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 149
- Community 150
- Community 151
- Community 152
- Community 154
- Community 155
- Community 156
- Community 157

## God Nodes (most connected - your core abstractions)

1. `g` - 338 edges
2. `idb` - 283 edges
3. `useLocal()` - 273 edges
4. `toWorker()` - 255 edges
5. `bySport()` - 252 edges
6. `useTitleBar()` - 235 edges
7. `react` - 233 edges
8. `helpers` - 229 edges
9. `helpers` - 198 edges
10. `PHASE` - 189 edges

## Surprising Connections (you probably didn't know these)

- `getLogoFirstFrame()` --calls--> `getLogoSpinnerUrl()` [EXTRACTED]
  src/ui/util/takeScreenshotChunk.ts → common/logoSpinners.ts
- `renderSport()` --calls--> `getLogoSpinnerUrl()` [EXTRACTED]
  tools/logo-spinners/generate-all.ts → common/logoSpinners.ts
- `Cache` --references--> `Awards` [EXTRACTED]
  src/worker/db/Cache.ts → common/types.ts
- `LeagueDB` --references--> `Awards` [EXTRACTED]
  src/worker/db/connectLeague.ts → common/types.ts
- `FallbackGlobal()` --calls--> `useTitleBar()` [EXTRACTED]
  src/ui/components/ErrorBoundary.tsx → src/ui/hooks/useTitleBar.tsx

## Import Cycles

- 3-file cycle: `src/worker/core/game/index.ts -> src/worker/core/game/play.ts -> src/worker/core/index.ts -> src/worker/core/game/index.ts`
- 3-file cycle: `src/worker/core/index.ts -> src/worker/core/trade/index.ts -> src/worker/core/trade/makeItWork.ts -> src/worker/core/index.ts`
- 3-file cycle: `src/worker/core/index.ts -> src/worker/core/trade/index.ts -> src/worker/core/trade/processTrade.ts -> src/worker/core/index.ts`
- 3-file cycle: `src/worker/core/index.ts -> src/worker/core/trade/index.ts -> src/worker/core/trade/propose.ts -> src/worker/core/index.ts`
- 3-file cycle: `src/worker/core/index.ts -> src/worker/core/trade/index.ts -> src/worker/core/trade/summary.ts -> src/worker/core/index.ts`
- 3-file cycle: `src/worker/util/lock.ts -> src/worker/util/sim.ts -> src/worker/util/updatePlayMenu.ts -> src/worker/util/lock.ts`
- 3-file cycle: `src/worker/core/contractNegotiation/afterAccept.ts -> src/worker/core/index.ts -> src/worker/core/contractNegotiation/index.ts -> src/worker/core/contractNegotiation/afterAccept.ts`
- 3-file cycle: `src/worker/core/draft/genPlayersWithoutSaving.ts -> src/worker/core/index.ts -> src/worker/core/draft/index.ts -> src/worker/core/draft/genPlayersWithoutSaving.ts`
- 3-file cycle: `src/worker/db/index.ts -> src/worker/db/merged/index.ts -> src/worker/db/merged/teamSeasons.ts -> src/worker/db/index.ts`
- 3-file cycle: `src/worker/core/index.ts -> src/worker/core/realRosters/index.ts -> src/worker/core/realRosters/updateRandomDebutsForever.ts -> src/worker/core/index.ts`
- 3-file cycle: `src/worker/core/draft/index.ts -> src/worker/core/draft/selectPlayer.ts -> src/worker/core/index.ts -> src/worker/core/draft/index.ts`
- 3-file cycle: `src/worker/db/index.ts -> src/worker/db/merged/index.ts -> src/worker/db/merged/draftPicks.ts -> src/worker/db/index.ts`
- 3-file cycle: `src/worker/db/index.ts -> src/worker/db/merged/index.ts -> src/worker/db/merged/engine.ts -> src/worker/db/index.ts`
- 3-file cycle: `src/worker/db/index.ts -> src/worker/db/merged/index.ts -> src/worker/db/merged/events.ts -> src/worker/db/index.ts`
- 4-file cycle: `src/worker/core/game/index.ts -> src/worker/core/game/play.ts -> src/worker/core/game/loadTeams.ts -> src/worker/core/index.ts -> src/worker/core/game/index.ts`
- 4-file cycle: `src/worker/core/game/index.ts -> src/worker/core/game/play.ts -> src/worker/core/game/writeGameStats.ts -> src/worker/core/index.ts -> src/worker/core/game/index.ts`
- 4-file cycle: `src/worker/core/game/index.ts -> src/worker/core/game/play.ts -> src/worker/core/game/writePlayerStats.ts -> src/worker/core/index.ts -> src/worker/core/game/index.ts`
- 4-file cycle: `src/worker/core/game/index.ts -> src/worker/core/game/play.ts -> src/worker/core/game/writeTeamStats.ts -> src/worker/core/index.ts -> src/worker/core/game/index.ts`
- 4-file cycle: `src/worker/core/index.ts -> src/worker/core/trade/index.ts -> src/worker/core/trade/betweenAiTeams.ts -> src/worker/core/team/ValueChangeCalculator.ts -> src/worker/core/index.ts`
- 4-file cycle: `src/worker/core/index.ts -> src/worker/core/trade/index.ts -> src/worker/core/trade/betweenAiTeams.ts -> src/worker/core/trade/makeItWork.ts -> src/worker/core/index.ts`

## Communities (148 total, 9 thin omitted)

### Community 0 - "Community 0"

Cohesion: 0.05
Nodes (137): cols, ColTemp, getCols(), sportSpecificCols, View, CheckmarkOrCross(), Props, wrappedCheckmarkOrCross() (+129 more)

### Community 1 - "Community 1"

Cohesion: 0.10
Nodes (27): getCol(), BoxPlot(), boxPlotElementStyle(), calculateValues(), quartile(), scaleValue(), RetiredPlayers(), StatWithChange() (+19 more)

### Community 3 - "Community 3"

Cohesion: 0.04
Nodes (122): react, react-select, @tanstack/react-virtual, workbox-window, GAME_ACRONYM, PHASE_TEXT, ActionButton(), styleGrid11 (+114 more)

### Community 5 - "Community 5"

Cohesion: 0.06
Nodes (57): @dnd-kit/sortable, Col, SuperCol, BulkAction, BulkActions(), BulkActionsProps, BulkActionsUI(), ExportModal() (+49 more)

### Community 6 - "Community 6"

Cohesion: 0.03
Nodes (162): POSITIONS, REMAINING_PLAYOFF_TEAMS_PHASES, TEAM_STATS_TABLES, dropdownKeys, playoffs, statTypes, statTypesAdv, teamOpponentAdvanced (+154 more)

### Community 7 - "Community 7"

Cohesion: 0.16
Nodes (19): getBestPlayerBoxScore(), helpers, processStats(), StatFunction, statFunctions, processStats(), StatFunction, statFunctions (+11 more)

### Community 8 - "Community 8"

Cohesion: 0.06
Nodes (61): conditional-type-checks, vitest, DEFAULT_LEVEL, DEFAULT_PLAY_THROUGH_INJURIES, EXHIBITION_GAME_SETTINGS, PLAYER, PlayerStats, last() (+53 more)

### Community 9 - "Community 9"

Cohesion: 0.12
Nodes (7): initGold(), newLid(), realtimeUpdate2(), showNotification2(), PersistentStorageNotification(), requestPersistentStorage(), ShowNotificationOptions

### Community 10 - "Community 10"

Cohesion: 0.05
Nodes (77): levelToAmount(), SALARY_CAP_SCALE_LEGACY, formatScoreWithShootout(), Team, getAdjustedTicketPrice(), PLAYOFF_ATTENDANCE_FACTOR, getWinner(), TeamNotPlayed (+69 more)

### Community 11 - "Community 11"

Cohesion: 0.09
Nodes (24): coachingEffect(), realGauss(), RatingKey, RatingKey, calcBaseChange(), calcBaseChange(), iqFormula, RatingFormula (+16 more)

### Community 12 - "Community 12"

Cohesion: 0.23
Nodes (13): isWorkerBusy(), Locks, newPhaseUnlocked(), onNewPhaseDone, onViewsDone, reset(), resolveAll(), runView() (+5 more)

### Community 13 - "Community 13"

Cohesion: 0.10
Nodes (33): MOOD_TRAITS, MoodComponents, MoodTrait, InjuryIcon(), componentText(), highlightColor(), Mood(), MoodTextRow() (+25 more)

### Community 14 - "Community 14"

Cohesion: 0.08
Nodes (36): WEBSITE_PLAY, confirm, confirmFunction, relativeTime(), Ago(), Dashboard(), difficultyText(), dropdownStyle (+28 more)

### Community 15 - "Community 15"

Cohesion: 0.09
Nodes (34): DiscriminateUnion, TradeEventTeams, OrderBySortParams, assetIsPlayer(), formatAssets(), formatEventText(), formatPick(), getPlayerFromPick() (+26 more)

### Community 16 - "Community 16"

Cohesion: 0.05
Nodes (72): allowForceTie(), DAILY_SCHEDULE, AgeAtDeath(), shouldUseAgeAtDeath(), wrappedAgeAtDeath(), hiddenStyle, LeagueTopBar, Toggle() (+64 more)

### Community 17 - "Community 17"

Cohesion: 0.08
Nodes (50): LEAGUE_DATABASE_VERSION, REAL_PLAYERS_INFO, GetLeagueOptions, PlayerInjury, FREE_AGENCY_DAYS, addRelatives(), addRetiredJerseyNumbers(), addSeasonInfoToTeams() (+42 more)

### Community 18 - "Community 18"

Cohesion: 0.08
Nodes (52): canTradeInPhase(), getTradeBlockedReason(), TradeBlockedReason, LocalStateUI, Contract(), ContractAmount(), ContractAmountPlayer, ContractExp() (+44 more)

### Community 19 - "Community 19"

Cohesion: 0.09
Nodes (47): healthEffect(), uniform(), InjuriesSetting, MinimalPlayerRatings, NonEmptyArray, Race, fillContractDefaults(), addRatingsRow() (+39 more)

### Community 20 - "Community 20"

Cohesion: 0.13
Nodes (22): IMPORT_BUTTON_STYLE, IMPORT_FILE_STYLE, resetFileInput(), FancySelect(), height, calculateStatistics(), getGradientStyle(), ActualGame (+14 more)

### Community 21 - "Community 21"

Cohesion: 0.04
Nodes (57): commonGlobals, author, bugs, url, engines, node, pnpm, homepage (+49 more)

### Community 22 - "Community 22"

Cohesion: 0.12
Nodes (29): PlayerAward, PlayerSalaryRow, HideableSection(), prefixCount(), SeasonIcons(), Props, TeamAbbrevLink(), wrappedTeamAbbrevLink() (+21 more)

### Community 23 - "Community 23"

Cohesion: 0.04
Nodes (95): ALL_STAR_GAME_ONLY, DEFAULT_JERSEY, DRAFT_BY_TEAM_OVR, NO_LOTTERY_DRAFT_TYPES, PHASE, PLAYER_GAME_STATS, POSITION_COUNTS, ContractSeasons (+87 more)

### Community 24 - "Community 24"

Cohesion: 0.07
Nodes (49): DEFAULT_REAL_DRAFT_RATINGS, GetLeagueOptionsReal, TragicDeaths, parseCurrencyFormat(), EditGameAttributes(), supportedKeys, supportedSettings, UNSUPPORTED_KEYS (+41 more)

### Community 25 - "Community 25"

Cohesion: 0.05
Nodes (60): NUM_PRIOR_SEASONS_EVENTS, NUM_PRIOR_SEASONS_TEAM_SEASONS, Store, storeInfos, CopyType, events(), games(), isNoSelector() (+52 more)

### Community 26 - "Community 26"

Cohesion: 0.06
Nodes (61): react-bootstrap, Base(), BaseballDiamond(), BoxScoreWrapper(), DetailedScore(), FourFactors(), FourFactorsAmountLine(), FourFactorsFootball() (+53 more)

### Community 27 - "Community 27"

Cohesion: 0.04
Nodes (85): addPrefixForStat(), makeResponsiveDropdownOption(), NewWindowLink(), Props, TitleBar(), Dropdown(), DropdownButtons, getButtons() (+77 more)

### Community 28 - "Community 28"

Cohesion: 0.03
Nodes (119): DEFAULT_PHASE_CHANGE_REDIRECTS, ERROR_MESSAGE_LEAGUE_NOT_FOUND, ERROR_MESSAGE_ONE_TAB, FACEBOOK_USERNAME, SUBREDDIT_NAME, TWITTER_HANDLE, isGoldActive(), Conditions (+111 more)

### Community 29 - "Community 29"

Cohesion: 0.06
Nodes (45): COMPOSITE_WEIGHTS, DEFAULT_CONFS, DEFAULT_DIVS, FATIGUE_POS, PLAYER_GAME_STATS, PLAYER_STATS_TABLES, PLAYER_SUMMARY, POSITION_COUNTS (+37 more)

### Community 31 - "Community 31"

Cohesion: 0.05
Nodes (45): PlayerRatings, PlayerStatAttrByPosDerived, PlayerStatAttrString, PlayerStats, PlayerStatsPlus, RatingKey, TeamStatAttr, PlayerRatings (+37 more)

### Community 32 - "Community 32"

Cohesion: 0.05
Nodes (56): @dnd-kit/core, react-confirm, DEFAULT_STADIUM_CAPACITY, Continent, continents, geographicCoordinates, realContinents, abbrevRewrites (+48 more)

### Community 33 - "Community 33"

Cohesion: 0.05
Nodes (38): cheerio, d3-dsv, playwright, gameAttributes, league, targetSeason, colleges, overrides (+30 more)

### Community 34 - "Community 34"

Cohesion: 0.16
Nodes (20): getTeamMov(), getValue(), MovOrDiff(), Stats, TeamMovOrDiff(), teamStatsToTotals(), Type, wrappedMovOrDiff() (+12 more)

### Community 35 - "Community 35"

Cohesion: 0.07
Nodes (51): COMPOSITE_WEIGHTS, hashSavedTrade(), TradePickValues, TradeSummary, TradeTeams, getPickValue(), Asset, EXPONENT (+43 more)

### Community 36 - "Community 36"

Cohesion: 0.13
Nodes (7): randInt(), truncGauss(), fatigue(), GameSim, PlayerGameSim, doInflation(), upcomingScheduledEventBlocksInflation()

### Community 37 - "Community 37"

Cohesion: 0.15
Nodes (23): advStats(), advStats(), advStats(), calculateBPM(), calculateOnOff(), calculatePER(), calculatePercentages(), calculateRatings() (+15 more)

### Community 38 - "Community 38"

Cohesion: 0.08
Nodes (42): Award, AwardInfoIndividual, AwardInfoTeam, pruneEmptyWinners(), showStatsByType, chunk(), getAwardCandidates(), getVariables() (+34 more)

### Community 40 - "Community 40"

Cohesion: 0.04
Nodes (49): dependencies, ajv, bootstrap, @bugsnag/browser, @bugsnag/plugin-react, clsx, confetti-js, d3-dsv (+41 more)

### Community 41 - "Community 41"

Cohesion: 0.10
Nodes (30): analyticsEventLocal(), DEFAULT_DIVS, NextPrevButtons(), PopText(), ExhibitionTeam, CustomizeSettings(), Action, animationVariants (+22 more)

### Community 42 - "Community 42"

Cohesion: 0.06
Nodes (36): COMPOSITE_WEIGHTS, DEFAULT_CONFS, DEFAULT_DIVS, NUM_ACTIVE_BATTERS, NUM_ACTIVE_PITCHERS, NUM_BALLS_PER_WALK, NUM_OUTS_PER_INNING, NUM_STARTING_PITCHERS (+28 more)

### Community 43 - "Community 43"

Cohesion: 0.17
Nodes (20): Args, Confirm, confirmDeleteWithChildren(), confirmFunction, Action, AddEditTeamInfo, AddTeam(), CardHeader() (+12 more)

### Community 44 - "Community 44"

Cohesion: 0.11
Nodes (31): gameAttributesCache, gameAttributesKeysOtherSports, wrapFromStart(), gameAttributeHasHistory(), gameAttributesArrayToObject(), getAll(), GameAttributesLeague, GameAttributesLeagueWithHistory (+23 more)

### Community 45 - "Community 45"

Cohesion: 0.14
Nodes (6): TeamNum, fatigue(), GameSim, PenaltyBox, PlayerGameSim, TeamGameSim

### Community 46 - "Community 46"

Cohesion: 0.04
Nodes (45): devDependencies, @babel/core, @babel/plugin-syntax-jsx, @babel/plugin-syntax-typescript, browserslist, cheerio, chokidar, cloudflare (+37 more)

### Community 47 - "Community 47"

Cohesion: 0.04
Nodes (77): AdvancedPlayerSearchField, allFilters, allFiltersTemp, getExtraStatTypeKeys(), getStats(), getStatsTableByType(), MinimalAdvancedPlayerSearchField, processStatsTable() (+69 more)

### Community 48 - "Community 48"

Cohesion: 0.16
Nodes (28): ACCOUNT_API_URL, STRIPE_PUBLISHABLE_KEY, fetchWrapper(), ProcessingSpinner(), analyticsEvent(), getScript(), LocalActions, realtimeUpdate() (+20 more)

### Community 49 - "Community 49"

Cohesion: 0.07
Nodes (40): COMPOSITE_WEIGHTS, DEFAULT_CONFS, DEFAULT_DIVS, PLAYER_GAME_STATS, PLAYER_STATS_TABLES, PLAYER_SUMMARY, POSITION_COUNTS, POSITIONS (+32 more)

### Community 50 - "Community 50"

Cohesion: 0.03
Nodes (72): applyRealTeamInfo(), applyToObject(), MyTeam, POTENTIAL_OVERRIDES, gameAttributesSyncedToUi, AlwaysWrap, CareerStatsKey, ContractPayment (+64 more)

### Community 51 - "Community 51"

Cohesion: 0.16
Nodes (16): COURT, DEFAULT_CONFS, CachedSettings, CachedTeam, corruptedLeagueMessage, Exhibition(), ExhibitionGameAttributes, ExhibitionLeague (+8 more)

### Community 52 - "Community 52"

Cohesion: 0.07
Nodes (32): @babel/core, @babel/plugin-syntax-jsx, @babel/plugin-syntax-typescript, browserslist, oxfmt, rolldown, rollup-plugin-blacklist, rollup-plugin-visualizer (+24 more)

### Community 53 - "Community 53"

Cohesion: 0.16
Nodes (17): omit(), getNumPlayersPerTeam(), getTidsWithNoPlayers(), initRandomDebutsForRandomPlayersLeague(), defaultAwards, defaultAwardsBaseball, defaultAwardsBasketball, defaultAwardsFootball (+9 more)

### Community 54 - "Community 54"

Cohesion: 0.12
Nodes (21): check(), checkBrickWall(), checkDynasty(), checkFoFoFo(), checkGoldenOldies(), checkMvp(), checkRunItBack(), checkSevenGameFinals() (+13 more)

### Community 55 - "Community 55"

Cohesion: 0.07
Nodes (52): DefaultNames, getFrequencies(), mergeCountries(), NamesLegacy, PlayerBioInfo, PlayerBioInfoProcessed, compareSortValues(), orderBy() (+44 more)

### Community 56 - "Community 56"

Cohesion: 0.11
Nodes (21): getEstPicks(), getEstWinPercent(), getModifiedPickRank(), getNumSlots(), getPickInfo(), getPickNumber(), getPickProbs(), getPicks() (+13 more)

### Community 57 - "Community 57"

Cohesion: 0.07
Nodes (50): SALARY_CAP_SCALE, TIEBREAKERS, ALL_STAR_GAME_TIDS, ByConf, OwnerMood, PlayoffSeriesTeam, getAwardsByPlayer(), doAwards() (+42 more)

### Community 58 - "Community 58"

Cohesion: 0.19
Nodes (14): posRatings(), posRatings(), posRatings(), posRatings(), ratingsGradientStyle, Props, RatingsStats(), Props (+6 more)

### Community 59 - "Community 59"

Cohesion: 0.06
Nodes (53): dunkInfos, getNumRounds(), getValidMoves(), isDunkContest(), AllStarPlayer, DunkAttempt, ThreeResult, getNextRoundType() (+45 more)

### Community 60 - "Community 60"

Cohesion: 0.05
Nodes (47): Awards, @dumbmatter/idb, AllStars, DraftLotteryResult, DraftPick, DraftPickWithoutKey, EventBBGM, EventBBGMWithoutKey (+39 more)

### Community 61 - "Community 61"

Cohesion: 0.16
Nodes (22): cancel(), checkCanUse(), DEFAULT_EIGHTY_TWO_ZERO_DRAFT, EightyTwoZeroDraftTeam, fetchRandomTeam(), finalize(), getActiveDraftErrorMessage(), getCappedLockedCount() (+14 more)

### Community 62 - "Community 62"

Cohesion: 0.07
Nodes (20): ERROR_SYMBOL, ExtraRenderDelays, FRAMES, Info, isInteractive(), makeSpinners(), mod(), RenderKey (+12 more)

### Community 63 - "Community 63"

Cohesion: 0.06
Nodes (25): chokidar, cloudflare, versionNumber, bySport(), deploy(), getCurrentBranch(), getSubdomain(), mySpawn() (+17 more)

### Community 64 - "Community 64"

Cohesion: 0.09
Nodes (21): playThroughInjuriesFactor(), PrimaryPosition, DEF_POSITIONS_DH, findMaxBy(), getDepthPitchers(), { ovr, prepareWholeRoster }, weights, { ovr, prepareWholeRoster } (+13 more)

### Community 65 - "Community 65"

Cohesion: 0.12
Nodes (27): FormattedContract, PlayerFiltered, PlayerFormatOptions, PlayerSeasonType, isFlatContract(), AbbrevsCache, abbrevsFromTeamSeasons(), createFormatter() (+19 more)

### Community 66 - "Community 66"

Cohesion: 0.07
Nodes (33): COMPOSITE_WEIGHTS, DEFAULT_CONFS, DEFAULT_DIVS, NUM_LINES, NUM_PLAYERS_PER_LINE, PLAYER_GAME_STATS, PLAYER_STATS_TABLES, PLAYER_SUMMARY (+25 more)

### Community 67 - "Community 67"

Cohesion: 0.13
Nodes (39): filterPlayerStats(), isAllStarTid(), BatterAndPitcher(), batterStats(), BoxScore, pitcherStats(), processEvents(), StatsTable() (+31 more)

### Community 68 - "Community 68"

Cohesion: 0.17
Nodes (21): DraftType, getNumColaLotteryTeams(), DIVIDE_CHANCES_OVER_TIED_TEAMS, draftHasLottery(), genOrder(), getLotteryChances(), getLotteryInfo(), getNumToPick() (+13 more)

### Community 69 - "Community 69"

Cohesion: 0.09
Nodes (33): backbone, backboneBase, centerY(), CONFIG, defs(), edgeOpacity(), football(), FootballColors (+25 more)

### Community 70 - "Community 70"

Cohesion: 0.13
Nodes (5): formatThree(), best_fit_func_exp(), get_cols(), get_cols(), get_cols()

### Community 71 - "Community 71"

Cohesion: 0.10
Nodes (23): @bugsnag/browser, @bugsnag/plugin-react, promise-worker-bi, react-dom, translation-resilience, EMAIL_ADDRESS, ERROR_MESSAGE_UNDEFINED_SEASON, Env (+15 more)

### Community 72 - "Community 72"

Cohesion: 0.42
Nodes (7): getRowInfo(), maxBy(), minBy(), sumBy(), sumRecordsFor(), tallyAwards(), Team

### Community 73 - "Community 73"

Cohesion: 0.30
Nodes (9): compositeRating(), fuzzOvrs(), applyFuzz(), fuzzRating(), getFuzz(), updateOvrMeanStd(), updateValues(), value() (+1 more)

### Community 74 - "Community 74"

Cohesion: 0.06
Nodes (22): just-clone, addPopRank(), deepCopy(), Entries, formatRecord(), getCountry(), getPopRanks(), isAmerican() (+14 more)

### Community 75 - "Community 75"

Cohesion: 0.05
Nodes (60): amountToLevel(), bound(), RealPlayerPhotos, getSeasons(), autoPlay(), clone(), getCloneName(), makeDBStream() (+52 more)

### Community 76 - "Community 76"

Cohesion: 0.09
Nodes (47): JERSEYS, PHASES_WHERE_TEAMS_CAN_BE_DISABLED, ScheduledEventsTeam, ExpansionDraftSetupTeam, ScheduledEventTeamInfo, EditTeamModal(), Action, getUniqueAbbrevsErrorMessage() (+39 more)

### Community 77 - "Community 77"

Cohesion: 0.08
Nodes (44): compareIds(), compareScheduledEvents, compareScheduledEventsForTeams, copyTeamFields(), getNextScheduledEventReplacing(), getScheduledEventPhases(), getSettingsBeforeScheduledEvent(), getTeamsAtEndOfScheduledEventPhase() (+36 more)

### Community 78 - "Community 78"

Cohesion: 0.10
Nodes (34): framer-motion, html2canvas, match-sorter, DEPTH_CHART_NAME, MenuItemLink, CollapseArrow(), AnchorProps, baseSort() (+26 more)

### Community 79 - "Community 79"

Cohesion: 0.31
Nodes (8): BUDGET_LEVEL_SCALE, MAX_LEVEL, assessPayrollMinLuxury(), rosterLink(), defaultBudgetLevel(), effectToLevel(), getLuxuryTaxAmount(), getMinPayrollAmount()

### Community 80 - "Community 80"

Cohesion: 0.08
Nodes (23): STARTING_NUM_TIMEOUTS, ClockFactor, CompositeRating, getSortedIndexes(), PlayerGameSim, PossessionOutcome, ShotType, Stat (+15 more)

### Community 81 - "Community 81"

Cohesion: 0.30
Nodes (9): PlayerRatings, PlayerWithoutKey, madeHof(), madeHof(), getMostCommonPos(), getThreshold(), madeHof(), madeHof() (+1 more)

### Community 82 - "Community 82"

Cohesion: 0.14
Nodes (21): benchScore(), DEF_POSITIONS, genDepth(), getDepthDefense(), getPositionIndexes(), getScorePosBonus(), PlayerForDepth, score() (+13 more)

### Community 83 - "Community 83"

Cohesion: 0.19
Nodes (12): COLA_ALPHA, COLA_OPT_OUT_PENALTY, range(), DRAFT_LOTTERY_FACTORS, initializeCola(), logChange(), PLAYOFF_FACTORS, updateColaAfterLottery() (+4 more)

### Community 84 - "Community 84"

Cohesion: 0.08
Nodes (24): weightByMinutes, BinaryOperator, FormulaEvaluator, FormulaFunction, functions, InvalidVariableError, Operator, operators (+16 more)

### Community 85 - "Community 85"

Cohesion: 0.11
Nodes (22): confetti-js, GameResult, TeamRecord, updateRecordForGameResult(), HeadlineScoreLive(), FastForward, useIsStuck(), DEFAULT_SPORT_STATE (+14 more)

### Community 86 - "Community 86"

Cohesion: 0.22
Nodes (13): NUM_OUTS_PER_GAME, outsToInnings(), sumByPos(), qbRat(), TeamStatAttrByPos, TeamStatAttr, TeamStatType, processStats() (+5 more)

### Community 87 - "Community 87"

Cohesion: 0.11
Nodes (27): Contract, ContractEndedEarly, ContractType, LegacyPlayerContractInfo, applyLegacyReleasedPlayers(), convertLegacyContracts(), estimatePayers(), estimatePaymentTeams() (+19 more)

### Community 88 - "Community 88"

Cohesion: 0.29
Nodes (11): makeSeededRandom(), PlayInTournament, getFirstRoundSlotProbs(), getRandomNumbers(), simPlayIn(), getFirstRoundTeams(), getNba2027PlayIn(), getTeamsByRound() (+3 more)

### Community 89 - "Community 89"

Cohesion: 0.11
Nodes (18): decodeURLEncodedURIComponent(), findAnchor(), getHistoryIndex(), makeRegex(), match(), NavigationEnd, NonStandardEvent, Params (+10 more)

### Community 90 - "Community 90"

Cohesion: 0.08
Nodes (32): nanoevents, AD_DIVS, MOBILE_AD_BOTTOM_MARGIN, VIDEO_AD_PADDING, VIDEO_ADS, api, Footer, footerLinks (+24 more)

### Community 91 - "Community 91"

Cohesion: 0.27
Nodes (8): facesjs, DEFAULT_TEAM_COLORS, isChristmas(), MyFace(), imgStyle, generate(), genRandomJersey(), isValidJersey()

### Community 92 - "Community 92"

Cohesion: 0.35
Nodes (11): ImportFileButton(), Controls(), ExportButton(), formatRows(), getColumns(), ImportButton(), isInvalidNumber(), parseAndValidate() (+3 more)

### Community 93 - "Community 93"

Cohesion: 0.08
Nodes (35): shuffle(), Conf, Div, augmentRealTeams(), getAllRealTeamInfos(), getRandomTeams(), MyTeam, TOO_MANY_TEAMS_TOO_SLOW (+27 more)

### Community 94 - "Community 94"

Cohesion: 0.07
Nodes (42): formatClock(), formatScoringSummaryEvent(), formatScoringSummaryEvent(), getPeriodName(), formatLiveGameStat, getInner(), POrValue, getName() (+34 more)

### Community 95 - "Community 95"

Cohesion: 0.04
Nodes (94): clsx, @tanstack/charts, use-local-storage-state, categories, types, LogEventType, PlayoffSeriesTeamAugmented, wait() (+86 more)

### Community 96 - "Community 96"

Cohesion: 0.19
Nodes (23): add(), cross(), dot(), normalize(), rotate(), scale(), seamSamples(), stitchPolygons() (+15 more)

### Community 97 - "Community 97"

Cohesion: 0.11
Nodes (21): baseballOverrides, defaultAwards, defaultAwardsBaseball, defaultAwardsBasketball, defaultAwardsFootball, defaultAwardsHockey, defaultGameAttributes, footballOverrides (+13 more)

### Community 98 - "Community 98"

Cohesion: 0.09
Nodes (16): TIME_BETWEEN_GAMES, plural(), roundContract(), timeBetweenGames(), copyValidValues(), parseContractAmount(), augmentPlayIns(), augmentSeries() (+8 more)

### Community 99 - "Community 99"

Cohesion: 0.18
Nodes (14): PlayerAwardBuiltIn, fast-deep-equal, DistributiveOmit, AwardByPlayer, getLeagueLeaderAwards(), logEventAwardsByPlayer(), ProcessAwardsReturn, formatAwardNamePrefix() (+6 more)

### Community 100 - "Community 100"

Cohesion: 0.15
Nodes (16): ajv, json-web-streams, fetchUserURL(), HTTP_ERROR_DESCRIPTIONS, LoadFromURL(), RealData(), decompressStreamIfNecessary(), emitProgressStream() (+8 more)

### Community 101 - "Community 101"

Cohesion: 0.30
Nodes (7): if(), evaluatePointsFormula(), formulaCache, PointsFormulaEvaluator, SYMBOLS, ptsMax(), ptsPct()

### Community 102 - "Community 102"

Cohesion: 0.27
Nodes (9): draftLotteryProbsCache, firstRoundSlotProbsCache, getDraftLotteryProbsCached(), getFirstRoundSlotProbsCached(), getSettingsKey(), getSlotPickProbsCached(), ProjectedTeam, slotPickProbsCache (+1 more)

### Community 103 - "Community 103"

Cohesion: 0.09
Nodes (29): WEBSITE_ROOT, gameAttributesKeysGameState, gameAttributesKeysTeams, ObsoleteGameAttributes, simpleGameAttributesUpgrade(), ErrorMessage(), initialState, LeagueFileUpload() (+21 more)

### Community 104 - "Community 104"

Cohesion: 0.31
Nodes (9): DEFAULT_POINTS_FORMULA, TeamAttr, filterOrderStats(), getFormatted(), getFormattedAll(), processAttrs(), processSeasonAttrs(), processStats() (+1 more)

### Community 105 - "Community 105"

Cohesion: 0.07
Nodes (33): AwardInfoCommon, awardInfoCommonSchema, awardInfoIndividualCommonSchema, awardInfoIndividualSchema, awardInfoTeamCommonSchema, awardInfoTeamSchema, AwardPlayer, awardPlayerSchema (+25 more)

### Community 106 - "Community 106"

Cohesion: 0.39
Nodes (7): CupGame, cupQualifiers(), CupStage, cupStageName(), cupStandings(), NbaCup, NbaCup()

### Community 107 - "Community 107"

Cohesion: 0.17
Nodes (11): dropbox, Buffer, CLIENT_ID, dropboxStream(), getAuthenticationUrl(), handleStreamError(), consumeDropboxAuthState(), createDropboxAuthState() (+3 more)

### Community 108 - "Community 108"

Cohesion: 0.16
Nodes (13): parseCliParams(), BUILD_DIR, getIpAddress(), listen(), listenOnAvailablePort(), mimeTypes, PREFIXES_STATIC, sendFile() (+5 more)

### Community 109 - "Community 109"

Cohesion: 0.28
Nodes (6): countBy(), getValueByIteratee(), maxMinByFactory(), getAbbrevsUsedMultipleTimes(), divideChancesOverTiedTeams(), teams

### Community 110 - "Community 110"

Cohesion: 0.16
Nodes (18): AXIS, baseball(), BaseballColors, CONFIG, defs(), FADE_SIN, frame(), ORIENT (+10 more)

### Community 111 - "Community 111"

Cohesion: 0.12
Nodes (16): @uiw/color-convert, @uiw/react-color-editable-input, @uiw/react-color-editable-input-rgba, @uiw/react-color-hue, @uiw/react-color-saturation, @uiw/react-color-swatch, ColorPicker(), ColorSelectionOptions (+8 more)

### Community 112 - "Community 112"

Cohesion: 0.20
Nodes (16): formatList(), formatScoringSummaryEvent(), ScoringSummary(), BoxScorePlayer, BoxScoreTeam, formatRunners(), getBaseName(), getDirectionInfield() (+8 more)

### Community 113 - "Community 113"

Cohesion: 0.14
Nodes (16): PlayerAwardSimple, formatPlayerAwardName(), formatTeamNumber(), leaderAwardCategories, ordinal(), playoffRoundName(), awardsEnd, awardsStart (+8 more)

### Community 114 - "Community 114"

Cohesion: 0.70
Nodes (4): checkNaNs(), checkObject(), wrap(), wrapperNaNChecker()

### Community 117 - "Community 117"

Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, allowJs, erasableSyntaxOnly, esModuleInterop, isolatedModules, module, moduleDetection (+10 more)

### Community 119 - "Community 119"

Cohesion: 0.14
Nodes (7): fake-indexeddb, IteratorConstructor, IterValue, return(), SetReadOperations, ZipValues, overridePostMessage()

### Community 120 - "Community 120"

Cohesion: 0.17
Nodes (10): zustand, UpdateEvent, UpdateEvents, Context, InitArgs, Action, ErrorMessage(), State (+2 more)

### Community 121 - "Community 121"

Cohesion: 0.25
Nodes (7): DIFFICULTY, AchievementWhen, add(), check(), Difficulty, getAll(), achievements

### Community 123 - "Community 123"

Cohesion: 0.23
Nodes (14): apl1B(), apl2B(), aplC(), aplLF(), aplP(), calculateWAR(), fr1B(), fr2B() (+6 more)

### Community 124 - "Community 124"

Cohesion: 0.10
Nodes (17): getPts(), Play, PlayEvent, PlayEventNonPenalty, PlayEventPenalty, PlayState, PlayType, SAFETY_IS_POSSIBLE (+9 more)

### Community 125 - "Community 125"

Cohesion: 0.13
Nodes (15): scripts, bench, build, deploy, deploy-all, dev, format, lint (+7 more)

### Community 127 - "Community 127"

Cohesion: 0.22
Nodes (10): DraftLotteryResultArray, draftLotteryProbsTooSlow(), getDraftLotteryProbs(), hypergeometricPMF(), monteCarloLotteryProbs(), nChooseK(), PickIndexes, simLottery() (+2 more)

### Community 128 - "Community 128"

Cohesion: 0.12
Nodes (29): Relative, addRelative(), addRelatives(), applyNewCountry(), getRelatives(), getSuffix(), hasRelative(), makeBrother() (+21 more)

### Community 129 - "Community 129"

Cohesion: 0.18
Nodes (9): getStickyColsClass(), StickyCols, loadStateFromCache(), LoadStateFromCacheProps, State, SettingsCache, useDataTableState(), StickyColsPlusCheckboxes (+1 more)

### Community 130 - "Community 130"

Cohesion: 0.20
Nodes (12): applyMatrix(), Vec3, AXIS, basketball(), BasketballColors, buildSeams(), CONFIG, defs() (+4 more)

### Community 131 - "Community 131"

Cohesion: 0.42
Nodes (9): react-addons-text-content, normalizeIntl(), SortType, createFilterFunction(), Direction, evalFilter(), getSearchVal(), getSortVal() (+1 more)

### Community 132 - "Community 132"

Cohesion: 0.18
Nodes (15): MenuItemHeader, MenuItemText, NavBar(), PhaseStatusBlock(), DropdownLinks, DropdownLinksProps, getText(), makeAnchorProps() (+7 more)

### Community 134 - "Community 134"

Cohesion: 0.07
Nodes (45): facilitiesEffectAttendance(), facilitiesEffectMood(), levelToEffect(), scoutingEffectCutoff(), scoutingEffectStddev(), choice(), gauss(), heightDist() (+37 more)

### Community 135 - "Community 135"

Cohesion: 0.07
Nodes (40): canSignFreeAgentsInPhase(), ContractInfo, Team, getOwedContracts(), getPayrollAmount(), payContracts(), accept(), cancel() (+32 more)

### Community 136 - "Community 136"

Cohesion: 0.35
Nodes (10): gameAttributeName(), bulkDelete(), deleteScheduledEvent(), EVENT_TYPES, formatSeason(), ScheduledEvents(), showDeleteUndoNotification(), teamInfoKey() (+2 more)

### Community 138 - "Community 138"

Cohesion: 0.23
Nodes (9): getLogoSpinnerUrl(), LogoSpinner(), Colors, renderSport(), LOGO_SPINNERS, r3(), renderSpinner(), SpinnerOptions (+1 more)

### Community 140 - "Community 140"

Cohesion: 0.20
Nodes (10): SKILLS, categories, Category, getInitialState(), LookingForState, positionNames, positions, SetLookingForState (+2 more)

### Community 143 - "Community 143"

Cohesion: 0.20
Nodes (7): GAME_NAME, NagModal(), Props, GameLinks(), GoldPitchText(), ads, Skyscraper

### Community 144 - "Community 144"

Cohesion: 0.22
Nodes (8): compilerOptions, composite, jsx, lib, types, extends, include, ./tsconfig.base.json

### Community 145 - "Community 145"

Cohesion: 0.32
Nodes (3): InvalidateOn, Undo, UndoLog

### Community 146 - "Community 146"

Cohesion: 0.25
Nodes (7): compilerOptions, composite, lib, types, exclude, extends, ./tsconfig.base.json

### Community 147 - "Community 147"

Cohesion: 0.33
Nodes (5): ignorePatterns, printWidth, $schema, sortPackageJson, useTabs

### Community 149 - "Community 149"

Cohesion: 0.60
Nodes (3): blankInfo(), iterate2(), iterate()

### Community 150 - "Community 150"

Cohesion: 0.70
Nodes (4): initForm(), log(), logDiv, upgrade1000()

### Community 151 - "Community 151"

Cohesion: 0.40
Nodes (4): colleges, nflCounts, overrides, skip

### Community 154 - "Community 154"

Cohesion: 0.62
Nodes (4): logAction(), logLotteryChances(), logLotteryTxt(), logLotteryWinners()

### Community 155 - "Community 155"

Cohesion: 0.43
Nodes (5): PlayerRatings, bonuses, info, ovr(), pos()

## Knowledge Gaps

- **26 isolated node(s):** `./tsconfig.base.json`, `./tsconfig.base.json`, `bootstrap`, `concurrently`, `flag-icons` (+21 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1364 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 3` to `Community 0`, `Community 1`, `Community 129`, `Community 131`, `Community 132`, `Community 5`, `Community 136`, `Community 9`, `Community 138`, `Community 140`, `Community 13`, `Community 14`, `Community 16`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 26`, `Community 27`, `Community 32`, `Community 34`, `Community 41`, `Community 43`, `Community 48`, `Community 50`, `Community 51`, `Community 55`, `Community 58`, `Community 67`, `Community 71`, `Community 76`, `Community 78`, `Community 85`, `Community 90`, `Community 92`, `Community 94`, `Community 95`, `Community 100`, `Community 103`, `Community 105`, `Community 111`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `./tsconfig.base.json`, `./tsconfig.base.json`, `bootstrap` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04949748743718593 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `Community 8` to `Community 128`, `Community 134`, `Community 7`, `Community 6`, `Community 10`, `Community 17`, `Community 21`, `Community 23`, `Community 24`, `Community 28`, `Community 29`, `Community 32`, `Community 44`, `Community 47`, `Community 50`, `Community 52`, `Community 57`, `Community 60`, `Community 61`, `Community 75`, `Community 77`, `Community 80`, `Community 84`, `Community 87`, `Community 89`, `Community 93`, `Community 94`, `Community 95`, `Community 97`, `Community 101`, `Community 107`, `Community 109`, `Community 113`, `Community 127`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09815078236130868 - nodes in this community are weakly interconnected._
- **Why does `bySport()` connect `Community 6` to `Community 0`, `Community 1`, `Community 128`, `Community 3`, `Community 5`, `Community 134`, `Community 7`, `Community 8`, `Community 10`, `Community 140`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 23`, `Community 24`, `Community 27`, `Community 28`, `Community 31`, `Community 32`, `Community 34`, `Community 35`, `Community 37`, `Community 38`, `Community 42`, `Community 47`, `Community 49`, `Community 53`, `Community 54`, `Community 55`, `Community 56`, `Community 57`, `Community 58`, `Community 59`, `Community 64`, `Community 65`, `Community 67`, `Community 68`, `Community 71`, `Community 73`, `Community 75`, `Community 78`, `Community 81`, `Community 82`, `Community 84`, `Community 85`, `Community 86`, `Community 94`, `Community 95`, `Community 97`, `Community 98`, `Community 99`, `Community 105`, `Community 107`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.0398051948051948 - nodes in this community are weakly interconnected._
