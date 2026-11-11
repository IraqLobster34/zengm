import { beforeEach, expect, test, vi } from "vitest";
import { resetG, resetCache } from "../../../test/helpers.ts";
import { g, helpers } from "../../util/index.ts";
import { PHASE } from "../../../common/constants.ts";
import {
	advanceCup,
	canStartCup,
	makeCupSchedule,
	updateCup,
	grantCupAwards,
	selectCupMvp,
	getCupSeason,
	drawCupGroups,
	loadCupDrawOrder,
} from "./nbaCup.ts";
import { idb } from "../../db/index.ts";
import writeTeamStats from "../game/writeTeamStats.ts";
import writePlayerStats from "../game/writePlayerStats.ts";
import { cupQualifiers, cupStandings } from "../../../common/nbaCup.ts";
import newScheduleGood from "./newScheduleGood.ts";
import addDaysToSchedule from "./addDaysToSchedule.ts";

beforeEach(() => {
	resetG();
	g.setWithoutSavingToDB("nbaCup", null);
	g.setWithoutSavingToDB("nbaCupHistory", {});
});

test("archived cup wins remain in team history and count separately from championships", async () => {
	const { getHistoryTeam } = await import("../../views/teamHistory.ts");
	const cup = makePlan().cup;
	cup.stage = "complete";
	cup.champion = 0;
	g.setWithoutSavingToDB("nbaCup", { ...cup, season: 2027 });
	g.setWithoutSavingToDB("nbaCupHistory", {
		2026: { ...cup, season: 2026 },
		2025: { ...cup, season: 2025, champion: 1 },
	});
	expect(getCupSeason(2026)?.champion).toBe(0);
	expect(getCupSeason(2024)).toBeUndefined();
	const seasons = [2025, 2026, 2027].map((season) => ({
		season,
		tid: 0,
		abbrev: "ATL",
		won: 40,
		lost: 42,
		tied: 0,
		otl: 0,
		playoffRoundsWon: -1,
	}));
	const history = getHistoryTeam(
		seasons as any,
		Object.assign(new Map<number, false>(), {
			defaultKey: 2027,
			get: () => false as const,
		}),
	);
	expect(history.nbaCupWins).toBe(2);
	expect(history.championships).toBe(0);
	expect(
		history.history.filter((row) => row.nbaCupWinner).map((row) => row.season),
	).toEqual([2027, 2026]);
});

test("cup MVP uses the tournament, winner medals include the final roster, and awards are idempotent", async () => {
	await resetCache({});
	const cup = makePlan().cup;
	cup.stage = "complete";
	cup.champion = 0;
	const boxPlayer = (pid: number, pts: number, min = 20) => ({
		pid,
		name: `Player ${pid}`,
		min,
		pts,
		fg: 0,
		fga: 0,
		ft: 0,
		fta: 0,
		orb: 0,
		drb: 0,
		ast: 0,
		stl: 0,
		blk: 0,
		tov: 0,
		pf: 0,
	});
	const games = [
		{
			gid: 90,
			nbaCup: "group",
			teams: [
				{ tid: 0, players: [boxPlayer(1, 40), boxPlayer(2, 0)] },
				{ tid: 1, players: [boxPlayer(3, 100)] },
			],
		},
		{
			gid: 91,
			nbaCup: "final",
			teams: [
				{
					tid: 0,
					players: [boxPlayer(1, 5), boxPlayer(2, 25), boxPlayer(4, 0, 0)],
				},
				{ tid: 1, players: [boxPlayer(3, 100)] },
			],
		},
	];
	cup.games = games.map((game) => ({
		gid: game.gid,
		stage: game.nbaCup as "group" | "final",
		day: 1,
		homeTid: 0,
		awayTid: 1,
		pts: [110, 100],
	}));
	expect(selectCupMvp(cup, games as any)).toEqual({
		pid: 1,
		tid: 0,
		name: "Player 1",
	});
	await idb.cache.games.putAll(games as any);
	await idb.cache.players.putAll(
		[1, 2, 3, 4].map((pid) => ({ pid, awards: [] })) as any,
	);
	expect(await grantCupAwards(cup)).toBe(true);
	expect(
		(await idb.cache.players.get(1))!.awards.map((award) => award.type),
	).toEqual(["NBA Cup Winner", "NBA Cup MVP"]);
	expect((await idb.cache.players.get(4))!.awards).toEqual([
		{ season: cup.season, type: "NBA Cup Winner" },
	]);
	expect((await idb.cache.players.get(3))!.awards).toEqual([]);
	expect(await grantCupAwards(structuredClone(cup))).toBe(false);
	// Even if an old save loses the completion flag, player awards deduplicate.
	cup.awardsGranted = false;
	await grantCupAwards(cup);
	expect((await idb.cache.players.get(1))!.awards).toHaveLength(2);
});

test("championship leaves team finances, records, and player season stats untouched", async () => {
	await resetCache({});
	const result = { nbaCup: "final", team: [{ id: 0 }, { id: 1 }] };
	expect(await writeTeamStats(result)).toBe(g.get("defaultStadiumCapacity"));
	const output = await writePlayerStats([result], { hostID: 0 });
	expect(output.injuryTexts).toEqual([]);
	expect(await idb.cache.teamSeasons.getAll()).toEqual([]);
	expect(await idb.cache.teamStats.getAll()).toEqual([]);
	expect(await idb.cache.players.getAll()).toEqual([]);
});

test("saved results advance once even when the last group night is simulated game by game", async () => {
	await resetCache({});
	const { cup } = makePlan();
	cup.season = g.get("season");
	g.setWithoutSavingToDB("nbaCup", cup);
	for (const [i, game] of cup.games.entries()) {
		// Only these fields are consumed by the cup result reader.
		await idb.cache.games.put({
			gid: game.gid,
			teams: [{ pts: 100 }, { pts: 90 }],
		} as any);
		await updateCup({ hostID: 0 });
		const schedule = await idb.cache.schedule.getAll();
		expect(schedule).toHaveLength(i === 59 ? 26 : 0);
	}
	await updateCup({ hostID: 0 });
	expect(await idb.cache.schedule.getAll()).toHaveLength(26);
	expect(g.get("nbaCup")!.stage).toBe("quarterfinal");
});

const makePlan = (seeded = false) => {
	const teams = helpers
		.getTeamsDefault()
		.map((t) => ({ tid: t.tid + 10, seasonAttrs: { cid: t.cid, did: t.did } }));
	const { tids } = newScheduleGood(teams, {
		divs: g.get("divs"),
		numGames: 76,
		numGamesDiv: g.get("numGamesDiv"),
		numGamesConf: g.get("numGamesConf"),
	});
	const base = addDaysToSchedule(
		tids.map(([homeTid, awayTid]) => ({ homeTid, awayTid })),
	);
	return {
		...makeCupSchedule(
			base,
			teams,
			2027,
			1000,
			seeded ? teams.map((t) => t.tid).toReversed() : [],
		),
		teams,
	};
};

test("seeded groups draw exactly one team from each prior-season pot in their conference", () => {
	const teams = Array.from({ length: 30 }, (_, i) => ({
		tid: 40 + i * 7,
		seasonAttrs: { cid: i < 15 ? 9 : 31 },
	}));
	const ranking = teams.map((t) => t.tid).toReversed();
	const original = [...ranking];
	for (let draw = 0; draw < 10; draw++) {
		const result = drawCupGroups(teams, ranking);
		expect(result.unseededTids).toEqual([]);
		expect(new Set(result.groups.flatMap((group) => group.tids)).size).toBe(30);
		for (const conference of result.pots) {
			const expected = ranking.filter(
				(tid) =>
					teams.find((t) => t.tid === tid)!.seasonAttrs.cid === conference.cid,
			);
			expect(conference.tids).toEqual(
				Array.from({ length: 5 }, (_, i) => expected.slice(i * 3, i * 3 + 3)),
			);
			for (const group of result.groups.filter(
				(group) => group.cid === conference.cid,
			)) {
				expect(group.tids).toHaveLength(5);
				for (const pot of conference.tids) {
					expect(group.tids.filter((tid) => pot.includes(tid))).toHaveLength(1);
				}
			}
		}
	}
	expect(ranking).toEqual(original);
});

test("a first season uses randomized pots; teams without history fill the bottom slots", () => {
	const { teams, cup } = makePlan();
	expect(cup.draw!.previousSeason).toBe(2026);
	expect(cup.draw!.unseededTids.toSorted()).toEqual(
		teams.map((t) => t.tid).toSorted(),
	);
	const missing = [...new Set(teams.map((t) => t.seasonAttrs.cid))].map(
		(cid) => teams.find((t) => t.seasonAttrs.cid === cid)!.tid,
	);
	const ranking = teams
		.map((t) => t.tid)
		.filter((tid) => !missing.includes(tid));
	const result = drawCupGroups(teams, ranking);
	expect(result.unseededTids.toSorted()).toEqual(missing.toSorted());
	for (const conference of result.pots) {
		const missingTid = teams.find(
			(t) => t.seasonAttrs.cid === conference.cid && missing.includes(t.tid),
		)!.tid;
		expect(conference.tids[4]).toContain(missingTid);
		for (const group of result.groups.filter(
			(group) => group.cid === conference.cid,
		)) {
			for (const pot of conference.tids) {
				expect(group.tids.filter((tid) => pot.includes(tid))).toHaveLength(1);
			}
		}
	}
});

test("draw seeding reads last season's regular-season standings and ignores teams outside the draw", async () => {
	const { teams } = makePlan();
	const { default: team } = await import("../team/index.ts");
	const historical = teams.map((t, i) => ({
		tid: t.tid,
		seasonAttrs: {
			...t.seasonAttrs,
			won: 20 + i,
			lost: 62 - i,
			tied: 0,
			otl: 0,
			winp: (20 + i) / 82,
			pts: 0,
			wonDiv: 0,
			lostDiv: 0,
			tiedDiv: 0,
			otlDiv: 0,
			wonConf: 0,
			lostConf: 0,
			tiedConf: 0,
			otlConf: 0,
		},
		stats: { gp: 82, pts: 100, oppPts: 100 },
	}));
	const spy = vi
		.spyOn(team, "getFormattedAll")
		.mockResolvedValue(historical as any);
	try {
		const eligible = teams.slice(1);
		const ranking = await loadCupDrawOrder(eligible, 2027);
		expect(spy).toHaveBeenCalledWith(
			expect.objectContaining({ season: 2026, showNoStats: true }),
		);
		expect(ranking).not.toContain(teams[0]!.tid);
		for (const cid of new Set(eligible.map((t) => t.seasonAttrs.cid))) {
			const expected = eligible
				.filter((t) => t.seasonAttrs.cid === cid)
				.map((t) => t.tid)
				.toReversed();
			expect(ranking.filter((tid) => expected.includes(tid))).toEqual(expected);
		}
		spy.mockResolvedValue([]);
		expect(await loadCupDrawOrder(teams, 2027)).toEqual([]);
	} finally {
		spy.mockRestore();
	}
});

test("cup supports only new 82-game seasons in two 15-team conferences", () => {
	const { teams } = makePlan();
	g.setWithoutSavingToDB("phase", PHASE.PRESEASON);
	expect(canStartCup(teams)).toBe(true);
	expect(canStartCup(teams.slice(1))).toBe(false);
	g.setWithoutSavingToDB("phase", PHASE.REGULAR_SEASON);
	expect(canStartCup(teams)).toBe(false);
});

test("every group plays a balanced four-game round robin with no day conflicts", () => {
	const { cup, schedule, teams } = makePlan();
	expect(cup.games).toHaveLength(60);
	for (const { tid } of teams) {
		expect(cup.games.filter((game) => game.homeTid === tid)).toHaveLength(2);
		expect(cup.games.filter((game) => game.awayTid === tid)).toHaveLength(2);
		const opponents = cup.games
			.filter((game) => game.homeTid === tid || game.awayTid === tid)
			.map((game) => (game.homeTid === tid ? game.awayTid : game.homeTid));
		expect(new Set(opponents).size).toBe(4);
	}
	for (const day of new Set(schedule.map((game) => game.day))) {
		const tids = schedule
			.filter((game) => game.day === day)
			.flatMap((game) => [game.homeTid, game.awayTid]);
		expect(new Set(tids).size).toBe(tids.length);
	}
});

test("full cup survives serialization and gives all 30 teams exactly 82 counting games", () => {
	const plan = makePlan(true);
	expect(plan.cup.draw!.unseededTids).toEqual([]);
	let cup = plan.cup;
	const schedule = [...plan.schedule];
	// Before results exist, no knockout matches may be generated.
	expect(advanceCup(cup)).toEqual([]);
	for (let stage = 0; stage < 4; stage++) {
		for (const game of cup.games.filter((game) => game.stage === cup.stage)) {
			game.pts = [110, 100];
		}
		// Verify the exact JSON round trip used by league exports, not just cloning.
		// eslint-disable-next-line unicorn/prefer-structured-clone
		cup = JSON.parse(JSON.stringify(cup));
		schedule.push(...advanceCup(cup));
	}
	expect(cup.stage).toBe("complete");
	expect(cup.champion).toBeDefined();
	expect(cup.games).toHaveLength(67);
	expect(advanceCup(cup)).toEqual([]);
	for (const { tid } of plan.teams) {
		expect(
			schedule.filter(
				(game) =>
					game.nbaCup !== "final" &&
					(game.homeTid === tid || game.awayTid === tid),
			),
		).toHaveLength(82);
	}
	expect(new Set(schedule.map((game) => game.gid)).size).toBe(schedule.length);
	const chronological = [...schedule].sort((a, b) => a.gid! - b.gid!);
	expect(chronological.map((game) => game.day)).toEqual(
		chronological.map((game) => game.day).sort((a, b) => a - b),
	);
	for (const day of new Set(schedule.map((game) => game.day))) {
		const tids = schedule
			.filter((game) => game.day === day)
			.flatMap((game) => [game.homeTid, game.awayTid]);
		expect(new Set(tids).size).toBe(tids.length);
	}
});

test("head-to-head breaks a two-team group tie; each conference sends three winners and a wildcard", () => {
	const { cup } = makePlan();
	for (const game of cup.games) {
		game.pts = [100, 90];
	}
	const group = cup.groups[0]!;
	// All five finish 2-2: point differential/points/draw order resolve this tie.
	expect(
		cupStandings(cup, group.tids).every(
			(row) => row.won === 2 && row.lost === 2,
		),
	).toBe(true);
	const [a, b] = group.tids;
	const pair = cup.games.find(
		(game) => [a, b].includes(game.homeTid) && [a, b].includes(game.awayTid),
	)!;
	const two = cupStandings(cup, [a!, b!]);
	expect(two[0]!.tid).toBe(pair.homeTid);
	const seeds = cupQualifiers(cup);
	expect(seeds).toHaveLength(2);
	expect(new Set(seeds.flat()).size).toBe(8);
	for (const conf of seeds) {
		const groups = cup.groups.filter((group) => group.tids.includes(conf[0]!));
		const cid = groups[0]!.cid;
		for (const group of cup.groups.filter((group) => group.cid === cid)) {
			expect(conf.slice(0, 3)).toContain(cupStandings(cup, group.tids)[0]!.tid);
		}
	}
});
