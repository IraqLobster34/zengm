import selectPlayer from "../draft/selectPlayer.ts";
import { beforeEach, afterEach, expect, test } from "vitest";
import {
	roundRobin,
	collegeEligibility,
	nbaDraftEligible,
	WORLD_TIDS,
	type BasketballWorld,
	type WorldTeam,
} from "../../../common/basketballWorld.ts";
import { getDefaultMods } from "../../../common/mods.ts";
import { resetG, resetCache } from "../../../test/helpers.ts";
import { idb } from "../../db/index.ts";
import g from "../../util/g.ts";
import player from "../player/index.ts";
import {
	advanceWorld,
	automateWorldDevelopment,
	finishWorldDraft,
	getSelectionScores,
	getWorld,
	makeWorldSchedule,
	prepareWorldDraft,
	startWorldSeason,
	syncWorldCalendar,
	worldAction,
} from "./index.ts";
import { simulateWorldGame } from "./sim.ts";
import type { Player } from "../../../common/types.ts";

const team = (id: number, conference = "A"): WorldTeam => ({
	id,
	name: `College ${id}`,
	abbrev: `C${id}`,
	conference,
	prestige: 50,
	budget: 1000000,
	spent: 0,
	won: 0,
	lost: 0,
	confWon: 0,
	confLost: 0,
	pf: 0,
	pa: 0,
	coach: "Coach",
	coaching: 60,
});
let players: Player[];
beforeEach(async () => {
	resetG();
	g.setWithoutSavingToDB("mods", {
		...getDefaultMods(),
		"basketball-world": { enabled: true, version: "1.0.0" },
	});
	g.setWithoutSavingToDB("basketballWorld", undefined);
	const schools = Array.from({ length: 8 }, (_, i) =>
		team(i, i < 4 ? "A" : "B"),
	);
	const affiliates = Array.from({ length: 4 }, (_, i) => ({
		...team(i),
		parentTid: i,
	}));
	players = [];
	for (const competition of ["college", "gLeague"] as const) {
		for (const t of competition === "college" ? schools : affiliates) {
			for (let i = 0; i < 10; i++) {
				const p = player.generate(
					WORLD_TIDS[competition],
					20,
					g.get("season"),
					false,
					50,
				) as Player;
				p.pid = players.length;
				await player.develop(p, 0, false, 50, true);
				p.ratings[0].pot = 60;
				p.basketballPathway = {
					status: competition,
					enrolled: g.get("season") - 2,
					highSchoolYear: g.get("season") - 3,
					seasonsPlayed: 2,
					schoolId: competition === "college" ? t.id : undefined,
					affiliateId: competition === "gLeague" ? t.id : undefined,
					gpa: 3,
					redshirt: false,
					nil: 0,
					interest: {},
					history: [],
				};
				p.college = t.name;
				if (competition === "gLeague") {
					p.draft.year = g.get("season") - 1;
				}
				players.push(p);
			}
		}
	}
	await resetCache({ players });
	const world: BasketballWorld = {
		version: 1,
		rules: "test",
		season: g.get("season"),
		day: 0,
		stage: "regular",
		schools,
		affiliates,
		games: makeWorldSchedule(schools, affiliates),
		tournaments: [],
		userSchoolId: 0,
		recruitingPoints: 100,
		draftPrepared: false,
		offseasonProcessed: false,
		archives: [],
		news: [],
	};
	g.setWithoutSavingToDB("basketballWorld", world);
});
afterEach(() => {
	g.setWithoutSavingToDB("basketballWorld", undefined);
	g.setWithoutSavingToDB("mods", undefined);
});

test("round-robin schedules avoid self games and double bookings", () => {
	for (const round of roundRobin([0, 1, 2, 3, 4], 12)) {
		expect(new Set(round.flat()).size).toBe(round.length * 2);
		expect(round.every(([a, b]) => a !== b)).toBe(true);
	}
});

test("eligibility separates academic status, enrollment clock, and NBA entry age", () => {
	const path = players[0]!.basketballPathway!;
	expect(collegeEligibility(path, g.get("season")).eligible).toBe(true);
	expect(
		collegeEligibility({ ...path, gpa: 1.9 }, g.get("season")).eligible,
	).toBe(false);
	expect(
		collegeEligibility({ ...path, seasonsPlayed: 4 }, g.get("season")).eligible,
	).toBe(false);
	expect(
		collegeEligibility({ ...path, enrolled: 2027, seasonsPlayed: 4 }, 2031)
			.eligible,
	).toBe(true);
	expect(nbaDraftEligible(2009, 2027, 2027)).toBe(false);
	expect(nbaDraftEligible(2008, 2026, 2027)).toBe(true);
});

test("secondary box scores conserve team points and minutes", () => {
	let seed = 17;
	const random = () => {
		seed = (seed * 16807) % 2147483647;
		return seed / 2147483647;
	};
	for (const competition of ["college", "gLeague"] as const) {
		const result = simulateWorldGame(
			players.slice(0, 10),
			players.slice(10, 20),
			competition,
			false,
			random,
		);
		expect(result.pts[0]).not.toBe(result.pts[1]);
		for (const side of [0, 1] as const) {
			expect(result.box[side].reduce((sum, row) => sum + row.pts, 0)).toBe(
				result.pts[side],
			);
			expect(
				result.box[side].reduce((sum, row) => sum + row.min, 0),
			).toBeCloseTo(
				((competition === "college" ? 40 : 48) + 5 * result.overtimes) * 5,
			);
		}
	}
});

test("a complete college/G League season persists champions, statistics, and a unique NBA draft pool", async () => {
	await advanceWorld(164);
	const world = getWorld()!;
	expect(world.stage).toBe("offseason");
	expect(
		world.tournaments.find((t) => t.stage === "national")?.champion,
	).toBeDefined();
	expect(
		world.tournaments.find((t) => t.stage === "playoffs")?.champion,
	).toBeDefined();
	expect(world.games.every((game) => game.pts)).toBe(true);
	expect(
		(await idb.cache.gameAttributes.get("basketballWorld"))?.value.day,
	).toBe(164);
	expect(getSelectionScores(world.schools, world.games).size).toBe(8);
	const before = players.length;
	await prepareWorldDraft();
	const prospects = await idb.cache.players.indexGetAll("playersByTid", -2);
	expect(prospects.length).toBeGreaterThan(0);
	expect(new Set(prospects.map((p) => p.pid)).size).toBe(prospects.length);
	expect(prospects.every((p) => p.basketballPathway!.history[0]!.gp > 0)).toBe(
		true,
	);
	await prepareWorldDraft();
	expect((await idb.cache.players.getAll()).length).toBe(before);
});

test("secondary competition management and manual simulation are unavailable", async () => {
	for (const type of [
		"manageCollege",
		"recruit",
		"redshirt",
		"assign",
		"recall",
		"callUp",
		"advance",
		"initialize",
	]) {
		await expect(
			worldAction({ type, pid: players[0]!.pid, days: 164 }),
		).rejects.toThrow("managed automatically");
	}
	expect(getWorld()?.day).toBe(0);
	expect(players[0]?.basketballPathway?.redshirt).toBe(false);
});

test("drafted players retain their ID and college history after the draft", async () => {
	await prepareWorldDraft();
	const prospect = (
		await idb.cache.players.indexGetAll("playersByTid", -2)
	)[0]!;
	const id = prospect.pid;
	prospect.tid = 1;
	prospect.draft.round = 1;
	prospect.draft.pick = 1;
	prospect.basketballPathway!.status = "nba";
	await idb.cache.players.put(prospect);
	await finishWorldDraft();
	const restored = await idb.cache.players.get(id);
	expect(restored?.tid).toBe(1);
	expect(restored?.basketballPathway?.history.length).toBeGreaterThan(0);
	expect(
		(await idb.cache.players.indexGetAll("playersByTid", WORLD_TIDS.gLeague))
			.length,
	).toBeGreaterThan(40);
	expect(getWorld()?.offseasonProcessed).toBe(true);
});

test("the ordinary NBA draft preserves a prospect and the world rolls into another season", async () => {
	await prepareWorldDraft();
	const prospect = (
		await idb.cache.players.indexGetAll("playersByTid", -2)
	)[0]!;
	const pid = prospect.pid;
	const career = structuredClone(prospect.basketballPathway!.history);
	g.setWithoutSavingToDB("phase", 5);
	const pick = {
		dpid: 0,
		tid: 1,
		originalTid: 1,
		season: g.get("season"),
		round: 1,
		pick: 1,
	};
	await idb.cache.draftPicks.add(pick);
	expect(await selectPlayer(pick, pid)).toBe(true);
	expect(await selectPlayer(pick, pid)).toBe(false);
	await finishWorldDraft();
	const previousSeason = g.get("season");
	g.setWithoutSavingToDB("season", previousSeason + 1);
	await startWorldSeason();
	const world = getWorld()!;
	expect(world.season).toBe(previousSeason + 1);
	expect(world.day).toBe(0);
	expect(world.archives[0]?.draftPids).toContain(pid);
	const drafted = await idb.cache.players.get(pid);
	expect(drafted?.tid).toBe(1);
	expect(drafted?.basketballPathway?.history).toEqual(career);
	const college = await idb.cache.players.indexGetAll(
		"playersByTid",
		WORLD_TIDS.college,
	);
	expect(college.length).toBe(8 * 13);
	expect(college.every((p) => p.basketballPathway?.status === "college")).toBe(
		true,
	);
	await advanceWorld(7);
	expect(getWorld()?.day).toBe(7);
});

test("G League staff assign young reserves and automatically recall them for the postseason", async () => {
	for (const p of players.slice(0, 15)) {
		p.tid = 0;
		p.basketballPathway!.status = "nba";
		await idb.cache.players.put(p);
	}
	g.setWithoutSavingToDB("phase", 1);
	await automateWorldDevelopment();
	const roster = await idb.cache.players.indexGetAll("playersByTid", 0);
	const assigned = roster.filter((p) => p.basketballPathway?.assigned);
	expect(assigned.length).toBeGreaterThan(0);
	expect(assigned.length).toBeLessThanOrEqual(2);
	expect(
		roster.filter((p) => !p.basketballPathway?.assigned).length,
	).toBeGreaterThanOrEqual(10);
	expect(assigned.every((p) => p.tid === 0 && p.contracts.length === 0)).toBe(
		true,
	);
	g.setWithoutSavingToDB("phase", 3);
	await automateWorldDevelopment();
	expect(
		(await idb.cache.players.indexGetAll("playersByTid", 0)).some(
			(p) => p.basketballPathway?.assigned,
		),
	).toBe(false);
});

test("retired recruits cannot reappear in recruiting or college rosters", async () => {
	const p = players[0]!;
	p.tid = -3;
	p.basketballPathway!.status = "portal";
	await idb.cache.players.put(p);
	getWorld()!.offseasonProcessed = true;
	await expect(
		worldAction({ type: "recruit", pid: p.pid, nil: 0 }),
	).rejects.toThrow();
});

test("college programs fill their next recruiting class automatically within roster and NIL limits", async () => {
	await prepareWorldDraft();
	await finishWorldDraft();
	const roster = await idb.cache.players.indexGetAll(
		"playersByTid",
		WORLD_TIDS.college,
	);
	for (const school of getWorld()!.schools) {
		expect(
			roster.filter((p) => p.basketballPathway?.schoolId === school.id).length,
		).toBe(13);
		expect(school.spent).toBeLessThanOrEqual(school.budget);
	}
});

test("secondary seasons keep pace with NBA calendar days and finish automatically", async () => {
	g.setWithoutSavingToDB("phase", 1);
	await idb.cache.schedule.add({ gid: 0, homeTid: 0, awayTid: 1, day: 100 });
	await syncWorldCalendar(50);
	expect(getWorld()?.day).toBe(82);
	await syncWorldCalendar(50);
	expect(getWorld()?.day).toBe(82);
	await syncWorldCalendar(100);
	expect(getWorld()?.day).toBe(164);
	expect(
		getWorld()?.tournaments.find((t) => t.stage === "playoffs")?.champion,
	).toBeDefined();
});
